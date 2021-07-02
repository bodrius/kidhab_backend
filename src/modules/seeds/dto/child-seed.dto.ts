import { Genders } from '../../children/common/gender.enum';
import { ChildStatuses } from '../../children/common/child-statuses.enum';
import { HabitSeedDto } from './habit-seed.dto';
import { AwardSeedDto } from './award-seed.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsEmail,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Languages } from '../../../shared/interfaces/languages.enum';

export class ChildSeedDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsInt()
  age: number;

  @ApiProperty({ enum: Genders })
  @IsEnum(Genders)
  gender: Genders;

  @ApiProperty({ enum: ChildStatuses })
  @IsEnum(ChildStatuses)
  status: ChildStatuses;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inviteHash?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ nullable: true })
  @IsEnum(Languages)
  @IsOptional()
  language?: Languages;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsInt({ each: true })
  @IsArray()
  categoryIndexes: number[];

  @ApiProperty({ type: HabitSeedDto, isArray: true })
  @Type(() => HabitSeedDto)
  @ValidateNested()
  @IsArray()
  habits: HabitSeedDto[];

  @ApiProperty({ type: AwardSeedDto, isArray: true })
  @Type(() => AwardSeedDto)
  @ValidateNested()
  @IsArray()
  awards: AwardSeedDto[];
}
