import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AppleLatestReceiptInfoDto } from './apple-latest-receipt-info.dto';

export class AppleUnifiedReceiptDto {
  @ApiProperty({ type: AppleLatestReceiptInfoDto, isArray: true })
  @Type(() => AppleLatestReceiptInfoDto)
  @ValidateNested({ each: true })
  latest_receipt_info: AppleLatestReceiptInfoDto[];
}
