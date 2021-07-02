import {
  Field,
  ObjectType,
  Int,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { AwardTypes } from '../../award-types.enum';

@ObjectType()
export class AwardTemplateModel {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(type => AwardTypes, {
    defaultValue: AwardTypes.MATERIAL,
  })
  type: AwardTypes;

  @Field(type => Int, { description: 'award template cost in points' })
  cost: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(type => ID, { description: 'id of family to which template belongs' })
  familyId: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
