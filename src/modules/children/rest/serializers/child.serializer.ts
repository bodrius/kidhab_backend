import { ApiProperty } from '@nestjs/swagger';
import { Languages } from '@src/shared/interfaces/languages.enum';
import { Exclude } from 'class-transformer';
import { ChildStatuses } from '../../common/child-statuses.enum';
import { Genders } from '../../common/gender.enum';

export class ChildSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  age: number;

  @ApiProperty({ enum: Genders })
  gender: Genders;

  @ApiProperty({ nullable: true })
  email?: string;

  @ApiProperty({ enum: Languages })
  language: Languages;

  @ApiProperty({ nullable: true })
  avatarPath?: string;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: ChildStatuses })
  status: ChildStatuses;

  @ApiProperty()
  familyId: string;

  @Exclude()
  family;

  @Exclude()
  passwordHash?: string;

  @Exclude()
  inviteHash?: string;

  @Exclude()
  createdAt;

  @Exclude()
  updatedAt;
}
