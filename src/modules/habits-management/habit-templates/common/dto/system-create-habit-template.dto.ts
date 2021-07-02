import { ApiProperty } from '@nestjs/swagger';
import { TranslationsDto } from '@src/shared/dto/translations.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsUrl, ValidateNested } from 'class-validator';
import { CreateHabitTemplateBaseDto } from './create-habit-template.base-dto';

export class SystemCreateHabitTemplateDto extends CreateHabitTemplateBaseDto {
  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
