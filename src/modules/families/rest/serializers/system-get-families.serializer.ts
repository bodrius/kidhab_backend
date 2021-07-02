import { ApiProperty } from '@nestjs/swagger';
import { PaginatedSerializer } from '@src/shared/serializers/paginated.serializer';
import { Type } from 'class-transformer';
import { FamilySerializer } from './family.serializer';

export class SystemGetFamiliesSerializer extends PaginatedSerializer {
  @ApiProperty({ type: FamilySerializer, isArray: true })
  @Type(() => FamilySerializer)
  families: FamilySerializer[];
}
