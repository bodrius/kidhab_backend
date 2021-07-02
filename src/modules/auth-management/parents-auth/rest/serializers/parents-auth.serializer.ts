import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ParentSerializer } from '@src/modules/parents/rest/serializers/parent.serializer';

export class ParentsAuthSerializer {
  @ApiProperty()
  @Type(() => ParentSerializer)
  parent: ParentSerializer;

  @ApiProperty()
  token: string;
}
