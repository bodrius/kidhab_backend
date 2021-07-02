import { Injectable, ForbiddenException } from '@nestjs/common';
import { AwardEntity } from './award.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAwardRequestDto } from './dto/create-award-request.dto';
import { AwardsRepository } from './awards.repository';
import { AwardStatuses } from './award-statuses.enum';
import { Not } from 'typeorm';

@Injectable()
export class ActiveAwardsService {
  constructor(
    @InjectRepository(AwardsRepository)
    private awardsRepository: AwardsRepository,
  ) {}

  checkOnlyOneActive(awards: CreateAwardRequestDto[]): void {
    const awardsToMakeActive = awards.filter(award => award.isActive);
    if (awardsToMakeActive.length > 1) {
      throw new ForbiddenException('Only one award could be settled as active');
    }
  }

  async setNewActiveAwardFromArray(
    awards: AwardEntity[],
  ): Promise<AwardEntity[]> {
    return Promise.all(awards.map(award => this.setNewActiveAward(award)));
  }

  async setNewActiveAward(award: AwardEntity): Promise<AwardEntity> {
    if (!award.isActive) {
      return award;
    }

    await this.awardsRepository.update(
      { child: { id: award.childId } },
      { isActive: false },
    );

    award.isActive = true;
    return this.awardsRepository.save(award);
  }

  async chooseNewActiveAward(removedAward: AwardEntity): Promise<void> {
    if (!removedAward.isActive) {
      return;
    }

    const newActiveAward = await this.awardsRepository.findOne({
      where: {
        child: { id: removedAward.childId },
        status: Not(AwardStatuses.PURCHASED),
      },
      order: { updatedAt: 'DESC' },
    });

    if (!newActiveAward) {
      return;
    }

    newActiveAward.isActive = true;
    await this.awardsRepository.save(newActiveAward);
  }
}
