import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FamiliesService } from '@src/modules/families/common/families.service';
import { FamilyAccountTypes } from '@src/modules/families/common/family-account-types.enum';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { AppleLatestReceiptInfoDto } from '../rest/dto/apple-latest-receipt-info.dto';
import { ApplePaymentEventDto } from '../rest/dto/apple-payment-event.dto';
import { AppleInAppPurchasesEnvironments } from './apple-in-app-purchases-environments.enum';
import {
  AppleInAppPurchasesClient,
  VerifyReceiptDataResponse,
} from './apple-in-app-purchases.client';
import { NotificationEventTypes } from './notification-event-types.enum';
import { PaymentsRepository } from './payments.repository';
import * as googlePlayCreds from '../../../../google-play.json';
import GooglePlayVerifier from 'google-play-billing-validator';
import { PaymentTypes } from './payment-types.enum';
import { GooglePlayPaymentEventDto } from '../rest/dto/google-play-payment-event.dto';
import { GoogleNotificationTypes } from '../rest/dto/google-notification-types.enum';

@Injectable()
export class PaymentsService {
  private googlePlayVerifier = new GooglePlayVerifier({
    email: googlePlayCreds.client_email,
    key: googlePlayCreds.private_key,
  });

  constructor(
    @InjectRepository(PaymentsRepository)
    private paymentsRepository: PaymentsRepository,
    private familiesService: FamiliesService,
    private appleInAppPurchasesClient: AppleInAppPurchasesClient,
    private configService: ConfigService,
  ) {}

  async verifyApplePremiumPurchase(
    receiptData: string,
    parent: ParentEntity,
  ): Promise<boolean> {
    const verifyResponse = await this.appleInAppPurchasesClient.verifyReceiptData(
      receiptData,
    );
    this.checkForRequestError(verifyResponse, receiptData);
    this.checkIfTestFamilyForSandbox(verifyResponse, parent.familyId);

    const latestReceiptInfo = verifyResponse.latest_receipt_info[0];
    const subscriptionExpiresAt = new Date(+latestReceiptInfo.expires_date_ms);
    this.checkForExpiration(subscriptionExpiresAt);

    const subscriptionId = latestReceiptInfo.original_transaction_id;
    await this.checkFamilyToSubscriptionRelation(subscriptionId, parent);

    await this.paymentsRepository.upsertPayment({
      transactionId: latestReceiptInfo.transaction_id,
      subscriptionId,
      expiresAt: subscriptionExpiresAt,
      purchasedAt: new Date(+latestReceiptInfo.purchase_date_ms),
      family: { id: parent.familyId },
      parent,
      type: PaymentTypes.APPLE,
    });
    await this.familiesService.update(parent.familyId, {
      accountType: FamilyAccountTypes.PREMIUM,
      subscriptionExpiresAt,
      subscriptionId,
    });

    return true;
  }

  async verifyGooglePremiumPurchase(
    productId: string,
    purchaseToken: string,
    parent: ParentEntity,
  ): Promise<boolean> {
    const verificationResult = await this.googlePlayVerifier.verifySub({
      packageName: googlePlayCreds.package_name,
      productId,
      purchaseToken,
    });

    const subscriptionExpiresAt = new Date(
      +verificationResult?.payload?.expiryTimeMillis,
    );
    const subscriptionId = verificationResult?.payload?.orderId;
    const purchasedAt = new Date(+verificationResult?.payload?.startTimeMillis);
    this.checkForExpiration(subscriptionExpiresAt);
    await this.checkFamilyToSubscriptionRelation(subscriptionId, parent);

    await this.paymentsRepository.upsertPayment({
      transactionId: subscriptionId,
      subscriptionId,
      expiresAt: subscriptionExpiresAt,
      purchasedAt,
      family: { id: parent.familyId },
      parent,
      type: PaymentTypes.GOOGLE,
    });
    await this.familiesService.update(parent.familyId, {
      accountType: FamilyAccountTypes.PREMIUM,
      subscriptionExpiresAt,
      subscriptionId,
    });

    return true;
  }

