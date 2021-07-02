import { EntityRepository, In, Repository } from 'typeorm';
import { FamilyAccountTypes } from './family-account-types.enum';
import { FamilyEntity } from './family.entity';

@EntityRepository(FamilyEntity)
export class FamiliesRepository extends Repository<FamilyEntity> {
  async getFamiliesWithExpiredPremium(): Promise<string[]> {
    const families = await this.query(`
      SELECT id
      FROM families
      WHERE "subscriptionExpiresAt" < CURRENT_TIMESTAMP
    `);

    return families.map(f => f.id);
  }

  async updateFamiliesAccountType(
    ids: string[],
    accountType: FamilyAccountTypes,
  ): Promise<void> {
    await this.update({ id: In(ids) }, { accountType });
  }

  async countTestFamilies(): Promise<number> {
    return this.count({ isTest: true });
  }
}
