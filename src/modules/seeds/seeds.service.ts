import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeedEntity } from './seeds.entity';
import { Repository, Connection, EntityMetadata } from 'typeorm';
import { SeedsJsonDto } from './dto/seeds-json.dto';
import { HabitCategoryEntity } from '../habits-management/habit-categories/common/habit-category.entity';
import { AwardTemplateEntity } from '../awards-management/award-templates/common/award-template.entity';
import { HabitEntity } from '../habits-management/habits/common/habit.entity';
import { FamilyEntity } from '../families/common/family.entity';
import { TasksService } from '../habits-management/tasks/common/tasks.service';
import { HabitsRepository } from '../habits-management/habits/common/habits.repository';
import { ChecksService } from '@src/shared/checks/checks.service';
import { SeedsAdapter } from './seeds.adapter';
import { HabitLevelsService } from '../habits-management/habits/common/habit-levels.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class SeedsService {
  constructor(
    @InjectRepository(SeedEntity)
    private seedsRepository: Repository<SeedEntity>,
    @InjectRepository(HabitCategoryEntity)
    private habitCategoriesRepository: Repository<HabitCategoryEntity>,
    @InjectRepository(AwardTemplateEntity)
    private awardTemplatesRepository: Repository<AwardTemplateEntity>,
    @InjectRepository(FamilyEntity)
    private familiesRepository: Repository<FamilyEntity>,
    @InjectRepository(HabitsRepository)
    private habitsRepository: HabitsRepository,
    private habitLevelsService: HabitLevelsService,
    private tasksService: TasksService,
    private checksService: ChecksService,
    private connection: Connection,
    private seedsAdapter: SeedsAdapter,
  ) {}

  async getSeedsJson(): Promise<SeedsJsonDto> {
    const seedJson = await this.seedsRepository.findOne();
    this.checksService.checkEntityExistence(seedJson, '', 'Seeds');

    return seedJson.json;
  }

  async upsertSeedsJson(seedsJsonDto: SeedsJsonDto): Promise<SeedEntity> {
    const seedJson = await this.seedsRepository.findOne();
    if (seedJson) {
      const seedJsonToUpsert = this.seedsRepository.merge(seedJson, {
        json: seedsJsonDto,
      });
      return this.seedsRepository.save(seedJsonToUpsert);
    }

    return this.seedsRepository.save({ json: seedsJsonDto });
  }

  async restoreDatabase(): Promise<void> {
    const seedJson = await this.seedsRepository.findOne();
    this.checksService.checkEntityExistence(seedJson, '', 'Seeds');
    const seedsObj = plainToClass(SeedsJsonDto, seedJson.json);
    const errors = await validate(seedsObj);
    if (errors.length) {
      throw new BadRequestException(errors);
    }

    await this.clearDB();

    const {
      json: { categories, systemAwardTemplates, families },
    } = seedJson;

    const savedCategories = await this.habitCategoriesRepository.save(
      categories,
    );
    await this.awardTemplatesRepository.save(systemAwardTemplates);

    const familiesSeeds = await this.seedsAdapter.prepareFamiliesSeeds(
      families,
      savedCategories,
    );
    const savedFamilies = await this.familiesRepository.save(familiesSeeds);

    const allHabits = savedFamilies.reduce((acc, familyEntity) => {
      familyEntity.children.forEach(childEntity =>
        acc.push(...(childEntity.habits as HabitEntity[])),
      );

      return acc;
    }, [] as HabitEntity[]);

    await Promise.all(
      allHabits.map(async habit => {
        const habitEntity = await this.habitsRepository.findOne(habit.id);
        await this.tasksService.createTasksForHabit(habitEntity);
        await this.habitLevelsService.assignFirstLevel(habitEntity);
      }),
    );
  }

  private async clearDB() {
    try {
      for (const entity of this.connection.entityMetadatas) {
        await this.clearTable(entity);
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Clearing DB error', err);
    }
  }

  private async clearTable(entity: EntityMetadata) {
    if (this.isSystemTable(entity)) {
      return null;
    }

    return this.connection.query(
      `TRUNCATE TABLE "${entity.tableName}" CASCADE;`,
    );
  }

  private isSystemTable(entity: EntityMetadata) {
    return ['seeds', 'migrations', 'admin_roles', 'admin_users'].find(
      tableName => tableName === entity.tableName,
    );
  }
}
