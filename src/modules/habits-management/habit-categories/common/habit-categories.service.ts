import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HabitCategoryEntity } from './habit-category.entity';
import { HabitCategoriesRepository } from './habit-categories.repository';
import { ChecksService } from '@src/shared/checks/checks.service';
import { FindConditions } from 'typeorm';
import { SystemGetHabitCategoriesSerializer } from '../rest/serializers/system-get-habit-categories.serializer';
import { HabitCategoryStatuses } from './habit-category-statuses.enum';
import { SystemCreateHabitCategoryDto } from './dto/system-create-habit-category.dto';

@Injectable()
export class HabitCategoriesService {
  private PAGE_SIZE = 20;

  constructor(
    @InjectRepository(HabitCategoriesRepository)
    private habitCategoriesRepository: HabitCategoriesRepository,
    private checksService: ChecksService,
  ) {}

  public async createHabitCategory(
    systemCreateHabitCategoryDto: SystemCreateHabitCategoryDto,
  ): Promise<HabitCategoryEntity> {
    return this.habitCategoriesRepository.save(systemCreateHabitCategoryDto);
  }

  public async checkCategoryId(id: string): Promise<HabitCategoryEntity> {
    const category = await this.habitCategoriesRepository.findCategory({ id });
    this.checksService.checkEntityExistence(category, id, 'Habit Category');

    return category;
  }

  async getCategoriesWithTemplatesForFamily(
    familyId: string,
  ): Promise<HabitCategoryEntity[]> {
    return this.habitCategoriesRepository.getHabitCategoriesWithTemplates(
      familyId,
    );
  }

  async getCategory(
    criteria: FindConditions<HabitCategoryEntity>,
  ): Promise<HabitCategoryEntity> {
    return this.habitCategoriesRepository.findCategory(criteria);
  }

  async getHabitCategoriesSystem(
    page: number,
  ): Promise<SystemGetHabitCategoriesSerializer> {
    const [
      categories,
      categoriesCount,
    ] = await this.habitCategoriesRepository.findAndCount({
      where: { status: HabitCategoryStatuses.ACTIVE },
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
    });

    return {
      categories,
      pagesCount: Math.ceil(categoriesCount / this.PAGE_SIZE),
      recordsCount: categoriesCount,
    };
  }

  async updateHabitCategory(
    categoryId: string,
    updateHabitCategoryDto: SystemCreateHabitCategoryDto,
  ): Promise<HabitCategoryEntity> {
    const habitCategory = await this.habitCategoriesRepository.findCategory({
      id: categoryId,
    });
    this.checksService.checkEntityExistence(
      habitCategory,
      categoryId,
      'Habit Category',
    );

    return this.habitCategoriesRepository.updateHabitCategory(
      habitCategory,
      updateHabitCategoryDto,
    );
  }

  async softDeleteCategorySystem(categoryId: string): Promise<void> {
    const category = await this.habitCategoriesRepository.findCategory({
      id: categoryId,
    });

    this.checksService.checkEntityExistence(
      category,
      categoryId,
      'Habit Category',
    );

    await this.habitCategoriesRepository.updateHabitCategory(category, {
      status: HabitCategoryStatuses.DELETED,
    });
  }
}
