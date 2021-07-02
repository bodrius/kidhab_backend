import {
  Field,
  ObjectType,
  PartialType,
  OmitType,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';
import { ChildModel } from '@src/modules/children/graphql/child.model';
import { HabitTemplateModel } from '@src/modules/habits-management/habit-templates/graphql/habit-template.model';
import { AwardTemplateModel } from '@src/modules/awards-management/award-templates/graphql/award-template.model';
import { FamilyAccountTypes } from '../common/family-account-types.enum';

@ObjectType()
export class FamilyModel {
  @Field(type => ID)
  id: string;

  @Field(type => FamilyAccountTypes)
  accountType: FamilyAccountTypes;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true, description: 'parent invite hash' })
  parentInviteHash?: string;

  @Field({
    nullable: true,
    description: 'Family subscription id in apple connect',
  })
  subscriptionId?: string;

  @Field(type => GraphQLISODateTime, {
    nullable: true,
    description: 'Family subscription expiration time in apple connect',
  })
  subscriptionExpiresAt?: Date;

  @Field(type => [ParentModel])
  parents: ParentModel[];

  @Field(type => [ChildModel])
  children: ChildModel[];

  @Field(type => [HabitTemplateModel], {
    description: `family's habit templates`,
  })
  habitTemplates: HabitTemplateModel[];

  @Field(type => [AwardTemplateModel], { description: `family's award templates` })
  awardTemplates: AwardTemplateModel[];

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class FamilyWithoutRelationsModel extends PartialType(
  OmitType(FamilyModel, [
    'awardTemplates',
    'children',
    'habitTemplates',
    'parents',
  ] as const),
) {}
