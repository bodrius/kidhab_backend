import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UseGuards,
  Query,
  ParseIntPipe,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AwardTemplatesService } from '../common/award-templates.service';
import { AwardTemplateEntity } from '../common/award-template.entity';
import { AwardTemplateSerializer } from './serializers/award-template.serializer';
import { ResponseInterceptor } from '@src/shared/interceptors/response.interceptor';
import { AdminTokenRestGuard } from '@src/shared/guards/admin-token-rest.guard';
import { Permissions } from '@src/shared/decorators/permissions.decorator';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { SystemGetAwardTemplatesSerializer } from './serializers/system-get-award-templates.serializer';
import { SystemCreateAwardTemplateDto } from '../common/dto/system-create-award-template.dto';
import { SystemUpdateAwardTemplateDto } from '../common/dto/system-update-award-template.dto';

@Controller('system/award-templates')
@UseGuards(AdminTokenRestGuard)
@ApiTags('Award Templates CRUD (Administration)')
@ApiBearerAuth()
export class SystemAwardTemplatesController {
  constructor(private awardTemplatesService: AwardTemplatesService) {}

  @Post('/')
  @Permissions(
    AdminPermissions.AWARD_TEMPLATES_ALL,
    AdminPermissions.AWARD_TEMPLATES_CREATE,
  )
  @UseInterceptors(new ResponseInterceptor(AwardTemplateSerializer))
  @ApiOperation({ summary: 'Create new system award template' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiCreatedResponse({
    description: 'System award template created',
    type: AwardTemplateSerializer,
  })
  async createAwardTemplate(
    @Body() systemCreateAwardTemplateDto: SystemCreateAwardTemplateDto,
  ): Promise<AwardTemplateEntity> {
    return this.awardTemplatesService.createAwardTemplate(
      systemCreateAwardTemplateDto,
    );
  }

  @Get('/')
  @Permissions(
    AdminPermissions.AWARD_TEMPLATES_ALL,
    AdminPermissions.AWARD_TEMPLATES_READ,
  )
  @UseInterceptors(new ResponseInterceptor(SystemGetAwardTemplatesSerializer))
  @ApiOperation({ summary: 'Get system award templates' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'System award templates returned',
    type: SystemGetAwardTemplatesSerializer,
  })
  async getAwardTemplates(
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetAwardTemplatesSerializer> {
    return this.awardTemplatesService.getAwardTemplatesSystem(page);
  }

  @Patch(':templateId')
  @Permissions(
    AdminPermissions.AWARD_TEMPLATES_ALL,
    AdminPermissions.AWARD_TEMPLATES_UPDATE,
  )
  @UseInterceptors(new ResponseInterceptor(AwardTemplateSerializer))
  @ApiOperation({ summary: 'Update system award template' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'System award template was not found' })
  @ApiOkResponse({ description: 'System award template updated' })
  async updateAwardTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() updateAwardTemplateDto: SystemUpdateAwardTemplateDto,
  ): Promise<AwardTemplateSerializer> {
    return this.awardTemplatesService.updateSystemAwardTemplate(
      templateId,
      updateAwardTemplateDto,
    );
  }

  @Delete(':templateId')
  @HttpCode(204)
  @Permissions(
    AdminPermissions.AWARD_TEMPLATES_ALL,
    AdminPermissions.AWARD_TEMPLATES_DELETE,
  )
  @ApiOperation({ summary: 'Delete system award template' })
  @ApiUnauthorizedResponse({ description: 'Bearer auth failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'System award template was not found' })
  @ApiNoContentResponse({ description: 'System award template deleted' })
  async deleteAwardTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
  ): Promise<void> {
    return this.awardTemplatesService.removeSystemAwardTemplate(templateId);
  }
}
