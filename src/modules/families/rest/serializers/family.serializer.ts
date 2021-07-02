import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { FamilyAccountTypes } from '../../common/family-account-types.enum';

export class FamilySerializer {
  @ApiProperty()
  id: string;

  @Exclude()
  name?: string;

  @ApiProperty({ enum: FamilyAccountTypes })
  accountType: FamilyAccountTypes;

  @ApiProperty({ nullable: true })
  parentInviteHash?: string | null;

  @ApiProperty({ nullable: true })
  subscriptionId?: string;

  @ApiProperty({ nullable: true })
  subscriptionExpiresAt?: Date;

  @ApiProperty()
  isTest: boolean;

  @Exclude()
  createdAt;

  @Exclude()
  updatedAt;
}
