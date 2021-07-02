import { ApiProperty } from '@nestjs/swagger';
import { PaginatedSerializer } from '@src/shared/serializers/paginated.serializer';
import { Type } from 'class-transformer';
import { HabitCategorySerializer } from './habit-category.serializer';

export class SystemGetHabitCategoriesSerializer extends PaginatedSerializer {
  @ApiProperty({ type: HabitCategorySerializer, isArray: true })
  @Type(() => HabitCategorySerializer)
  categories: HabitCategorySerializer[];
}
