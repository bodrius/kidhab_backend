import { Controller, Put, Body, Post, Get } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedsJsonDto } from './dto/seeds-json.dto';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('seeds')
@ApiTags('Database seeds CRUD')
export class SeedsController {
  constructor(private seedsService: SeedsService) {}

  @Get()
  @ApiOperation({ summary: 'Get seeds json' })
  @ApiNotFoundResponse({ description: 'seeds json not found' })
  @ApiOkResponse({ description: 'seeds json returned', type: SeedsJsonDto })
  async getSeedsJson(): Promise<SeedsJsonDto> {
    return this.seedsService.getSeedsJson();
  }

  @Post()
  @ApiOperation({ summary: 'Remove all test data from db and populate seeds' })
  @ApiNotFoundResponse({
    description: 'Category index not found in categories array',
  })
  @ApiCreatedResponse({ description: 'database restored' })
  async restoreDatabase(): Promise<void> {
    return this.seedsService.restoreDatabase();
  }

  @Put()
  @ApiOperation({ summary: 'Upsert new database seeds json' })
  @ApiOkResponse({ description: 'New seeds json upserted' })
  async upsertSeedsJson(@Body() seedsJsonDto: SeedsJsonDto): Promise<void> {
    await this.seedsService.upsertSeedsJson(seedsJsonDto);
  }
}
