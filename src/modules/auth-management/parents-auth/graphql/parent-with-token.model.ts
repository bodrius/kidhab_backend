import { Field, ObjectType } from '@nestjs/graphql';
import { ParentModel } from '@src/modules/parents/graphql/parent.model';

@ObjectType()
export class ParentWithToken {
  @Field(type => ParentModel, { description: 'authenticated parent' })
  parent: ParentModel;

  @Field({ description: `parent's token` })
  token: string;
}
