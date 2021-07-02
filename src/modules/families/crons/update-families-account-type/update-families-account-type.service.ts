import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamiliesRepository } from '../../common/families.repository';
import { FamilyAccountTypes } from '../../common/family-account-types.enum';

@Injectable()
export class UpdateFamiliesAccountTypeService {
  private readonly logger = new Logger(UpdateFamiliesAccountTypeService.name);

  constructor(
    @InjectRepository(FamiliesRepository)
    private familiesRepository: FamiliesRepository,
  ) {}

  async updateFamiliesAccountType(): Promise<void> {
    this.logger.debug('cron started');

    const familyIdsWithExpiredPremium = await this.familiesRepository.getFamiliesWithExpiredPremium();
    await this.familiesRepository.updateFamiliesAccountType(
      familyIdsWithExpiredPremium,
      FamilyAccountTypes.BASIC,
    );

    this.logger.debug('cron finished');
  }
}
