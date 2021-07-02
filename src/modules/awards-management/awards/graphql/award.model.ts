import {
  Field,
  ObjectType,
  Int,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { AwardTypes } from '../../award-types.enum';
import { ChildWithoutNestedArraysModel } from '@src/modules/children/graphql/child.model';
import { AwardDraftModel } from './award-draft.model';
import { AwardStatuses } from '../common/award-statuses.enum';

@ObjectType()
export class AwardModel {
  @Field(type => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(type => AwardTypes, { nullable: true })
  type?: AwardTypes;

  @Field(type => Int, { nullable: true, description: 'award cost in points' })
  cost?: number;

  @Field(type => AwardStatuses)
  status: AwardStatuses;

  @Field({ description: 'is award currently selected one' })
  isActive: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(type => AwardDraftModel, {
    nullable: true,
    description: 'award draft (what child want to change in this award)',
  })
  draft?: AwardDraftModel;

  @Field(type => ChildWithoutNestedArraysModel, {
    description: 'child, to which award attached',
  })
  child: ChildWithoutNestedArraysModel;

  @Field(type => ID, { description: 'id of child, to which award attached' })
  childId: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
