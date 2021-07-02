import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class SystemUpdateParentDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isTestPassed: boolean;
}
