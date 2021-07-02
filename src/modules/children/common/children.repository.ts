import {
  EntityRepository,
  IsNull,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { HabitsStatuses } from '@src/modules/habits-management/habits/common/habits-statuses.enum';

@EntityRepository(ChildEntity)
export class ChildrenRepository extends Repository<ChildEntity> {
  public async getChildWithHabitsAndAwards(
    childId: string,
  ): Promise<ChildEntity> {
    return this.getChildrenWithHabitsAndAwardsBase()
      .where({ id: childId })
      .getOne();
  }

  public async getFamilyChildrenWithAwardsAndHabits(
    familyId: string,
  ): Promise<ChildEntity[]> {
    return this.getChildrenWithHabitsAndAwardsBase()
      .where({ family: { id: familyId } })
      .getMany();
  }

  public async getChildrenWithoutCreds(): Promise<ChildEntity[]> {
    return this.find({
      where: { email: IsNull(), passwordHash: IsNull() },
      select: ['id'],
    });
  }

  private getChildrenWithHabitsAndAwardsBase(): SelectQueryBuilder<
    ChildEntity
  > {
    return this.createQueryBuilder('children')
      .leftJoinAndSelect(
        'children.habits',
        'habits',
        'habits.status != :status',
        { status: HabitsStatuses.DELETED },
      )
      .leftJoinAndSelect('children.awards', 'awards');
  }
}
