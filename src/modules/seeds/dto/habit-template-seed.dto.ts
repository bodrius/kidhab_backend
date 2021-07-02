import { ApiProperty } from '@nestjs/swagger';
import { TranslationsDto } from '../../../shared/dto/translations.dto';
import { Type } from 'class-transformer';
import { IsString, IsInt, IsOptional, ValidateNested } from 'class-validator';

export class HabitTemplateSeedDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsInt()
  points: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  defaultReccurence: string;

  @ApiProperty()
  @IsInt()
  categoryIndex: number;

  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;
}
