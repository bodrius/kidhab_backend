import {
  DeepPartial,
  EntityRepository,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { SessionEntity } from './session.entity';
import { SessionStatuses } from './session-statuses.enum';

@EntityRepository(SessionEntity)
export class SessionsRepository extends Repository<SessionEntity> {
  async findActiveSessionById(id: string): Promise<SessionEntity> {
    return this.findOne({
      where: { id, status: SessionStatuses.ACTIVE },
      relations: ['parent', 'child', 'adminUser', 'adminUser.role'],
    });
  }

  async findFamilyParentsSessionsForPush(
    familyId: string,
  ): Promise<SessionEntity[]> {
    return this.createQueryBuilder('s')
      .innerJoinAndSelect('s.parent', 'p')
      .innerJoin('p.family', 'f')
      .where('s.status = :status', { status: SessionStatuses.ACTIVE })
      .andWhere('s.deviceToken IS NOT NULL')
      .andWhere('f.id = :familyId', { familyId })
      .andWhere('s.parentId IS NOT NULL')
      .getMany();
  }

  async updateSession(
    session: SessionEntity,
    updateParams: DeepPartial<SessionEntity>,
  ): Promise<SessionEntity> {
    const sessionToUpdate = this.merge(session, updateParams);
    return this.save(sessionToUpdate);
  }

  async findChildSessionsForPush(childIds: string[]): Promise<SessionEntity[]> {
    return this.find({
      where: {
        child: { id: In(childIds) },
        status: SessionStatuses.ACTIVE,
        deviceToken: Not(IsNull()),
      },
      relations: ['child'],
    });
  }

  async findParentSessionForPush(parentId: string): Promise<SessionEntity[]> {
    return this.find({
      where: {
        parent: { id: parentId },
        status: SessionStatuses.ACTIVE,
        deviceToken: Not(IsNull()),
      },
      relations: ['parent'],
    });
  }
}
