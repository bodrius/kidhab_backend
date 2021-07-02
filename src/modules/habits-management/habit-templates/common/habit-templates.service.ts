import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { HabitTemplateEntity } from './habit-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SystemUpdateHabitTemplateDto } from './dto/update-habit-template.dto';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { ChecksService } from '@src/shared/checks/checks.service';
import { SystemGetHabitTemplatesSerializer } from '../rest/serializers/system-get-habit-templates.serializer';
import { HabitCategoriesService } from '../../habit-categories/common/habit-categories.service';
import { SystemCreateHabitTemplateDto } from './dto/system-create-habit-template.dto';

@Injectable()
export class HabitTemplatesService {
  private PAGE_SIZE = 20;

  constructor(
    @InjectRepository(HabitTemplateEntity)
    private habitTemplatesRepository: Repository<HabitTemplateEntity>,
    private checksService: ChecksService,
    private habitCategoriesService: HabitCategoriesService,
  ) {}

  async createSystemHabitTemplate(
    systemCreateHabitTemplateDto: SystemCreateHabitTemplateDto,
  ): Promise<HabitTemplateEntity> {
    const category = await this.habitCategoriesService.checkCategoryId(
      systemCreateHabitTemplateDto.categoryId,
    );

    return this.habitTemplatesRepository.save({
      ...systemCreateHabitTemplateDto,
      category,
    });
  }

  async createHabitTemplatesForFamily(
    family: FamilyEntity,
  ): Promise<HabitTemplateEntity[]> {
    const defaultHabitTemplates = await this.habitTemplatesRepository.find({
      family: null,
    });

    const habitTemplatesToCreate = defaultHabitTemplates.map(habitTemplate =>
      this.habitTemplatesRepository.merge(_.omit(habitTemplate, 'id') as any, {
        family,
      }),
    );

    return this.habitTemplatesRepository.save(habitTemplatesToCreate);
  }

  async getSystemHabitTemplates(
    page: number,
  ): Promise<SystemGetHabitTemplatesSerializer> {
    const [
      templates,
      habitsCount,
    ] = await this.habitTemplatesRepository.findAndCount({
      where: { family: null },
      relations: ['category'],
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
    });

    return {
      templates,
      pagesCount: Math.ceil(habitsCount / this.PAGE_SIZE),
      recordsCount: habitsCount,
    };
  }

  async getHabitTemplatesByCategoryAndFamily(
    categoryId: string,
    familyId: string,
  ): Promise<HabitTemplateEntity[]> {
    const templates = await this.habitTemplatesRepository.find({
      category: { id: categoryId },
      family: { id: familyId },
    });
    return templates;
  }

  async getHabitTemplatesByFamily(
    familyId: string,
    relations: string[] = [],
  ): Promise<HabitTemplateEntity[]> {
    return this.habitTemplatesRepository.find({
      where: { family: { id: familyId } },
      relations,
    });
  }

  async getHabitTemplatesByIds(ids: string[]): Promise<HabitTemplateEntity[]> {
    if (!ids.length) {
      return [];
    }

    return this.habitTemplatesRepository.find({ id: In(ids) });
  }

  async updateSystemHabitTemplate(
    id: string,
    systemUpdateHabitTemplateDto: SystemUpdateHabitTemplateDto,
  ): Promise<HabitTemplateEntity> {
    const habitTemplate = await this.habitTemplatesRepository.findOne(
      {
        id,
        family: null,
      },
      { relations: ['category'] },
    );
    this.checksService.checkEntityExistence(
      habitTemplate,
      id,
      'Habit Template',
    );

    const updatedHabitTemplate = this.habitTemplatesRepository.merge(
      habitTemplate,
      systemUpdateHabitTemplateDto,
    );
    return this.habitTemplatesRepository.save(updatedHabitTemplate);
  }

  async removeSystemHabitTemplate(id: string): Promise<void> {
    const habitTemplate = await this.habitTemplatesRepository.findOne({
      id,
      family: null,
    });
    this.checksService.checkEntityExistence(
      habitTemplate,
      id,
      'Habit Template',
    );

    await this.habitTemplatesRepository.remove(habitTemplate);
  }
}
