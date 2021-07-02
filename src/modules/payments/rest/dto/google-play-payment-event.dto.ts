import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GooglePlayMessageDto } from './google-play-message.dto';

export class GooglePlayPaymentEventDto {
  @ApiProperty()
  @Type(() => GooglePlayMessageDto)
  @ValidateNested()
  message: GooglePlayMessageDto;
}
