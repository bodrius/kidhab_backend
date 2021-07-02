import { PartialType } from '@nestjs/swagger';
import { CreateAwardTemplateDto } from './create-award-template.dto';

export class UpdateAwardTemplateDto extends PartialType(CreateAwardTemplateDto) {}
