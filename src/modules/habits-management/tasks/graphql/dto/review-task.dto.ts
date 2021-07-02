import { TaskStatuses } from '../../common/task-statuses.enum';
import { IsEnum } from 'class-validator';
import { registerEnumType, Field, InputType } from '@nestjs/graphql';

export enum StatusesForReview {
  REJECTED = TaskStatuses.REJECTED,
  APPROVED = TaskStatuses.APPROVED,
}

registerEnumType(StatusesForReview, {
  name: 'StatusesForReview',
});

@InputType({ isAbstract: true })
export class ReviewTaskDto {
  @Field(type => StatusesForReview)
  @IsEnum(StatusesForReview)
  status: StatusesForReview;
}
