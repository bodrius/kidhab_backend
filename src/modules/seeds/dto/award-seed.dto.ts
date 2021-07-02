import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsInt,
  ValidateNested,
  IsOptional,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { AwardTypes } from '../../awards-management/award-types.enum';
import { Type } from 'class-transformer';
import { TranslationsDto } from '../../../shared/dto/translations.dto';

class AwardDraftSeedDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: AwardTypes })
  @IsEnum(AwardTypes)
  type: AwardTypes;

  @ApiProperty()
  @IsInt()
  cost: number;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}

export class AwardSeedDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: AwardTypes })
  @IsEnum(AwardTypes)
  type: AwardTypes;

  @ApiProperty()
  @IsInt()
  cost: number;

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ nullable: true })
  @Type(() => AwardDraftSeedDto)
  @ValidateNested()
  @IsOptional()
  draft?: AwardDraftSeedDto;

  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;
}
