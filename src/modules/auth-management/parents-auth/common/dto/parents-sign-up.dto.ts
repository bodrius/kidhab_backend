import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ArgsType, Field } from '@nestjs/graphql';
import { Languages } from '@src/shared/interfaces/languages.enum';

@ArgsType()
export class ParentsSignUpDto {
  @Field({ description: 'parent email' })
  @IsEmail()
  email: string;

  @Field({ description: 'parent password' })
  @IsString()
  password: string;

  @Field(type => Languages, {
    description: 'parent language',
    defaultValue: Languages.RU,
  })
  @IsEnum(Languages)
  language: Languages;
}
