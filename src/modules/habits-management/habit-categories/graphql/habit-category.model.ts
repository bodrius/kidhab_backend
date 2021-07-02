import {
  Field,
  ObjectType,
  PartialType,
  OmitType,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { HabitTemplateModel } from '../../habit-templates/graphql/habit-template.model';

@ObjectType()
export class HabitCategoryModel {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field(type => [HabitTemplateModel], {
    description: 'family habit templates',
  })
  templates: HabitTemplateModel[];

  @Field({ nullable: true })
  imageUrl: string;

  @Field({ nullable: true })
  imageHabitScreenUrl: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class HabitCategoryWithoutTemplatesModel extends PartialType(
  OmitType(HabitCategoryModel, ['templates'] as const),
) {}
