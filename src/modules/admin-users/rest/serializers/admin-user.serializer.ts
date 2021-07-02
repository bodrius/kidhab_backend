import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { AdminRoleSerializer } from './admin-role.serializer';

export class AdminUserSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ type: AdminRoleSerializer })
  @Type(() => AdminRoleSerializer)
  role: AdminRoleSerializer;

  @ApiProperty()
  shouldResetPassword: boolean;

  @Exclude()
  passwordHash: string;

  @Exclude()
  roleId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
