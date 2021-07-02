import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './common/admin-user.entity';
import { AdminUsersService } from './common/admin-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserEntity])],
  controllers: [],
  providers: [AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
