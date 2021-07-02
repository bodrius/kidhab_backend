import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GooglePlayMessageDto {
  @ApiProperty()
  @IsString()
  data: string;
}
