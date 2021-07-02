import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HabitCategoriesService } from '../common/habit-categories.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HabitCategorySerializer } from './serializers/habit-category.serializer';
import { AdminTokenRestGuard } from '@src/shared/guards/admin-token-rest.guard';
import { Permissions } from '@src/shared/decorators/permissions.decorator';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { SystemGetHabitCategoriesSerializer } from './serializers/system-get-habit-categories.serializer';
import { ResponseInterceptor } from '@src/shared/interceptors/response.interceptor';
import { SystemCreateHabitCategoryDto } from '../common/dto/system-create-habit-category.dto';

@Controller('system/habit-categories')
@UseGuards(AdminTokenRestGuard)
@ApiTags('Habit Categories CRUD (Administration)')
@ApiBearerAuth()
export class SystemHabitCategoriesController {
  constructor(public habitCategoriesService: HabitCategoriesService) {}

  @Post()
  @Permissions(
    AdminPermissions.HABIT_CATEGORIES_ALL,
    AdminPermissions.HABIT_CATEGORIES_CREATE,
  )
  @UseInterceptors(new ResponseInterceptor(HabitCategorySerializer))
  @ApiOperation({ summary: 'Create habit category' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiCreatedResponse({
    description: 'Habit category created',
    type: HabitCategorySerializer,
  })
  async createHabitCategory(
    @Body() systemCreateHabitCategoryDto: SystemCreateHabitCategoryDto,
  ): Promise<HabitCategorySerializer> {
    return this.habitCategoriesService.createHabitCategory(
      systemCreateHabitCategoryDto,
    );
  }

  @Get()
  @Permissions(
    AdminPermissions.HABIT_CATEGORIES_ALL,
    AdminPermissions.HABIT_CATEGORIES_READ,
  )
  @UseInterceptors(new ResponseInterceptor(SystemGetHabitCategoriesSerializer))
  @ApiOperation({ summary: 'Get habit categories' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Habit categories returned',
    type: SystemGetHabitCategoriesSerializer,
  })
  async getHabitCategories(
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetHabitCategoriesSerializer> {
    return this.habitCategoriesService.getHabitCategoriesSystem(page);
  }

  @Patch(':categoryId')
  @Permissions(
    AdminPermissions.HABIT_CATEGORIES_ALL,
    AdminPermissions.HABIT_CATEGORIES_UPDATE,
  )
  @UseInterceptors(new ResponseInterceptor(HabitCategorySerializer))
  @ApiOperation({ summary: 'Update habit category' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Habit category updated',
    type: HabitCategorySerializer,
  })
  async updateHabitCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() updateHabitCategoryDto: SystemCreateHabitCategoryDto,
  ): Promise<HabitCategorySerializer> {
    return this.habitCategoriesService.updateHabitCategory(
      categoryId,
      updateHabitCategoryDto,
    );
  }

  @Delete(':categoryId')
  @HttpCode(204)
  @Permissions(
    AdminPermissions.HABIT_CATEGORIES_ALL,
    AdminPermissions.HABIT_CATEGORIES_DELETE,
  )
  @ApiOperation({ summary: 'Soft-delete habit category' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Habit category not found' })
  @ApiNoContentResponse({
    description: 'Habit category soft-deleted',
  })
  async softDeleteHabitCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<void> {
    return this.habitCategoriesService.softDeleteCategorySystem(categoryId);
  }
}
