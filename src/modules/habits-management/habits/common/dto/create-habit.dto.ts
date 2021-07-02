import {
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
  IsISO8601,
  Max,
  IsUrl,
} from 'class-validator';
import { Field, Int, InputType, ID, ArgsType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
@ArgsType()
export class CreateHabitDto {
  @Field(type => ID)
  @IsUUID()
  categoryId: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(type => Int)
  @IsInt()
  points: number;

  @Field(type => Int, { nullable: true })
  @IsInt()
  @Max(100)
  @IsOptional()
  timesToComplete?: number;

  @Field(type => String)
  @IsString()
  reccurence: any;

  @Field(type => String)
  @IsISO8601({ strict: true })
  baseDate: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  templateId?: string;
}
