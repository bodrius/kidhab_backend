import { ApiProperty } from '@nestjs/swagger';
import { TranslationsDto } from '@src/shared/dto/translations.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsUrl, ValidateNested } from 'class-validator';

export class SystemCreateHabitCategoryDto {
  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageHabitScreenUrl?: string;
}
