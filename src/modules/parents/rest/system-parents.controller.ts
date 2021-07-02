import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { ParentEntity } from '../common/parent.entity';
import { ParentsService } from '../common/parents.service';
import { SystemUpdateParentDto } from './dto/system-update-parent.dto';
import { ParentSerializer } from './serializers/parent.serializer';
import { SystemGetParentsSerializer } from './serializers/system-get-parents.serializer';

@Controller('system/parents')
@UseGuards(AdminTokenRestGuard)
@ApiTags('Parents CRUD (Administration)')
@ApiBearerAuth()
export class SystemParentsController {
  constructor(public parentsService: ParentsService) {}

  @Get()
  @Permissions(AdminPermissions.PARENTS_ALL, AdminPermissions.PARENTS_READ)
  @UseInterceptors(new ResponseInterceptor(SystemGetParentsSerializer))
  @ApiOperation({ summary: 'Get parents' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Parents returned',
    type: SystemGetParentsSerializer,
  })
  async getParents(
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetParentsSerializer> {
    return this.parentsService.findParentsSystem(page);
  }

  @Get('search')
  @Permissions(AdminPermissions.PARENTS_ALL, AdminPermissions.PARENTS_READ)
  @UseInterceptors(new ResponseInterceptor(SystemGetParentsSerializer))
  @ApiOperation({ summary: 'Get parents by search query' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Parents returned',
    type: SystemGetParentsSerializer,
  })
  async searchParents(
    @Query('query') query: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetParentsSerializer> {
    return this.parentsService.searchParentsSystem(query, page);
  }

  @Get(':parentId')
  @Permissions(AdminPermissions.PARENTS_ALL, AdminPermissions.PARENTS_READ)
  @UseInterceptors(new ResponseInterceptor(ParentSerializer))
  @ApiOperation({ summary: 'Get parents' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Parent not found' })
  @ApiOkResponse({
    description: 'Parent returned',
    type: ParentSerializer,
  })
  async getParent(
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ): Promise<ParentEntity> {
    return this.parentsService.findParentSystem(parentId);
  }

  @Put(':parentId')
  @Permissions(AdminPermissions.PARENTS_ALL, AdminPermissions.PARENTS_UPDATE)
  @UseInterceptors(new ResponseInterceptor(ParentSerializer))
  @ApiOperation({ summary: 'Update parent' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Parent not found' })
  @ApiOkResponse({
    description: 'Parent updated',
    type: ParentSerializer,
  })
  async updateParent(
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Body() systemUpdateParentDto: SystemUpdateParentDto,
  ): Promise<ParentEntity> {
    return this.parentsService.updateParentSystem(
      parentId,
      systemUpdateParentDto,
    );
  }

  @Delete(':parentId')
  @HttpCode(204)
  @Permissions(AdminPermissions.PARENTS_ALL, AdminPermissions.PARENTS_DELETE)
  @ApiOperation({ summary: 'Delete parent' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Parent not found' })
  @ApiNoContentResponse({ description: 'Parent deleted' })
  async deleteParent(
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ): Promise<void> {
    return this.parentsService.deleteParentSystem(parentId);
  }
}