  async listenApplePurchaseEvents(
    applePaymentEventDto: ApplePaymentEventDto,
  ): Promise<void> {
    console.log(
      'Received apple purchase event',
      JSON.stringify(applePaymentEventDto),
    );

    const password = this.configService.get('appleInAppPurchases.password');
    const [
      latest_receipt_info,
    ] = applePaymentEventDto.unified_receipt.latest_receipt_info;
    const { notification_type } = applePaymentEventDto;
    const original_transaction_id =
      latest_receipt_info?.original_transaction_id;
    const expires_date_ms = +(latest_receipt_info?.expires_date_ms || 0);

    if (password !== applePaymentEventDto.password) {
      throw new BadRequestException(`Event validation failed`);
    }

    if (!Object.values(NotificationEventTypes).includes(notification_type)) {
      return;
    }

    if (NotificationEventTypes.INITIAL_BUY === notification_type) {
      await this.createPayment(latest_receipt_info);
      return;
    }

    if (
      [NotificationEventTypes.CANCEL, NotificationEventTypes.REFUND].includes(
        notification_type,
      )
    ) {
      await this.cancelPremiumPlan(original_transaction_id);
      return;
    }

    if (
      [
        NotificationEventTypes.DID_RECOVER,
        NotificationEventTypes.DID_RENEW,
        NotificationEventTypes.INTERACTIVE_RENEWAL,
        NotificationEventTypes.DID_CHANGE_RENEWAL_STATUS,
        NotificationEventTypes.DID_FAIL_TO_RENEW,
        NotificationEventTypes.DID_CHANGE_RENEWAL_PREF,
      ].includes(notification_type)
    ) {
      await this.renewSubscription(original_transaction_id, expires_date_ms);
      return;
    }
  }

  async listenGooglePurchaseEvents(
    googlePlayPaymentEventDto: GooglePlayPaymentEventDto,
  ): Promise<void> {
    const { message } = googlePlayPaymentEventDto;
    const dataInUtf8 = Buffer.from(message.data, 'base64').toString('utf8');

    console.log(
      'Received google purchase event',
      JSON.stringify(googlePlayPaymentEventDto),
      'decoded data',
      dataInUtf8,
    );

    const data = JSON.parse(dataInUtf8);
    const notificationData = data?.subscriptionNotification;

    if (data?.packageName !== googlePlayCreds.package_name) {
      throw new BadRequestException(`Event validation failed`);
    }

    if (
      !Object.values(GoogleNotificationTypes).includes(
        notificationData?.notificationType,
      )
    ) {
      return;
    }

    if (
      [
        GoogleNotificationTypes.SUBSCRIPTION_REVOKED,
        GoogleNotificationTypes.SUBSCRIPTION_EXPIRED,
      ].some(type => type == notificationData?.notificationType)
    ) {
      const verificationResult = await this.googlePlayVerifier.verifySub({
        packageName: googlePlayCreds.package_name,
        productId: notificationData?.subscriptionId,
        purchaseToken: notificationData?.purchaseToken,
      });
      const subscriptionId = verificationResult?.payload?.orderId;

      await this.cancelPremiumPlan(subscriptionId);
      return;
    }

    if (
      [
        GoogleNotificationTypes.SUBSCRIPTION_RECOVERED,
        GoogleNotificationTypes.SUBSCRIPTION_RENEWED,
        GoogleNotificationTypes.SUBSCRIPTION_CANCELED,
        GoogleNotificationTypes.SUBSCRIPTION_RESTARTED,
        GoogleNotificationTypes.SUBSCRIPTION_DEFERRED,
        GoogleNotificationTypes.SUBSCRIPTION_PAUSED,
        GoogleNotificationTypes.SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED,
      ].some(type => type == notificationData?.notificationType)
    ) {
      const verificationResult = await this.googlePlayVerifier.verifySub({
        packageName: googlePlayCreds.package_name,
        productId: notificationData?.subscriptionId,
        purchaseToken: notificationData?.purchaseToken,
      });
      const subscriptionId = verificationResult?.payload?.orderId;
      const subscriptionExpiresAt = new Date(
        +verificationResult?.payload?.expiryTimeMillis,
      );

      await this.renewSubscription(
        subscriptionId,
        subscriptionExpiresAt.valueOf(),
      );
      return;
    }
  }

