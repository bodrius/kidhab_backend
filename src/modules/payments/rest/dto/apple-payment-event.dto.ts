import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { AppleInAppPurchasesEnvironments } from '../../common/apple-in-app-purchases-environments.enum';
import { NotificationEventTypes } from '../../common/notification-event-types.enum';
import { AppleUnifiedReceiptDto } from './apple-unified-receipt.dto';

export class ApplePaymentEventDto {
  @ApiProperty()
  @IsString()
  notification_type: NotificationEventTypes;

  @ApiProperty()
  @IsString()
  environment: AppleInAppPurchasesEnvironments;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @Type(() => AppleUnifiedReceiptDto)
  @ValidateNested()
  unified_receipt: AppleUnifiedReceiptDto;
}
