import { ArgsType, Field } from '@nestjs/graphql';
import { Languages } from '@src/shared/interfaces/languages.enum';
import { IsBoolean, IsString, IsOptional, IsEnum } from 'class-validator';

@ArgsType()
export class UpdateLoggedParentDto {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isTestPassed?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  username?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @Field(type => Languages, { nullable: true })
  @IsEnum(Languages)
  @IsOptional()
  language: Languages;
}
