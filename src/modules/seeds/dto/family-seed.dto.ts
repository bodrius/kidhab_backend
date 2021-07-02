import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  ValidateNested,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParentSeedDto } from './parent-seed.dto';
import { ChildSeedDto } from './child-seed.dto';
import { AwardTemplateSeedDto } from './award-template-seed.dto';
import { HabitTemplateSeedDto } from './habit-template-seed.dto';
import { FamilyAccountTypes } from '../../families/common/family-account-types.enum';

export class FamilySeedDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ enum: FamilyAccountTypes, nullable: true })
  @IsEnum(FamilyAccountTypes)
  accountType: FamilyAccountTypes;

  @ApiProperty()
  @IsString()
  @IsOptional()
  parentInviteHash: string;

  @ApiProperty({ isArray: true, type: ParentSeedDto })
  @Type(() => ParentSeedDto)
  @ValidateNested()
  @IsArray()
  parents: ParentSeedDto[];

  @ApiProperty({ isArray: true, type: ChildSeedDto })
  @Type(() => ChildSeedDto)
  @ValidateNested()
  @IsArray()
  children: ChildSeedDto[];

  @ApiProperty({ isArray: true, type: AwardTemplateSeedDto })
  @Type(() => AwardTemplateSeedDto)
  @ValidateNested()
  @IsArray()
  awardTemplates: AwardTemplateSeedDto[];

  @ApiProperty({ isArray: true, type: HabitTemplateSeedDto })
  @Type(() => HabitTemplateSeedDto)
  @ValidateNested()
  @IsArray()
  habitTemplates: HabitTemplateSeedDto[];
}
