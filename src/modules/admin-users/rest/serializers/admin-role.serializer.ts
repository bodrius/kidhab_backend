import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class AdminRoleSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  permissions: string[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
