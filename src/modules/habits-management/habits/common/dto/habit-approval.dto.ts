import { IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
export class HabitApprovalDto {
  @Field()
  @IsBoolean()
  approve: boolean;
}
