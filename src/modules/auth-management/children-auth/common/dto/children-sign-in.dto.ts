import { IsEmail, IsString } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class ChildrenSignInDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}
