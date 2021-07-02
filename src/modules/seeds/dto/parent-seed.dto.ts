import { ApiProperty } from '@nestjs/swagger';
import { Languages } from '../../../shared/interfaces/languages.enum';
import {
  IsEmail,
  IsBoolean,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class ParentSeedDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsBoolean()
  isTestPassed: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ nullable: true })
  @IsEnum(Languages)
  @IsOptional()
  language?: Languages;
}
