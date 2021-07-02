import { IsString, IsInt, IsEnum, IsArray, IsUUID } from 'class-validator';
import { Genders } from '../../common/gender.enum';
import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CreateChildDto {
  @Field({ description: `child's username` })
  @IsString()
  username: string;

  @Field(type => Int, { description: `child's age` })
  @IsInt()
  age: number;

  @Field(type => Genders, { description: `child's gender` })
  @IsEnum(Genders)
  gender: Genders;

  @Field(type => [String], {
    description: `Child's category ids, which were choosed for development`,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
