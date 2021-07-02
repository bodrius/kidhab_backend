import { ApiProperty } from '@nestjs/swagger';
import { ChildStatuses } from '@src/modules/children/common/child-statuses.enum';
import { Languages } from '@src/shared/interfaces/languages.enum';
import { Exclude, Expose, Transform } from 'class-transformer';

export class ParentSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isTestPassed: boolean;

  @ApiProperty()
  username?: string | null;

  @ApiProperty({ enum: Languages })
  language: Languages;

  @ApiProperty()
  avatarPath?: string;

  @ApiProperty()
  country?: string;

  @ApiProperty()
  @Expose()
  @Transform((value, obj) => {
    const children = obj?.family?.children ?? [];
    return children.filter(ch => ch.status === ChildStatuses.ACTIVATED).length;
  })
  activatedChildrenCount?: number;

  @ApiProperty()
  familyId: string;

  @ApiProperty()
  createdAt: Date;

  @Exclude()
  family;

  @Exclude()
  passwordHash?;

  @Exclude()
  updatedAt;
}
