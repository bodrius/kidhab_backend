import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ArgsType, Field } from '@nestjs/graphql';
import { CreateHabitTemplateBaseDto } from './create-habit-template.base-dto';

@ArgsType()
export class CreateHabitTemplateDto extends CreateHabitTemplateBaseDto {
  @ApiProperty()
  @Field({ description: 'habit template name' })
  @IsString()
  name: string;
}
