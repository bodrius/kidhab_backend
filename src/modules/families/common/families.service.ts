import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyEntity } from './family.entity';
import { AwardTemplatesService } from '@src/modules/awards-management/award-templates/common/award-templates.service';
import { HabitTemplatesService } from '@src/modules/habits-management/habit-templates/common/habit-templates.service';
import { FamiliesRepository } from './families.repository';
import { DeepPartial, DeleteResult } from 'typeorm';
import { SystemGetFamiliesSerializer } from '../rest/serializers/system-get-families.serializer';
import { ChecksService } from '@src/shared/checks/checks.service';
import { SystemUpdateFamilyDto } from '../rest/dto/system-update-family.dto';
import { ConfigService } from '@nestjs/config';
import { PaymentsRepository } from '@src/modules/payments/common/payments.repository';
import { PaymentEntity } from '@src/modules/payments/common/payment.entity';

@Injectable()
export class FamiliesService {
  private PAGE_SIZE = 20;

  constructor(
    @InjectRepository(FamiliesRepository)
    private familiesRepository: FamiliesRepository,
    @InjectRepository(PaymentsRepository)
    private paymentsRepository: PaymentsRepository,
    private awardTemplatesService: AwardTemplatesService,
    private habitTemplatesService: HabitTemplatesService,
    private checksService: ChecksService,
    private configService: ConfigService,
  ) {}

  async create(params?: Partial<FamilyEntity>): Promise<FamilyEntity> {
    const family = await this.familiesRepository.save(params ?? {});

    await this.awardTemplatesService.createAwardTemplatesForFamily(family);
    await this.habitTemplatesService.createHabitTemplatesForFamily(family);

    return family;
  }

  async getById(id: string, relations: string[] = []): Promise<FamilyEntity> {
    return this.familiesRepository.findOne(id, { relations });
  }

  async getBySubscriptionId(subscriptionId: string): Promise<FamilyEntity> {
    return this.familiesRepository.findOne({ subscriptionId });
  }

  async findFamiliesSystem(page: number): Promise<SystemGetFamiliesSerializer> {
    const [
      families,
      familiesCount,
    ] = await this.familiesRepository.findAndCount({
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
      order: { createdAt: 'DESC' },
    });

    return {
      families,
      pagesCount: Math.ceil(familiesCount / this.PAGE_SIZE),
      recordsCount: familiesCount,
    };
  }

  async findFamilySystem(familyId: string): Promise<FamilyEntity> {
    const family = await this.familiesRepository.findOne(familyId);
    this.checksService.checkEntityExistence(family, familyId, 'Family');
    return family;
  }

  async update(
    familyId: string,
    updateParams: DeepPartial<FamilyEntity>,
  ): Promise<FamilyEntity> {
    await this.familiesRepository.update(familyId, updateParams);
    return this.familiesRepository.findOne(familyId);
  }

  async updateFamilySystem(
    familyId: string,
    systemUpdateFamilyDto: SystemUpdateFamilyDto,
  ): Promise<FamilyEntity> {
    const family = await this.familiesRepository.findOne(familyId);
    this.checksService.checkEntityExistence(family, familyId, 'Family');
    this.checkTestFamiliesQuota(systemUpdateFamilyDto.isTest);

    const updatedFamily = await this.update(family.id, systemUpdateFamilyDto);
    if (systemUpdateFamilyDto.subscriptionId) {
      const paymentUpdateObj: DeepPartial<PaymentEntity> = {
        family: { id: family.id },
      };
      if (systemUpdateFamilyDto.subscriptionExpiresAt) {
        paymentUpdateObj.expiresAt =
          systemUpdateFamilyDto.subscriptionExpiresAt;
      }

      await this.paymentsRepository.update(
        { subscriptionId: systemUpdateFamilyDto.subscriptionId },
        paymentUpdateObj,
      );
    }

    return updatedFamily;
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.familiesRepository.delete(id);
  }

  async deleteFamilySystem(familyId: string): Promise<void> {
    const familyDeleteResult = await this.familiesRepository.delete({
      id: familyId,
    });
    if (!familyDeleteResult.affected) {
      throw new NotFoundException(`Family ${familyId} not found`);
    }
  }

  private async checkTestFamiliesQuota(isTest: boolean) {
    const { testFamiliesQuota } = this.configService.get('general');

    if (!isTest) {
      return;
    }

    const testFamiliesCount = await this.familiesRepository.countTestFamilies();
    if (testFamiliesCount >= testFamiliesQuota) {
      throw new ForbiddenException(`Test families quota reached`);
    }
  }
}
