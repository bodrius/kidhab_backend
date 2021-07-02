import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsOptional, IsString } from 'class-validator';

export class AppleLatestReceiptInfoDto {
  @ApiProperty()
  @IsString()
  original_transaction_id: string;

  @ApiProperty()
  @Allow()
  expires_date_ms: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transaction_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  purchase_date_ms: string;
}
