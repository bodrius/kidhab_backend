import { ArgsType, Field } from '@nestjs/graphql';
import { Languages } from '@src/shared/interfaces/languages.enum';
import { IsEnum } from 'class-validator';

@ArgsType()
export class UpdateLoggedChildDto {
  @Field(type => Languages)
  @IsEnum(Languages)
  language: Languages;
}
