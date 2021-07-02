import { IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
export class ReviewAwardDraftDto {
  @Field()
  @IsBoolean()
  approve: boolean;
}
