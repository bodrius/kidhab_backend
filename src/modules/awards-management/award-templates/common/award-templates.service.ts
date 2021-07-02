import * as _ from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AwardTemplateEntity } from './award-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { SystemGetAwardTemplatesSerializer } from '../rest/serializers/system-get-award-templates.serializer';
import { UpdateAwardTemplateDto } from './dto/update-award-template.dto';
import { ChecksService } from '@src/shared/checks/checks.service';
import { SystemCreateAwardTemplateDto } from './dto/system-create-award-template.dto';

@Injectable()
export class AwardTemplatesService {
  private PAGE_SIZE = 20;

  constructor(
    @InjectRepository(AwardTemplateEntity)
    private awardTemplateRepository: Repository<AwardTemplateEntity>,
    private checksService: ChecksService,
  ) {}

  async createAwardTemplate(
    systemCreateAwardTemplateDto: SystemCreateAwardTemplateDto,
  ): Promise<AwardTemplateEntity> {
    return this.awardTemplateRepository.save(systemCreateAwardTemplateDto);
  }

  async createAwardTemplatesForFamily(
    family: FamilyEntity,
  ): Promise<AwardTemplateEntity[]> {
    const defaultAwardTemplates = await this.awardTemplateRepository.find({
      family: null,
    });

    const awardTemplatesToCreate = defaultAwardTemplates.map(habitTemplate =>
      this.awardTemplateRepository.merge(_.omit(habitTemplate, 'id') as any, {
        family,
      }),
    );

    return this.awardTemplateRepository.save(awardTemplatesToCreate);
  }

  async getAwardTemplatesSystem(
    page: number,
  ): Promise<SystemGetAwardTemplatesSerializer> {
    const [
      templates,
      templatesCount,
    ] = await this.awardTemplateRepository.findAndCount({
      where: { family: null },
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
    });

    return {
      templates,
      pagesCount: Math.ceil(templatesCount / this.PAGE_SIZE),
      recordsCount: templatesCount,
    };
  }

  async getAwardTemplatesForFamily(
    familyId: string,
    relations: string[] = [],
  ): Promise<AwardTemplateEntity[]> {
    return this.awardTemplateRepository.find({
      where: { family: { id: familyId } },
      relations,
    });
  }

  async getAwardTemplatesByIds(ids: string[]): Promise<AwardTemplateEntity[]> {
    if (!ids.length) {
      return [];
    }

    return this.awardTemplateRepository.find({ id: In(ids) });
  }

  async updateSystemAwardTemplate(
    templateId: string,
    updateAwardTemplateDto: UpdateAwardTemplateDto,
  ): Promise<AwardTemplateEntity> {
    const awardTemplate = await this.awardTemplateRepository.findOne({
      id: templateId,
      family: null,
    });
    this.checksService.checkEntityExistence(
      awardTemplate,
      templateId,
      'AwardTemplate',
    );

    const awardTemplateToUpdate = this.awardTemplateRepository.merge(
      awardTemplate,
      updateAwardTemplateDto,
    );
    return this.awardTemplateRepository.save(awardTemplateToUpdate);
  }

  async removeSystemAwardTemplate(templateId: string): Promise<void> {
    const deleteResult = await this.awardTemplateRepository.delete({
      id: templateId,
      family: null,
    });

    if (!deleteResult.affected) {
      throw new NotFoundException(`Award template ${templateId} not found`);
    }
  }
}
