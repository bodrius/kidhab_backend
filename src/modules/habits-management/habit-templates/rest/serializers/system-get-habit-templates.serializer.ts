import { ApiProperty } from '@nestjs/swagger';
import { PaginatedSerializer } from '@src/shared/serializers/paginated.serializer';
import { Type } from 'class-transformer';
import { HabitTemplateSerializer } from './habit-template.serializer';

export class SystemGetHabitTemplatesSerializer extends PaginatedSerializer {
  @ApiProperty({ type: HabitTemplateSerializer })
  @Type(() => HabitTemplateSerializer)
  templates: HabitTemplateSerializer[];
}
