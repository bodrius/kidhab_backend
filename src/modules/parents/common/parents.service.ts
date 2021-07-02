import { Injectable, NotFoundException } from '@nestjs/common';
import { ParentEntity } from './parent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ParentsRepository } from './parents.repository';
import { SystemGetParentsSerializer } from '../rest/serializers/system-get-parents.serializer';
import { ChecksService } from '@src/shared/checks/checks.service';
import { FamiliesService } from '@src/modules/families/common/families.service';
import { SystemUpdateParentDto } from '../rest/dto/system-update-parent.dto';
import { DeepPartial, ILike } from 'typeorm';

@Injectable()
export class ParentsService {
  private PAGE_SIZE = 20;

  constructor(
    @InjectRepository(ParentsRepository)
    private parentsRepository: ParentsRepository,
    private familiesService: FamiliesService,
    private checksService: ChecksService,
  ) {}

  async create(params: DeepPartial<ParentEntity>): Promise<ParentEntity> {
    return this.parentsRepository.save(params);
  }

  async findParentsSystem(page: number): Promise<SystemGetParentsSerializer> {
    const [parents, parentsCount] = await this.parentsRepository.findAndCount({
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
      order: { createdAt: 'DESC' },
      relations: ['family', 'family.children'],
    });

    return {
      parents,
      pagesCount: Math.ceil(parentsCount / this.PAGE_SIZE),
      recordsCount: parentsCount,
    };
  }

  async findParentSystem(parentId: string): Promise<ParentEntity> {
    const parent = await this.parentsRepository.findOne(parentId, {
      relations: ['family', 'family.children'],
    });
    this.checksService.checkEntityExistence(parent, parentId, 'Parent');
    return parent;
  }

  async findByEmail(email: string): Promise<ParentEntity> {
    return this.parentsRepository.findOne({ email });
  }

  async findById(id: string): Promise<ParentEntity> {
    return this.parentsRepository.findOne(id);
  }

  async findByFamilyId(familyId: string): Promise<ParentEntity[]> {
    return this.parentsRepository.find({ family: { id: familyId } });
  }

  async searchParentsSystem(
    query: string,
    page: number,
  ): Promise<SystemGetParentsSerializer> {
    const [parents, parentsCount] = await this.parentsRepository.findAndCount({
      where: { email: ILike(`%${query}%`) },
      skip: (page - 1) * this.PAGE_SIZE,
      take: this.PAGE_SIZE,
      order: { createdAt: 'DESC' },
      relations: ['family', 'family.children'],
    });

    return {
      parents,
      pagesCount: Math.ceil(parentsCount / this.PAGE_SIZE),
      recordsCount: parentsCount,
    };
  }

  async upsert(
    email: string,
    params: DeepPartial<ParentEntity>,
  ): Promise<ParentEntity> {
    return this.parentsRepository.upsert(email, params);
  }

  async updateParentSystem(
    parentId: string,
    systemUpdateParentDto: SystemUpdateParentDto,
  ): Promise<ParentEntity> {
    const parent = await this.parentsRepository.findOne(parentId, {
      relations: ['family', 'family.children'],
    });

    this.checksService.checkEntityExistence(parent, parentId, 'Parent');

    return this.update(parent, systemUpdateParentDto);
  }

  async update(
    parent: ParentEntity,
    paramsToUpdate: Partial<ParentEntity>,
  ): Promise<ParentEntity> {
    const updatedParent = this.parentsRepository.merge(parent, paramsToUpdate);
    return this.parentsRepository.save(updatedParent);
  }

  async deleteParentSystem(parentId: string): Promise<void> {
    const parent = await this.parentsRepository.findOne(parentId, {
      relations: ['family', 'family.parents'],
    });

    const onlyOneParentLeftInFamily = parent.family.parents.length === 1;
    if (onlyOneParentLeftInFamily) {
      await this.familiesService.delete(parent.familyId);
      return;
    }

    const parentDeleteResult = await this.parentsRepository.delete({
      id: parentId,
    });
    if (!parentDeleteResult.affected) {
      throw new NotFoundException(`Child ${parentId} not found`);
    }
  }
}
