import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { HabitTemplateSeedDto } from './habit-template-seed.dto';
import { TranslationsDto } from '../../../shared/dto/translations.dto';

class HabitTemplateSeedWithoutCategoryDto extends OmitType(
  HabitTemplateSeedDto,
  ['categoryIndex'] as const,
) {}

export class HabitCategorySeedDto {
  @ApiProperty({ isArray: true, type: HabitTemplateSeedWithoutCategoryDto })
  @Type(() => HabitTemplateSeedWithoutCategoryDto)
  @ValidateNested()
  @IsArray()
  templates: HabitTemplateSeedWithoutCategoryDto[];

  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;
}
