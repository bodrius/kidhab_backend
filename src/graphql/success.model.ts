import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuccessModel {
  @Field({ description: 'true if removal was successful' })
  success: boolean;
}
