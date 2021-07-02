import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { Field, ArgsType, ID } from '@nestjs/graphql';

@ArgsType()
export class UpdateHabitTemplateGDto {
  @Field(type => ID, { description: 'habit template id' })
  @IsUUID()
  id: string;

  @Field({ nullable: true, description: 'habit template name' })
  @IsString()
  @IsOptional()
  name: string;

  @Field({ nullable: true, description: 'habit template points' })
  @IsInt()
  @IsOptional()
  points: number;

  @Field({ nullable: true, description: 'habit template description' })
  @IsString()
  @IsOptional()
  description: string;

  @Field({
    nullable: true,
    description:
      'habit template default reccurence. Should be a valid postgres inverval string',
  })
  @IsString()
  @IsOptional()
  defaultReccurence: string;

  @Field(type => ID, {
    nullable: true,
    description: 'category id, to which habit template belongs',
  })
  @IsString()
  @IsOptional()
  categoryId: string;
}
