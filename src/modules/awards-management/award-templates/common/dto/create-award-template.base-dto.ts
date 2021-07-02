import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsUrl, IsOptional } from 'class-validator';
import { AwardTypes } from '../../../award-types.enum';
import { Field, Int } from '@nestjs/graphql';

export class CreateAwardTemplateBaseDto {
  @ApiProperty()
  @Field({ description: 'award description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: AwardTypes })
  @Field(type => AwardTypes, { description: 'award type' })
  @IsEnum(AwardTypes)
  type: AwardTypes;

  @ApiProperty()
  @Field(type => Int, { description: 'award cost in points' })
  @IsInt()
  cost: number;

  @ApiProperty({ nullable: true })
  @Field({ description: 'award image url', nullable: true })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
