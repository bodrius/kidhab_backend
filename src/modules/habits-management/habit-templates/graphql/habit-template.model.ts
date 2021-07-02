import {
  Field,
  ObjectType,
  Int,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { HabitCategoryWithoutTemplatesModel } from '../../habit-categories//graphql/habit-category.model';

@ObjectType()
export class HabitTemplateModel {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field(type => Int)
  points: number;

  @Field()
  description: string;

  @Field({
    description:
      'habit template default reccurence. Should be a valid postgres inverval string',
  })
  defaultReccurence: string;

  @Field(type => ID)
  categoryId: string;

  @Field(type => ID, {
    description:
      'id of family to which template belongs. null for system habit templates',
  })
  familyId: string;

  @Field(type => HabitCategoryWithoutTemplatesModel)
  category: HabitCategoryWithoutTemplatesModel;

  @Field({ nullable: true })
  imageUrl: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
