import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { HabitCategorySeedDto } from './habit-category-seed.dto';
import { FamilySeedDto } from './family-seed.dto';
import { AwardTemplateSeedDto } from './award-template-seed.dto';

export class SeedsJsonDto {
  @ApiProperty({ isArray: true, type: HabitCategorySeedDto })
  @Type(() => HabitCategorySeedDto)
  @ValidateNested()
  @IsArray()
  categories: HabitCategorySeedDto[];

  @ApiProperty({ isArray: true, type: FamilySeedDto })
  @Type(() => FamilySeedDto)
  @ValidateNested()
  @IsArray()
  families: FamilySeedDto[];

  @ApiProperty({ isArray: true, type: AwardTemplateSeedDto })
  @Type(() => AwardTemplateSeedDto)
  @ValidateNested()
  @IsArray()
  systemAwardTemplates: AwardTemplateSeedDto[];
}
