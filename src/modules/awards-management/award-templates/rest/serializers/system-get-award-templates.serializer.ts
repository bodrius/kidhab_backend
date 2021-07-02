import { ApiProperty } from '@nestjs/swagger';
import { PaginatedSerializer } from '@src/shared/serializers/paginated.serializer';
import { Type } from 'class-transformer';
import { AwardTemplateSerializer } from './award-template.serializer';

export class SystemGetAwardTemplatesSerializer extends PaginatedSerializer {
  @ApiProperty({ isArray: true, type: AwardTemplateSerializer })
  @Type(() => AwardTemplateSerializer)
  templates: AwardTemplateSerializer[];
}
