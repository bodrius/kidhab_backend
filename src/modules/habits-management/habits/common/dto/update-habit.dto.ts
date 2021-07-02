import { PartialType, OmitType, InputType } from '@nestjs/graphql';
import { CreateHabitDto } from './create-habit.dto';

@InputType({ isAbstract: true })
export class UpdateHabitGqlDto extends PartialType(
  OmitType(CreateHabitDto, ['baseDate', 'templateId'] as const),
) {}
