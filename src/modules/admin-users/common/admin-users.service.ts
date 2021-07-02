import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindConditions, Repository } from 'typeorm';
import { AdminUserEntity } from './admin-user.entity';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private adminUsersRepository: Repository<AdminUserEntity>,
  ) {}

  async findAdminUser(
    criteria: FindConditions<AdminUserEntity>,
  ): Promise<AdminUserEntity> {
    return this.adminUsersRepository.findOne(criteria, { relations: ['role'] });
  }

  async updateAdminUser(
    adminUser: AdminUserEntity,
    updateParams: DeepPartial<AdminUserEntity>,
  ): Promise<AdminUserEntity> {
    const adminUserToUpdate = this.adminUsersRepository.merge(
      adminUser,
      updateParams,
    );
    return this.adminUsersRepository.save(adminUserToUpdate);
  }
}
