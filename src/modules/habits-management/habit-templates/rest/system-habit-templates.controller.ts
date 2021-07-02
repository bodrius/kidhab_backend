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
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { Permissions } from '@src/shared/decorators/permissions.decorator';
import { AdminTokenRestGuard } from '@src/shared/guards/admin-token-rest.guard';
import { ResponseInterceptor } from '@src/shared/interceptors/response.interceptor';
import { SystemGetHabitCategoriesSerializer } from '../../habit-categories/rest/serializers/system-get-habit-categories.serializer';
import { SystemCreateHabitTemplateDto } from '../common/dto/system-create-habit-template.dto';
import { SystemUpdateHabitTemplateDto } from '../common/dto/update-habit-template.dto';
import { HabitTemplatesService } from '../common/habit-templates.service';
import { HabitTemplateSerializer } from './serializers/habit-template.serializer';
import { SystemGetHabitTemplatesSerializer } from './serializers/system-get-habit-templates.serializer';

@Controller('system/habit-templates')
@UseGuards(AdminTokenRestGuard)
@ApiTags('Habit Templates CRUD (Administration)')
@ApiBearerAuth()
export class SystemHabitTemplatesController {
  constructor(public habitTemplatesService: HabitTemplatesService) {}

  @Post()
  @Permissions(
    AdminPermissions.HABIT_TEMPLATES_ALL,
    AdminPermissions.HABIT_TEMPLATES_CREATE,
  )
  @UseInterceptors(new ResponseInterceptor(HabitTemplateSerializer))
  @ApiOperation({ summary: 'Create system habit template' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiCreatedResponse({
    description: 'System habit template created',
    type: HabitTemplateSerializer,
  })
  async createHabitTemplate(
    @Body() systemCreateHabitTemplateDto: SystemCreateHabitTemplateDto,
  ): Promise<HabitTemplateSerializer> {
    return this.habitTemplatesService.createSystemHabitTemplate(
      systemCreateHabitTemplateDto,
    );
  }

  @Get()
  @Permissions(
    AdminPermissions.HABIT_TEMPLATES_ALL,
    AdminPermissions.HABIT_TEMPLATES_READ,
  )
  @UseInterceptors(new ResponseInterceptor(SystemGetHabitCategoriesSerializer))
  @ApiOperation({ summary: 'Get system habit templates' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'System habit templates returned',
    type: SystemGetHabitTemplatesSerializer,
  })
  async getHabitTemplates(
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetHabitTemplatesSerializer> {
    return this.habitTemplatesService.getSystemHabitTemplates(page);
  }

  @Patch(':templateId')
  @Permissions(
    AdminPermissions.HABIT_TEMPLATES_ALL,
    AdminPermissions.HABIT_TEMPLATES_UPDATE,
  )
  @UseInterceptors(new ResponseInterceptor(HabitTemplateSerializer))
  @ApiOperation({ summary: 'Update system habit template' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({
    description: 'User does not have right permissions',
  })
  @ApiNotFoundResponse({ description: 'System habit template not found' })
  @ApiOkResponse({
    description: 'System habit template updated',
    type: HabitTemplateSerializer,
  })
  async updateHabitTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() systemUpdateHabitTemplateDto: SystemUpdateHabitTemplateDto,
  ): Promise<HabitTemplateSerializer> {
    return this.habitTemplatesService.updateSystemHabitTemplate(
      templateId,
      systemUpdateHabitTemplateDto,
    );
  }

  @Delete(':templateId')
  @Permissions(
    AdminPermissions.HABIT_TEMPLATES_ALL,
    AdminPermissions.HABIT_TEMPLATES_DELETE,
  )
  @UseInterceptors(new ResponseInterceptor(HabitTemplateSerializer))
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete system habit template' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({
    description: 'User does not have right permissions',
  })
  @ApiNotFoundResponse({ description: 'System habit template not found' })
  @ApiNoContentResponse({
    description: 'System habit template removed',
  })
  async deleteHabitTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
  ): Promise<void> {
    return this.habitTemplatesService.removeSystemHabitTemplate(templateId);
  }
}
