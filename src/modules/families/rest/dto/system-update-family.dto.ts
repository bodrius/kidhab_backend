import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { FamilyAccountTypes } from '../../common/family-account-types.enum';

export class SystemUpdateFamilyDto {
  @ApiProperty({ enum: FamilyAccountTypes })
  @IsEnum(FamilyAccountTypes)
  @IsOptional()
  accountType: FamilyAccountTypes;

  @ApiProperty()
  @IsString()
  @IsOptional()
  parentInviteHash: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  subscriptionId: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  subscriptionExpiresAt: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isTest: boolean;
}
