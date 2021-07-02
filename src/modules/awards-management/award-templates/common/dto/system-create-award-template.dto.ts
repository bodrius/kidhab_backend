import { ApiProperty } from '@nestjs/swagger';
import { TranslationsDto } from '@src/shared/dto/translations.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateAwardTemplateBaseDto } from './create-award-template.base-dto';

export class SystemCreateAwardTemplateDto extends CreateAwardTemplateBaseDto {
  @ApiProperty()
  @Type(() => TranslationsDto)
  @ValidateNested()
  translations: TranslationsDto;
}
