import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
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
import { ChildrenService } from '../common/children.service';
import { ChildSerializer } from './serializers/child.serializer';
import { SystemGetChildrenSerializer } from './serializers/system-get-children.serializer';

@Controller('system/children')
@UseGuards(AdminTokenRestGuard)
@ApiTags('Children CRUD (Administration)')
@ApiBearerAuth()
export class SystemChildrenController {
  constructor(public childrenService: ChildrenService) {}

  @Get()
  @Permissions(AdminPermissions.CHILDREN_ALL, AdminPermissions.CHILDREN_READ)
  @UseInterceptors(new ResponseInterceptor(SystemGetChildrenSerializer))
  @ApiOperation({ summary: 'Get children' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Children returned',
    type: SystemGetChildrenSerializer,
  })
  async getChildren(
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetChildrenSerializer> {
    return this.childrenService.getChildrenSystem(page);
  }

  @Get('search')
  @Permissions(AdminPermissions.CHILDREN_ALL, AdminPermissions.CHILDREN_READ)
  @UseInterceptors(new ResponseInterceptor(SystemGetChildrenSerializer))
  @ApiOperation({ summary: 'Get children by search query' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Children returned',
    type: SystemGetChildrenSerializer,
  })
  async searchChildren(
    @Query('query') query: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetChildrenSerializer> {
    return this.childrenService.searchChildrenSystem(query, page);
  }

  @Get(':childId')
  @Permissions(AdminPermissions.CHILDREN_ALL, AdminPermissions.CHILDREN_READ)
  @UseInterceptors(new ResponseInterceptor(ChildSerializer))
  @ApiOperation({ summary: 'Get child' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Child not found' })
  @ApiOkResponse({
    description: 'Child returned',
    type: ChildSerializer,
  })
  async getChild(
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<ChildSerializer> {
    return this.childrenService.getChildSystem(childId);
  }

  @Delete(':childId')
  @HttpCode(204)
  @Permissions(AdminPermissions.CHILDREN_ALL, AdminPermissions.CHILDREN_DELETE)
  @ApiOperation({ summary: 'Delete child' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Child not found' })
  @ApiNoContentResponse({ description: 'Child deleted' })
  async deleteChild(
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<void> {
    return this.childrenService.deleteChildSystem(childId);
  }
}
