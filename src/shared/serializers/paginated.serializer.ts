import { ApiProperty } from "@nestjs/swagger";

export class PaginatedSerializer {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  recordsCount: number;
}