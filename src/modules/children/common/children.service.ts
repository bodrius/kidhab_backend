import * as SUUID from 'short-uuid';
import { FindOneOptions, FindConditions, UpdateResult, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChildEntity } from './child.entity';
import { ParentEntity } from '../../parents/common/parent.entity';
import { HabitCategoriesService } from '../../habits-management/habit-categories/common/habit-categories.service';
import { CreateChildDto } from '../graphql/dto/create-child.dto';
import { ChildrenRepository } from '@src/modules/children/common/children.repository';
import { ChecksService } from '@src/shared/checks/checks.service';
import { SystemGetChildrenSerializer } from '../rest/serializers/system-get-children.serializer';

@Injectable()
export class ChildrenService {
  private PAGE_SIZE = 20;

  constructor(
    @InjectRepository(ChildrenRepository)
    private childrenRepository: ChildrenRepository,
    private habitCategoriesService: HabitCategoriesService,
    private checksService: ChecksService,
  ) {}

  async createChild(
    parent: ParentEntity,
    createChildDto: CreateChildDto,
  ): Promise<ChildEntity> {
    const { gender, username, age, categoryIds } = createChildDto;

    await Promise.all(
      categoryIds.map(cid => this.habitCategoriesService.checkCategoryId(cid)),
    );

    return this.childrenRepository.save({
      parent,
      gender,
      username,
      age,
      language: parent.language,
      categories: categoryIds.map(id => ({
        id,
      })),
      inviteHash: SUUID.generate(),
      family: { id: parent.familyId },
    });
  }

  async getChild(
    criterias: FindOneOptions<ChildEntity> & FindConditions<ChildEntity>,
  ): Promise<ChildEntity> {
    return this.childrenRepository.findOne(criterias);
  }

  async getChildWithHabitsAndAwards(childId: string): Promise<ChildEntity> {
    return this.childrenRepository.getChildWithHabitsAndAwards(childId);
  }

  async getChildrenByFamilyId(familyId: string): Promise<ChildEntity[]> {
    return this.childrenRepository.find({
      where: { family: { id: familyId } },
    });
  }

  async getFamilyChildrenWithAwardsAndHabits(
    familyId: string,
  ): Promise<ChildEntity[]> {
    return this.childrenRepository.getFamilyChildrenWithAwardsAndHabits(
      familyId,
    );
  }

  async getChildrenSystem(page: number): Promise<SystemGetChildrenSerializer> {
    const [
      children,
      childrenCount,
    ] = await this.childrenRepository.findAndCount({
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
      order: { createdAt: 'DESC' },
    });

    return {
      children,
      pagesCount: Math.ceil(childrenCount / this.PAGE_SIZE),
      recordsCount: childrenCount,
    };
  }

  async searchChildrenSystem(
    query: string,
    page: number,
  ): Promise<SystemGetChildrenSerializer> {
    const [
      children,
      childrenCount,
    ] = await this.childrenRepository.findAndCount({
      where: { email: Like(`%${query}%`) },
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
      order: { createdAt: 'DESC' },
    });

    return {
      children,
      pagesCount: Math.ceil(childrenCount / this.PAGE_SIZE),
      recordsCount: childrenCount,
    };
  }

  async getChildSystem(childId: string): Promise<ChildEntity> {
    const child = await this.childrenRepository.findOne(childId);
    this.checksService.checkEntityExistence(child, childId, 'Child');
    return child;
  }

  async updateChild(
    child: ChildEntity,
    paramsToUpdate: Partial<ChildEntity>,
  ): Promise<ChildEntity> {
    const updatedChild = this.childrenRepository.merge(child, paramsToUpdate);
    return this.childrenRepository.save(updatedChild);
  }

  async incrementBalance(
    childId: string,
    pointsToAdd: number,
  ): Promise<UpdateResult> {
    return this.childrenRepository.increment(
      { id: childId },
      'balance',
      pointsToAdd,
    );
  }

  async upsertInviteHash(
    childId: string,
    parent: ParentEntity,
  ): Promise<ChildEntity> {
    const child = await this.childrenRepository.findOne(childId);

    this.checksService.checkEntityExistence(child, childId, 'Child');
    this.checksService.checkSameFamily(child, parent);

    if (!child.inviteHash) {
      return this.updateChild(child, { inviteHash: SUUID.generate() });
    }

    return child;
  }

  async deleteChildSystem(childId: string): Promise<void> {
    const deleteResult = await this.childrenRepository.delete({ id: childId });
    if (!deleteResult.affected) {
      throw new NotFoundException(`Child ${childId} not found`);
    }
  }
}
