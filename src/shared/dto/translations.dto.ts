import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Languages } from '../interfaces/languages.enum';

@ArgsType()
@InputType({ isAbstract: true })
export class FieldTranslationDto {
  @ApiProperty()
  @Field()
  @IsString()
  [Languages.EN]: string;

  @ApiProperty()
  @Field()
  @IsString()
  [Languages.RU]: string;

  @ApiProperty()
  @Field()
  @IsString()
  [Languages.UA]: string;
}

@ArgsType()
@InputType({ isAbstract: true })
export class TranslationsDto {
  @ApiProperty({ type: FieldTranslationDto })
  @Field()
  @Type(() => FieldTranslationDto)
  @ValidateNested()
  name: FieldTranslationDto;
}