  private checkForRequestError(
    verifyResponse: VerifyReceiptDataResponse,
    receiptData: string,
  ) {
    const isErrorOccurred = verifyResponse.status !== 0;
    if (isErrorOccurred) {
      console.log(
        'Apple purchase error',
        JSON.stringify({ receiptData, status: verifyResponse.status }),
      );
      throw new InternalServerErrorException(
        `Something wrong with with payments service. Please contact support. (error code - ${verifyResponse.status}})`,
      );
    }
  }

  private checkForExpiration(subscriptionExpiresAt: Date) {
    const isSubscriptionExpired = new Date() >= subscriptionExpiresAt;
    if (isSubscriptionExpired) {
      throw new ForbiddenException(`Subscription expired`);
    }
  }

  private async checkFamilyToSubscriptionRelation(
    subscriptionId: string,
    parent: ParentEntity,
  ) {
    const familyWithSpecifiedSubscription = await this.familiesService.getBySubscriptionId(
      subscriptionId,
    );
    if (
      familyWithSpecifiedSubscription &&
      familyWithSpecifiedSubscription.id !== parent.familyId
    ) {
      throw new ForbiddenException(
        `Using subscription of other family is prohibited`,
      );
    }
  }

  private async cancelPremiumPlan(original_transaction_id: string) {
    const payment = await this.paymentsRepository.findOne({
      subscriptionId: original_transaction_id,
    });
    if (!payment) {
      return;
    }

    await this.paymentsRepository.update(
      { id: payment.id },
      { expiresAt: new Date() },
    );
    await this.familiesService.update(payment.familyId, {
      accountType: FamilyAccountTypes.BASIC,
      subscriptionExpiresAt: new Date(),
    });
  }

  private async renewSubscription(
    original_transaction_id: string,
    expires_date_ms: number,
  ) {
    const payment = await this.paymentsRepository.findOne({
      subscriptionId: original_transaction_id,
    });
    if (!payment) {
      return;
    }

    const expiresAt = new Date(expires_date_ms);
    await this.paymentsRepository.update({ id: payment.id }, { expiresAt });
    await this.familiesService.update(payment.familyId, {
      accountType:
        new Date() < expiresAt
          ? FamilyAccountTypes.PREMIUM
          : FamilyAccountTypes.BASIC,
      subscriptionExpiresAt: expiresAt,
    });
  }

  private async createPayment(latestReceiptInfo: AppleLatestReceiptInfoDto) {
    return this.paymentsRepository.upsertPayment({
      transactionId: latestReceiptInfo.transaction_id,
      subscriptionId: latestReceiptInfo.original_transaction_id,
      expiresAt: new Date(+latestReceiptInfo.expires_date_ms),
      purchasedAt: new Date(+latestReceiptInfo.purchase_date_ms),
    });
  }

  private async checkIfTestFamilyForSandbox(
    verifyResponse: VerifyReceiptDataResponse,
    familyId: string,
  ) {
    if (
      [
        AppleInAppPurchasesEnvironments.PROD,
        AppleInAppPurchasesEnvironments.PRODUCTION,
      ].includes(verifyResponse.environment)
    ) {
      return;
    }

    const family = await this.familiesService.getById(familyId);
    if (!family.isTest) {
      throw new ConflictException(
        `Cannot consume sandbox receipts for non-test family`,
      );
    }
  }
}
