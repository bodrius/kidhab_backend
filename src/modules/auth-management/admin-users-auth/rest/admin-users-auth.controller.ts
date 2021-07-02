import {
  Controller,
  UseInterceptors,
  Body,
  Post,
  HttpCode,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ResponseInterceptor } from '@src/shared/interceptors/response.interceptor';
import { AdminUsersAuthService } from '../common/admin-users-auth.service';
import { AdminUserSignInDto } from './dto/admin-user-sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminUserAuthSerializer } from './serializers/admin-user-auth.serializer';

@ApiTags('Admin Users Auth')
@Controller('admin-users-auth')
@UseInterceptors(new ResponseInterceptor(AdminUserAuthSerializer))
export class AdminUsersAuthController {
  constructor(private adminUsersAuthService: AdminUsersAuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in admin user' })
  @ApiNotFoundResponse({
    description: 'Admin user with such email does not exist',
  })
  @ApiUnauthorizedResponse({
    description: 'Password is wrong',
  })
  @ApiCreatedResponse({
    description: 'New session successfully created',
    type: AdminUserAuthSerializer,
  })
  async signIn(
    @Body() adminUserSignInDto: AdminUserSignInDto,
  ): Promise<AdminUserAuthSerializer> {
    return this.adminUsersAuthService.signIn(adminUserSignInDto);
  }

  @Patch('reset-password')
  @HttpCode(204)
  @ApiNotFoundResponse({
    description: 'Admin user with such email does not exist',
  })
  @ApiUnauthorizedResponse({
    description: 'Old password is wrong',
  })
  @ApiNoContentResponse({
    description: 'Password has been resettled',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    return this.adminUsersAuthService.resetPassword(resetPasswordDto);
  }
}
