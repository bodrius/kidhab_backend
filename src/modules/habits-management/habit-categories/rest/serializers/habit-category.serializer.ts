import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TranslationsDto } from '@src/shared/dto/translations.dto';

export class HabitCategorySerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name?: string;

  @ApiProperty({ type: TranslationsDto })
  @Type(() => TranslationsDto)
  translations: TranslationsDto;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  imageHabitScreenUrl?: string;

  @Exclude()
  createdAt;

  @Exclude()
  updatedAt;

  @Exclude()
  status;
}
