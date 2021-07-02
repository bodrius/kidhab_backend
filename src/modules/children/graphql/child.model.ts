import {
  Field,
  ObjectType,
  Int,
  PartialType,
  OmitType,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Genders } from '../common/gender.enum';
import { ChildStatuses } from '../common/child-statuses.enum';
import { FamilyWithoutRelationsModel } from '@src/modules/families/graphql/family.model';
import { HabitModel } from '@src/modules/habits-management/habits/graphql/habit.model';
import { AwardModel } from '@src/modules/awards-management/awards/graphql/award.model';
import { HabitCategoryModel } from '@src/modules/habits-management/habit-categories/graphql/habit-category.model';
import { Languages } from '@src/shared/interfaces/languages.enum';

@ObjectType()
export class ChildModel {
  @Field(type => ID)
  id: string;

  @Field()
  username: string;

  @Field(type => Int)
  age: number;

  @Field(type => Genders)
  gender: Genders;

  @Field(type => ChildStatuses)
  status: ChildStatuses;

  @Field({
    nullable: true,
    description: `hash in child's invite (activation) link`,
  })
  inviteHash?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(type => Languages, { description: 'Child language' })
  language: Languages;

  @Field({ nullable: true })
  avatarPath: string;

  @Field(type => Int, { description: `Child's account balance` })
  balance: number;

  @Field(type => FamilyWithoutRelationsModel, {
    description: 'Family, to which child belongs',
  })
  family: FamilyWithoutRelationsModel;

  @Field(type => ID, { description: 'Id of family, to which child belongs' })
  familyId: string;

  @Field(type => [HabitCategoryModel], {
    description: 'selected habit categories for child',
  })
  categories: HabitCategoryModel[];

  @Field(type => [HabitModel])
  habits: HabitModel[];

  @Field(type => [AwardModel])
  awards: AwardModel[];

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class ChildWithoutNestedArraysModel extends PartialType(
  OmitType(ChildModel, ['habits', 'awards'] as const),
) {}
