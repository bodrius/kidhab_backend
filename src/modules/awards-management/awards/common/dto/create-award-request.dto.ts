import {
  IsString,
  IsInt,
  IsEnum,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { AwardTypes } from '../../../award-types.enum';
import { InputType, Field, Int, ArgsType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
@ArgsType()
export class CreateAwardRequestDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(type => AwardTypes)
  @IsEnum(AwardTypes)
  type: AwardTypes;

  @Field(type => Int)
  @IsInt()
  cost: number;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  templateId?: string;
}
