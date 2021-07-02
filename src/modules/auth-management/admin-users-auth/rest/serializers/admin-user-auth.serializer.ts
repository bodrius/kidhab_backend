import { ApiProperty } from '@nestjs/swagger';
import { AdminUserSerializer } from '@src/modules/admin-users/rest/serializers/admin-user.serializer';
import { Type } from 'class-transformer';

export class AdminUserAuthSerializer {
  @ApiProperty()
  @Type(() => AdminUserSerializer)
  user: AdminUserSerializer;

  @ApiProperty()
  token: string;
}
