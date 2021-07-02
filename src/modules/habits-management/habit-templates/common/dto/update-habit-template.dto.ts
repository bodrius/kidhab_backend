import { OmitType, PartialType } from '@nestjs/swagger';
import { SystemCreateHabitTemplateDto } from './system-create-habit-template.dto';

export class SystemUpdateHabitTemplateDto extends PartialType(
  OmitType(SystemCreateHabitTemplateDto, ['categoryId'] as const),
) {}
