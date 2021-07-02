import { ApiProperty } from '@nestjs/swagger';
import { PaginatedSerializer } from '@src/shared/serializers/paginated.serializer';
import { Type } from 'class-transformer';
import { ChildSerializer } from './child.serializer';

export class SystemGetChildrenSerializer extends PaginatedSerializer {
  @ApiProperty({ type: ChildSerializer, isArray: true })
  @Type(() => ChildSerializer)
  children: ChildSerializer[];
}
