import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class HabitDraftModel {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(type => Int, { nullable: true })
  points?: number;

  @Field({ nullable: true })
  reccurence: string;

  @Field(type => Int, { nullable: true })
  timesToComplete?: number;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  baseDate?: string;
}
