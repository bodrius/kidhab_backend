import { ApiProperty } from '@nestjs/swagger';
import { PaginatedSerializer } from '@src/shared/serializers/paginated.serializer';
import { Type } from 'class-transformer';
import { ParentSerializer } from './parent.serializer';

export class SystemGetParentsSerializer extends PaginatedSerializer {
  @ApiProperty({ type: ParentSerializer, isArray: true })
  @Type(() => ParentSerializer)
  parents: ParentSerializer[];
}
