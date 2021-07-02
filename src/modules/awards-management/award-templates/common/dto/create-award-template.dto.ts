import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';
import { CreateAwardTemplateBaseDto } from './create-award-template.base-dto';

@ArgsType()
export class CreateAwardTemplateDto extends CreateAwardTemplateBaseDto {
  @ApiProperty()
  @Field({ description: 'award name' })
  @IsString()
  @Length(2)
  name: string;
}
