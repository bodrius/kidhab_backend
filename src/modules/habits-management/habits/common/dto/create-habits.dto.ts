import { IsUUID, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { CreateHabitDto } from './create-habit.dto';

@ArgsType()
export class CreateHabitsDto {
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  childId?: string;

  @Field(type => [CreateHabitDto])
  @IsArray()
  @ValidateNested()
  @Type(() => CreateHabitDto)
  habits: CreateHabitDto[];
}
