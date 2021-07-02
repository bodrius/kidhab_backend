import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from '../common/payments.service';
import { ApplePaymentEventDto } from './dto/apple-payment-event.dto';
import { GooglePlayPaymentEventDto } from './dto/google-play-payment-event.dto';

@Controller('payments')
@ApiTags('Payments Webhooks API (For in-app purchases)')
export class PaymentsController {
  constructor(public paymentsService: PaymentsService) {}

  @Post('apple/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listen Apple Connect In-App purchases events' })
  @ApiOkResponse({
    description: 'Apple Connect In-App purchase event handled',
  })
  async listenApplePurchaseEvents(
    @Body() applePaymentEventDto: ApplePaymentEventDto,
  ): Promise<void> {
    return this.paymentsService.listenApplePurchaseEvents(applePaymentEventDto);
  }

  @Post('google/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listen Google Play In-App purchases events' })
  @ApiOkResponse({
    description: 'Google Play In-App purchase event handled',
  })
  async listenGooglePurchaseEvents(
    @Body() googlePlayPaymentEventDto: GooglePlayPaymentEventDto,
  ): Promise<void> {
    return this.paymentsService.listenGooglePurchaseEvents(
      googlePlayPaymentEventDto,
    );
  }
}
