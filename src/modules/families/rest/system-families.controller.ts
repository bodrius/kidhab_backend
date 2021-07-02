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
import { FamiliesService } from '../common/families.service';
import { SystemUpdateFamilyDto } from './dto/system-update-family.dto';
import { FamilySerializer } from './serializers/family.serializer';
import { SystemGetFamiliesSerializer } from './serializers/system-get-families.serializer';

@Controller('system/families')
@UseGuards(AdminTokenRestGuard)
@ApiTags('Families CRUD (Administration)')
@ApiBearerAuth()
export class SystemFamiliesController {
  constructor(public familiesService: FamiliesService) {}

  @Get()
  @Permissions(AdminPermissions.FAMILIES_ALL, AdminPermissions.FAMILIES_READ)
  @UseInterceptors(new ResponseInterceptor(SystemGetFamiliesSerializer))
  @ApiOperation({ summary: 'Get families' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiOkResponse({
    description: 'Families returned',
    type: SystemGetFamiliesSerializer,
  })
  async getFamilies(
    @Query('page', ParseIntPipe) page: number,
  ): Promise<SystemGetFamiliesSerializer> {
    return this.familiesService.findFamiliesSystem(page);
  }

  @Get(':familyId')
  @Permissions(AdminPermissions.FAMILIES_ALL, AdminPermissions.FAMILIES_READ)
  @UseInterceptors(new ResponseInterceptor(FamilySerializer))
  @ApiOperation({ summary: 'Get family by id' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Family not found' })
  @ApiOkResponse({
    description: 'Family returned',
    type: FamilySerializer,
  })
  async getFamily(
    @Param('familyId', ParseUUIDPipe) familyId: string,
  ): Promise<FamilySerializer> {
    return this.familiesService.findFamilySystem(familyId);
  }

  @Put(':familyId')
  @Permissions(AdminPermissions.FAMILIES_ALL, AdminPermissions.FAMILIES_UPDATE)
  @UseInterceptors(new ResponseInterceptor(FamilySerializer))
  @ApiOperation({ summary: 'Update family' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({
    description:
      'User does not have right permissions or test families quota reached',
  })
  @ApiNotFoundResponse({ description: 'Family not found' })
  @ApiOkResponse({
    description: 'Family updated',
    type: FamilySerializer,
  })
  async updateFamily(
    @Param('familyId', ParseUUIDPipe) familyId: string,
    @Body() systemUpdateFamilyDto: SystemUpdateFamilyDto,
  ): Promise<FamilySerializer> {
    return this.familiesService.updateFamilySystem(
      familyId,
      systemUpdateFamilyDto,
    );
  }

  @Delete(':familyId')
  @HttpCode(204)
  @Permissions(AdminPermissions.FAMILIES_ALL, AdminPermissions.FAMILIES_DELETE)
  @ApiOperation({ summary: 'Delete family' })
  @ApiUnauthorizedResponse({ description: 'Bearer authorization failed' })
  @ApiForbiddenResponse({ description: 'User does not have right permissions' })
  @ApiNotFoundResponse({ description: 'Family not found' })
  @ApiNoContentResponse({ description: 'Family deleted' })
  async deleteFamily(
    @Param('familyId', ParseUUIDPipe) familyId: string,
  ): Promise<void> {
    return this.familiesService.deleteFamilySystem(familyId);
  }
}
