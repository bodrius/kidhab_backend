import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { CreateAwardRequestDto } from './create-award-request.dto';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateAwardsDto {
  @Field(type => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  childId: string;

  @Field(type => [CreateAwardRequestDto])
  @IsArray()
  @ValidateNested()
  @Type(() => CreateAwardRequestDto)
  awards: CreateAwardRequestDto[];
}
