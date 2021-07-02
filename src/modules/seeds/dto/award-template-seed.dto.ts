import { ApiProperty } from '@nestjs/swagger';
import { TranslationsDto } from '../../../shared/dto/translations.dto';
import { Type } from 'class-transformer';
import { IsString, IsEnum, IsInt, IsUrl, IsOptional, ValidateNested } from 'class-validator';
import { AwardTypes } from '../../awards-management/award-types.enum';

export class AwardTemplateSeedDto {
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

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;
}
