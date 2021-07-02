import { Field, ObjectType, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { FamilyAccountTypes } from '../../families/common/family-account-types.enum';
import { FamilyWithoutRelationsModel } from '@src/modules/families/graphql/family.model';
import { Languages } from '../../../shared/interfaces/languages.enum';

@ObjectType()
export class ParentModel {
  @Field(type => ID)
  id: string;

  @Field()
  email: string;

  @Field({ defaultValue: false })
  isTestPassed: boolean;

  @Field({ nullable: true })
  username?: string;

  // @Field({ nullable: true,  })
  // avatarPath?: string;

  @Field(type => FamilyAccountTypes, {
    deprecationReason: 'Moved to family model',
    defaultValue: FamilyAccountTypes.BASIC,
  })
  accountType?: FamilyAccountTypes;

  @Field({ nullable: true })
  country?: string;

  @Field(type => Languages)
  language: Languages;

  @Field(type => FamilyWithoutRelationsModel, {
    description: 'family to which parent belongs',
  })
  family: FamilyWithoutRelationsModel;

  @Field(type => ID, { description: 'family id to which parent belongs' })
  familyId: string;

  @Field(type => GraphQLISODateTime)
  createdAt: Date;

  @Field(type => GraphQLISODateTime)
  updatedAt: Date;
}
