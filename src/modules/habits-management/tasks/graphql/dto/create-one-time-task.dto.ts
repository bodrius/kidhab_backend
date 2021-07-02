import { IsISO8601, IsString, IsInt, IsUrl, IsOptional } from 'class-validator';
import { InputType, ArgsType, Field, Int } from '@nestjs/graphql';

@InputType({ isAbstract: true })
@ArgsType()
export class CreateOneTimeTaskDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(type => Int)
  @IsInt()
  points: number;

  @Field()
  @IsISO8601({ strict: true })
  date: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
