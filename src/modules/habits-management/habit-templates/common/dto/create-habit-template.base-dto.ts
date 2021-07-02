import { Field, ID } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsString, IsUUID } from "class-validator";

export class CreateHabitTemplateBaseDto {
  @ApiProperty()
  @Field(type => ID, {
    description: 'category id, to which habit template belongs',
  })
  @IsUUID()
  @Transform((value, obj) => {
    obj.category = { id: value };
    return value;
  })
  categoryId: string;

  @ApiProperty()
  @Field({ description: 'habit template points' })
  @IsInt()
  points: number;

  @ApiProperty()
  @Field({ description: 'habit template description' })
  @IsString()
  description: string;

  @ApiProperty()
  @Field({
    description:
      'habit template default reccurence. Should be valid postgres inverval string',
  })
  @IsString()
  defaultReccurence: string;
}
