import { PartialType } from '@nestjs/swagger';
import { ArgsType } from '@nestjs/graphql';
import { SystemCreateHabitCategoryDto } from './system-create-habit-category.dto';

@ArgsType()
export class UpdateHabitCategoryDto extends PartialType(
  SystemCreateHabitCategoryDto,
) {}
