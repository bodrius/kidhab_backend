import { Field, ObjectType } from '@nestjs/graphql';
import { ChildModel } from '@src/modules/children/graphql/child.model';

@ObjectType()
export class ChildWithToken {
  @Field(type => ChildModel, { description: 'authenticated child' })
  child: ChildModel;

  @Field()
  token: string;
}
