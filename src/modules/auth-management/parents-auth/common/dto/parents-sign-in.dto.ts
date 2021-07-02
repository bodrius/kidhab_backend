import { IsEmail, IsString } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class ParentsSignInDto {
  @Field({ description: 'parent email' })
  @IsEmail()
  email: string;

  @Field({ description: 'parent password' })
  @IsString()
  password: string;
}
