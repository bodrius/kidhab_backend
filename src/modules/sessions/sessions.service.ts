import { ConflictException, Injectable } from '@nestjs/common';
import { SessionEntity } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionsRepository } from './sessions.repository';
import { ParentEntity } from '../parents/common/parent.entity';
import { ChildEntity } from '../children/common/child.entity';
import { DeepPartial } from 'typeorm';
import { AdminUserEntity } from '../admin-users/common/admin-user.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionsRepository)
    private sessionsRepository: SessionsRepository,
  ) {}

  async getById(id: string): Promise<SessionEntity> {
    return this.sessionsRepository.findActiveSessionById(id);
  }

  async createForParent(parent: ParentEntity): Promise<SessionEntity> {
    return this.sessionsRepository.save({ parent });
  }

  async createForChild(child: ChildEntity): Promise<SessionEntity> {
    return this.sessionsRepository.save({ child });
  }

  async createForAdminUser(adminUser: AdminUserEntity): Promise<SessionEntity> {
    return this.sessionsRepository.save({ adminUser });
  }

  async updateSession(
    session: SessionEntity,
    updateParams: DeepPartial<SessionEntity>,
  ): Promise<SessionEntity> {
    const { deviceToken } = updateParams;

    if (deviceToken) {
      const existingSessionWithDeviceToken = await this.sessionsRepository.findOne(
        { deviceToken },
      );
      if (existingSessionWithDeviceToken) {
        throw new ConflictException(
          `Session with device token ${deviceToken} already exists`,
        );
      }
    }

    return this.sessionsRepository.updateSession(session, updateParams);
  }

  async getFamilyParentsSessionsForPush(
    familyId: string,
  ): Promise<SessionEntity[]> {
    return this.sessionsRepository.findFamilyParentsSessionsForPush(familyId);
  }

  async getChildSessionsForPush(childIds: string[]): Promise<SessionEntity[]> {
    return this.sessionsRepository.findChildSessionsForPush(childIds);
  }

  async getParentSessionsForPush(parentId: string): Promise<SessionEntity[]> {
    return this.sessionsRepository.findParentSessionForPush(parentId);
  }

  async dropSession(session: SessionEntity): Promise<void> {
    await this.sessionsRepository.remove(session);
  }
}
