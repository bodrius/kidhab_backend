import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AwardTypes } from '../../award-types.enum';

@ObjectType()
export class AwardDraftModel {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(type => AwardTypes, { nullable: true })
  type?: AwardTypes;

  @Field(type => Int, { nullable: true })
  cost?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
