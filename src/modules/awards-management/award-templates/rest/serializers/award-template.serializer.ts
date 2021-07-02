import { ApiProperty } from '@nestjs/swagger';
import { AwardTypes } from '@src/modules/awards-management/award-types.enum';
import { TranslationsDto } from '@src/shared/dto/translations.dto';
import { Exclude, Type } from 'class-transformer';

export class AwardTemplateSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  cost: number;

  @ApiProperty({ nullable: true })
  imageUrl?: string;

  @ApiProperty({ enum: AwardTypes })
  type: AwardTypes;

  @ApiProperty({ type: TranslationsDto })
  @Type(() => TranslationsDto)
  translations: TranslationsDto;

  @Exclude()
  familyId?;

  @Exclude()
  createdAt;

  @Exclude()
  updatedAt;
}
