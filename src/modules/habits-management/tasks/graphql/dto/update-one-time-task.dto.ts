import { PartialType, InputType } from '@nestjs/graphql';
import { CreateOneTimeTaskDto } from './create-one-time-task.dto';

@InputType({ isAbstract: true })
export class UpdateOneTimeTaskGqlDto extends PartialType(
  CreateOneTimeTaskDto,
) {}
