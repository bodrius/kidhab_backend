import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SuccessModel } from '@src/graphql/success.model';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ParentTokenGraphqlGuard } from '@src/shared/guards/parent-token-graphql.guard';
import { PaymentsService } from '../common/payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(ParentTokenGraphqlGuard)
  @Mutation(returns => SuccessModel, {
    description:
      'Verifies apple premium purchase.' +
      ' Throws 403 if subscription expired or belongs to other family.' +
      ' Throws 409 if received sandbox receipt for non-test family',
  })
  async verifyPremiumPurchase(
    @Context('parent') parent: ParentEntity,
    @Args('receiptData') receiptData: string,
  ): Promise<SuccessModel> {
    const success = await this.paymentsService.verifyApplePremiumPurchase(
      receiptData,
      parent,
    );

    return { success };
  }

  @UseGuards(ParentTokenGraphqlGuard)
  @Mutation(returns => SuccessModel, {
    description:
      'Verifies google premium purchase.' +
      ' Throws 403 if subscription expired or belongs to other family.' +
      ' Throws 409 if received sandbox receipt for non-test family',
  })
  async verifyGooglePremiumPurchase(
    @Context('parent') parent: ParentEntity,
    @Args('purchaseToken') purchaseToken: string,
    @Args('productId') productId: string,
  ): Promise<SuccessModel> {
    const success = await this.paymentsService.verifyGooglePremiumPurchase(
      productId,
      purchaseToken,
      parent,
    );

    return { success };
  }
}
