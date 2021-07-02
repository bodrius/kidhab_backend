import {
  Controller,
  UseInterceptors,
  Request,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ParentsAuthService } from '../common/parents-auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IParentWithToken } from '../common/parent-with-token.interface';
import { ResponseInterceptor } from '@src/shared/interceptors/response.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { DUser } from '@src/shared/decorators/user.decorator';
import { ParentsAuthSerializer } from './serializers/parents-auth.serializer';

@ApiTags('Parents Auth')
@Controller('parents/auth')
@UseInterceptors(new ResponseInterceptor(ParentsAuthSerializer))
export class ParentsAuthController {
  constructor(private parentsAuthService: ParentsAuthService) {}

  @UseGuards(AuthGuard('google'))
  @Get('google')
  @ApiOperation({
    summary:
      'Google OAuth endpoint. WARNING!!!! Do not test it from swagger - it should be tested from browser address string',
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  signInGoogle(@Request() req): void {}

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @ApiOperation({
    summary:
      'Google OAuth internal endpoint. WARNING!!!! Do not test it from swagger - it should be tested from browser address string',
  })
  async signInGoogleCallback(
    @DUser() parent: ParentEntity,
  ): Promise<IParentWithToken> {
    return this.parentsAuthService.signInGoogle(parent);
  }
}
