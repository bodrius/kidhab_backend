import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { HabitCategorySerializer } from '@src/modules/habits-management/habit-categories/rest/serializers/habit-category.serializer';
import { TranslationsDto } from '@src/shared/dto/translations.dto';

export class HabitTemplateSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  imagePath?: string;

  @ApiProperty()
  defaultReccurence: string;

  @ApiProperty({ type: TranslationsDto })
  @Type(() => TranslationsDto)
  translations: TranslationsDto;

  @ApiProperty({ type: HabitCategorySerializer })
  @Type(() => HabitCategorySerializer)
  category: HabitCategorySerializer;

  @Exclude()
  familyId?;

  @Exclude()
  createdAt;

  @Exclude()
  updatedAt;

  @Exclude()
  categoryId;
}
