import { PartialType } from '@nestjs/swagger';
import { SystemCreateAwardTemplateDto } from './system-create-award-template.dto';

export class SystemUpdateAwardTemplateDto extends PartialType(
  SystemCreateAwardTemplateDto,
) {}
