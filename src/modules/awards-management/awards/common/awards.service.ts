import {
  Injectable,
  forwardRef,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import * as _ from 'lodash';
import { AwardEntity } from './award.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'typeorm';
import { CreateAwardRequestDto } from './dto/create-award-request.dto';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { CreateAwardsDto } from './dto/create-awards.dto';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { ChildrenService } from '@src/modules/children/common/children.service';
import { UpdateAwardGqlDto } from './dto/update-award.dto';
import { ReviewAwardDraftDto } from './dto/review-award-draft.dto';
import { NotificationsForParentService } from '@src/modules/notifications/notifications-for-parent/common/notifications-for-parent.service';
import { ParentNotificationsTypes } from '@src/shared/interfaces/parent-notifications-types.enum';
import { ActiveAwardsService } from './active-awards.service';
import { ChecksService } from '@src/shared/checks/checks.service';
import { PushNotificationsService } from '@src/modules/push-notifications/push-notifications.service';
import { AwardsRepository } from './awards.repository';
import { AwardTemplatesService } from '../../award-templates/common/award-templates.service';
import { AwardTemplateEntity } from '../../award-templates/common/award-template.entity';

@Injectable()
export class AwardsService {
  constructor(
    @InjectRepository(AwardsRepository)
    private awardsRepository: AwardsRepository,
    @Inject(forwardRef(() => ChildrenService))
    private childrenService: ChildrenService,
    private notificationsForParentService: NotificationsForParentService,
    private activeAwardsService: ActiveAwardsService,
    private pushNotificationsService: PushNotificationsService,
    private awardTemplatesService: AwardTemplatesService,
    private checksService: ChecksService,
  ) {}

  async createAwards(
    awards: CreateAwardRequestDto[],
    child: ChildEntity,
    awardTemplates: AwardTemplateEntity[] = [],
  ): Promise<AwardEntity[]> {
    this.activeAwardsService.checkOnlyOneActive(awards);
    const awardsWithTranslations = this.composeWithTranslations(
      awards,
      awardTemplates,
    );

    const awardEntities = await this.awardsRepository.save(
      awardsWithTranslations.map(award => ({ ...award, child })),
    );

    await Promise.all(
      awardEntities.map(award =>
        this.pushNotificationsService.sendAwardUpdated(child, award),
      ),
    );
    return this.activeAwardsService.setNewActiveAwardFromArray(awardEntities);
  }

  async createAwardsGql(
    createAwardsDto: CreateAwardsDto,
    parent: ParentEntity,
    ctxChild: ChildEntity,
  ): Promise<AwardEntity[]> {
    const { childId, awards } = createAwardsDto;

    this.checksService.checkChildInfoPassedGql(ctxChild, childId);

    const awardTemplateIds = this.getAwardTemplateIds(awards);
    const awardTemplates = await this.awardTemplatesService.getAwardTemplatesByIds(
      awardTemplateIds,
    );

    this.checksService.checkEntitiesExistence(
      awardTemplates,
      awardTemplateIds,
      'Award Template',
    );

    let child: ChildEntity;
    if (childId) {
      child = await this.childrenService.getChild({ id: childId });
    } else {
      child = ctxChild;
    }

    this.checksService.checkSameFamily(child, parent);

    return this.createAwards(awards, child, awardTemplates);
  }

  async createAward(
    parent: ParentEntity,
    childId: string,
    createAwardDto: CreateAwardRequestDto,
  ): Promise<AwardEntity> {
    const child = await this.childrenService.getChild({ id: childId });

    this.checksService.checkEntityExistence(child, childId, 'Child');
    this.checksService.checkSameFamily(child, parent);

    const [award] = await this.createAwards([createAwardDto], child);
    return award;
  }

  async createAwardDraft(
    child: ChildEntity,
    createAwardDto: CreateAwardRequestDto,
  ): Promise<AwardEntity> {
    const { templateId } = createAwardDto;
    const awardToCreate = this.awardsRepository.merge(new AwardEntity(), {
      draft: createAwardDto,
      child,
    });

    if (templateId) {
      const [
        awardTemplate,
      ] = await this.awardTemplatesService.getAwardTemplatesByIds([templateId]);
      this.checksService.checkEntityExistence(
        awardTemplate,
        templateId,
        'Habit Template',
      );
      const { name, translations } = this.getNameAndTranslations(templateId, [
        awardTemplate,
      ]);

      awardToCreate.draft.name = name;
      awardToCreate.draft.translations = translations;
    }

    const newAward = await this.awardsRepository.save(awardToCreate);

    const notifications = await this.notificationsForParentService.addAwardNotificationForFamilyParents(
      child,
      newAward.id,
      ParentNotificationsTypes.AWARD_CREATION_REQUESTED,
    );
    await this.pushNotificationsService.sendAwardDraftChange(
      notifications,
      child,
      true,
    );

    return newAward;
  }

  async getChildAwards(childId: string): Promise<AwardEntity[]> {
    return this.awardsRepository.find({ child: { id: childId } });
  }

  async getById(awardId: string): Promise<AwardEntity> {
    return this.awardsRepository.findOne(awardId);
  }

  async updateAward(
    awardId: string,
    updateAwardDto: UpdateAwardGqlDto,
    parent: ParentEntity,
  ): Promise<AwardEntity> {
    const award = await this.awardsRepository.findOne(awardId, {
      relations: ['child'],
    });

    this.checksService.checkEntityExistence(award, awardId, 'Award');
    this.checksService.checkSameFamily(award.child, parent);
    this.checksService.checkAwardPurchased(award);

    const updatedAward = await this.updateAwardEntity(award, updateAwardDto);
    await this.pushNotificationsService.sendAwardUpdated(award.child, award);
    return this.activeAwardsService.setNewActiveAward(updatedAward);
  }

  async updateAwardDraft(
    awardId: string,
    updateAwardDto: UpdateAwardGqlDto,
    child: ChildEntity,
  ): Promise<AwardEntity> {
    const award = await this.awardsRepository.findOne(awardId);

    this.checksService.checkEntityExistence(award, awardId, 'Award');
    this.checksService.checkChildAuthor(child, award, 'Award');
    this.checksService.checkAwardPurchased(award);

    const updatedAward = await this.updateAwardEntity(award, {
      draft: updateAwardDto,
    });

    const notifications = await this.notificationsForParentService.addAwardNotificationForFamilyParents(
      child,
      updatedAward.id,
      ParentNotificationsTypes.AWARD_UPDATE_REQUESTED,
    );
    await this.pushNotificationsService.sendAwardDraftChange(
      notifications,
      child,
      false,
    );

    return updatedAward;
  }

  async reviewAwardDraft(
    awardId: string,
    reviewAwardDraftDto: ReviewAwardDraftDto,
    parent: ParentEntity,
  ): Promise<AwardEntity> {
    const award = await this.awardsRepository.findOne(awardId, {
      relations: ['child'],
    });

    this.checksService.checkEntityExistence(award, awardId, 'Award');
    this.checksService.checkDraftExistance(award, awardId, 'Award');
    this.checksService.checkSameFamily(award.child, parent);
    this.checksService.checkAwardPurchased(award);

    if (reviewAwardDraftDto.approve) {
      const updatedAward = await this.updateAwardEntity(award, {
        ...award.draft,
        draft: null,
      });
      await this.pushNotificationsService.sendAwardReviewed(
        award.child,
        updatedAward,
        true,
      );

      return this.activeAwardsService.setNewActiveAward(updatedAward);
    }

    const updatedAward = await this.updateAwardEntity(award, { draft: null });
    await this.pushNotificationsService.sendAwardReviewed(
      award.child,
      updatedAward,
      false,
    );

    return updatedAward;
  }

  async purchaseAward(
    awardId: string,
    child: ChildEntity,
  ): Promise<AwardEntity> {
    const award = await this.awardsRepository.findOne(awardId);

    this.checksService.checkEntityExistence(award, awardId, 'Award');
    this.checksService.checkAwardPurchased(award);
    const doesHaveEnoughPoints = child.balance >= award.cost;
    if (!doesHaveEnoughPoints) {
      throw new ForbiddenException(
        'Child does not have enough points to purchase award',
      );
    }

    const purchasedAward = await this.awardsRepository.purchaseAward(
      child,
      award,
    );
    await this.notificationsForParentService.removeNotificationsForAward(
      award.id,
    );
    await this.pushNotificationsService.sendAwardPurchased(
      child,
      purchasedAward,
    );

    return purchasedAward;
  }

  async deleteAwardByChild(awardId: string, child: ChildEntity): Promise<void> {
    const award = await this.awardsRepository.findOne(awardId);

    this.checksService.checkEntityExistence(award, awardId, 'Award');
    this.checksService.checkChildAuthor(child, award, 'Award');
    this.checksService.checkAwardPurchased(award);

    await this.awardsRepository.remove(award);
    await this.activeAwardsService.chooseNewActiveAward(award);
  }

  async deleteAwardByParent(
    awardId: string,
    parent: ParentEntity,
  ): Promise<void> {
    const award = await this.awardsRepository.findOne(awardId, {
      relations: ['child'],
    });

    this.checksService.checkEntityExistence(award, awardId, 'Award');
    this.checksService.checkSameFamily(award.child, parent);
    this.checksService.checkAwardPurchased(award);

    await this.awardsRepository.remove(award);
    await this.activeAwardsService.chooseNewActiveAward(award);
  }

  private async updateAwardEntity(
    award: AwardEntity,
    params: DeepPartial<AwardEntity>,
  ) {
    const awardToUpdate = this.awardsRepository.merge(award, params);
    return this.awardsRepository.save(awardToUpdate);
  }

  private composeWithTranslations(
    awards: CreateAwardRequestDto[],
    awardTemplates: AwardTemplateEntity[] = null,
  ): DeepPartial<AwardEntity>[] {
    return awards.map(award => {
      const { templateId } = award;

      if (templateId && awardTemplates) {
        return {
          ...award,
          ...this.getNameAndTranslations(templateId, awardTemplates),
        };
      }

      return award;
    });
  }

  getNameAndTranslations(
    templateId: string,
    awardTemplates: AwardTemplateEntity[],
  ) {
    const awardTemplate = awardTemplates.find(
      template => template.id === templateId,
    );

    return {
      name: awardTemplate.name,
      translations: awardTemplate.translations,
    };
  }

  getAwardTemplateIds(awards: CreateAwardRequestDto[]): string[] {
    const awardTemplateIds = awards
      .map(awardDto => awardDto.templateId)
      .filter(Boolean);
    return _.uniq(awardTemplateIds);
  }
}
