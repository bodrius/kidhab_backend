import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEnum,
  IsISO8601,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { HabitsStatuses } from '../../habits-management/habits/common/habits-statuses.enum';
import { Type } from 'class-transformer';
import { TranslationsDto } from '../../../shared/dto/translations.dto';

class HabitDraftSeedDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsInt()
  points: number;

  @ApiProperty()
  @IsString()
  reccurence: string;

  @ApiProperty()
  @IsInt()
  timesToComplete: number;

  @ApiProperty()
  @IsInt()
  categoryIndex: number;
}

export class HabitSeedDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsInt()
  points: number;

  @ApiProperty()
  @IsInt()
  pointsRate: number;

  @ApiProperty({ enum: HabitsStatuses })
  @IsEnum(HabitsStatuses)
  status: HabitsStatuses;

  @ApiProperty()
  @IsString()
  reccurence: string;

  @ApiProperty()
  @IsISO8601()
  baseDate: string;

  @ApiProperty({ nullable: true })
  @IsInt()
  @IsOptional()
  timesToComplete?: number;

  @ApiProperty({ nullable: true })
  @IsInt()
  @IsOptional()
  timesToCompleteLeft?: number;

  @ApiProperty()
  @IsInt()
  categoryIndex: number;

  @ApiProperty({ nullable: true })
  @Type(() => HabitDraftSeedDto)
  @ValidateNested()
  @IsOptional()
  draft?: HabitDraftSeedDto;

  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;
}
