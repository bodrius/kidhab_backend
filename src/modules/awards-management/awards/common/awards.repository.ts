import {
  Connection,
  EntityRepository,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { AwardEntity } from '@src/modules/awards-management/awards/common/award.entity';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { AwardStatuses } from './award-statuses.enum';

@EntityRepository(AwardEntity)
export class AwardsRepository extends Repository<AwardEntity> {
  constructor(private connection: Connection) {
    super();
  }

  async purchaseAward(
    child: ChildEntity,
    award: AwardEntity,
  ): Promise<AwardEntity> {
    await this.manager.increment(
      ChildEntity,
      {
        id: child.id,
        status: Not(AwardStatuses.PURCHASED),
        balance: MoreThanOrEqual(award.cost),
      },
      'balance',
      -award.cost,
    );

    await this.update(
      { id: award.id },
      { status: AwardStatuses.PURCHASED, isActive: false, draft: null },
    );

    return this.findOne(award.id);
  }
}
