import * as moment from 'moment';
import * as faker from 'faker';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyEntity } from '@src/modules/families/common/family.entity';
import { Repository, DeepPartial } from 'typeorm';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import { ChildEntity } from '@src/modules/children/common/child.entity';
import { Genders } from '@src/modules/children/common/gender.enum';
import { SessionEntity } from '@src/modules/sessions/session.entity';
import { HabitCategoryEntity } from '@src/modules/habits-management/habit-categories/common/habit-category.entity';
import { HabitEntity } from '@src/modules/habits-management/habits/common/habit.entity';
import { AwardEntity } from '@src/modules/awards-management/awards/common/award.entity';
import { AwardTypes } from '@src/modules/awards-management/award-types.enum';
import { HabitTemplateEntity } from '@src/modules/habits-management/habit-templates/common/habit-template.entity';
import { HabitsStatuses } from '@src/modules/habits-management/habits/common/habits-statuses.enum';
import { TaskEntity } from '@src/modules/habits-management/tasks/common/task.entity';
import { AwardTemplateEntity } from '@src/modules/awards-management/award-templates/common/award-template.entity';
import * as SUUID from 'short-uuid';
import { AdminUserEntity } from '@src/modules/admin-users/common/admin-user.entity';
import { AdminPermissions } from '@src/modules/admin-users/common/permissions.enum';
import { AdminRoleEntity } from '@src/modules/admin-users/common/admin-role.entity';
import { AwardsRepository } from '@src/modules/awards-management/awards/common/awards.repository';

export interface FamilyFixtures {
  family: FamilyEntity;
  parent: ParentEntity;
  child: ChildEntity;
  parentSession: SessionEntity;
  childSession: SessionEntity;

  parentToken: string;
  parentPassword: string;
  childToken: string;
}

export interface HabitsFixtures {
  category: HabitCategoryEntity;
  habit?: HabitEntity;
  task?: TaskEntity;
  template: HabitTemplateEntity;
}

export interface AwardsFixtures {
  award: AwardEntity;
  template: AwardTemplateEntity;
}

export interface SystemTemplatesFixtures {
  category: HabitCategoryEntity;
  habitTemplate: HabitTemplateEntity;
  awardTemplate: AwardTemplateEntity;
}

export interface AdminFixtures {
  adminPassword: string;
  adminRole: AdminRoleEntity;
  admin: AdminUserEntity;
  adminToken: string;
}

@Injectable()
export class FixturesService {
  private entities: Array<any>;

  constructor(
    private authBaseService: AuthBaseService,
    @InjectRepository(FamilyEntity)
    private familiesRepository: Repository<FamilyEntity>,
    @InjectRepository(ParentEntity)
    private parentsRepository: Repository<ParentEntity>,
    @InjectRepository(ChildEntity)
    private childrenRepository: Repository<ChildEntity>,
    @InjectRepository(SessionEntity)
    private sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(HabitCategoryEntity)
    private habitCategoriesRepository: Repository<HabitCategoryEntity>,
    @InjectRepository(HabitTemplateEntity)
    private habitTemplatesRepository: Repository<HabitTemplateEntity>,
    @InjectRepository(HabitEntity)
    private habitsRepository: Repository<HabitEntity>,
    @InjectRepository(AwardsRepository)
    private awardsRepository: AwardsRepository,
    @InjectRepository(TaskEntity)
    private tasksRepository: Repository<TaskEntity>,
    @InjectRepository(AwardTemplateEntity)
    private awardTemplatesRepository: Repository<AwardTemplateEntity>,
    @InjectRepository(AdminUserEntity)
    private adminUsersRepository: Repository<AdminUserEntity>,
    @InjectRepository(AdminRoleEntity)
    private adminRoleRepository: Repository<AdminRoleEntity>,
  ) {
    this.entities = [];
  }

  public async createFamilyFixtures(
    includeChild = true,
  ): Promise<FamilyFixtures> {
    const parentPassword = faker.random.words();

    const family = await this.createFamilyFixture();
    const parent = await this.createParentFixture(parentPassword, family);
    const parentSession = await this.createSessionFixture({ parent });
    const parentToken = this.authBaseService.createToken(parentSession);

    let child: ChildEntity = null;
    let childSession: SessionEntity = null;
    let childToken: string = null;

    if (includeChild) {
      child = await this.createChildFixture(family);
      childSession = await this.createSessionFixture({ child });
      childToken = this.authBaseService.createToken(childSession);
    }

    return {
      family,
      parent,
      child,
      parentSession,
      childSession,

      parentToken,
      parentPassword,
      childToken,
    };
  }

  public async createHabitsFixtures({
    child,
    habits = false,
  }: {
    child: ChildEntity;
    habits?: boolean;
  }): Promise<HabitsFixtures> {
    const category = await this.createHabitCategoryFixture();
    const template = await this.createHabitTemplateFixture(
      category,
      child.familyId,
    );

    let habit = null;
    let task = null;
    if (habits) {
      habit = await this.createHabitFixture(category, child);
      task = await this.createTaskFixture(habit);
    }

    return {
      category,
      habit,
      template,
      task,
    };
  }

  public async createAwardsFixtures(
    child: ChildEntity,
  ): Promise<AwardsFixtures> {
    const award = await this.createAwardFixture(child);
    const template = await this.createAwardTemplateFixture(child.familyId);

    return { award, template };
  }

  public async createSystemTemplatesFixtures(): Promise<
    SystemTemplatesFixtures
  > {
    const category = await this.createHabitCategoryFixture();
    const habitTemplate = await this.createHabitTemplateFixture(category);
    const awardTemplate = await this.createAwardTemplateFixture();

    return { category, habitTemplate, awardTemplate };
  }

  public async createAdminFixtures(
    permissions: AdminPermissions[] = [],
    shouldResetPassword = false,
  ): Promise<AdminFixtures> {
    const adminRole = await this.createAdminRoleFixture(permissions);
    const adminPassword = faker.random.words();
    const admin = await this.createAdminUserFixture(
      adminRole.id,
      adminPassword,
      shouldResetPassword,
    );
    const adminSession = await this.createSessionFixture({ adminUser: admin });
    const adminToken = this.authBaseService.createToken(adminSession);

    return { admin, adminPassword, adminRole, adminToken };
  }

  async clearAll(): Promise<void> {
    await Promise.all(
      this.entities.map(([repository, entity]: [Repository<any>, any]) => {
        return repository.delete({ id: entity.id });
      }),
    );
  }

  private async createFamilyFixture(): Promise<FamilyEntity> {
    return this.createEntity<FamilyEntity>(this.familiesRepository, {});
  }

  private async createParentFixture(
    password: string,
    family: FamilyEntity,
  ): Promise<ParentEntity> {
    const passwordHash = await this.authBaseService.createPasswordHash(
      password,
    );

    return this.createEntity<ParentEntity>(this.parentsRepository, {
      email: SUUID.generate() + faker.internet.email(),
      passwordHash,
      family,
    });
  }

  private async createChildFixture(family: FamilyEntity) {
    return this.createEntity<ChildEntity>(this.childrenRepository, {
      username: faker.name.firstName(),
      age: faker.random.number(20),
      gender: Genders.MALE,
      email: faker.internet.email(),
      family,
    });
  }

  private async createSessionFixture(params: DeepPartial<SessionEntity>) {
    return this.createEntity<SessionEntity>(this.sessionsRepository, params);
  }

  private async createHabitCategoryFixture() {
    return this.createEntity<HabitCategoryEntity>(
      this.habitCategoriesRepository,
      {
        name: faker.random.words(),
      },
    );
  }

  private async createHabitTemplateFixture(
    category: HabitCategoryEntity,
    familyId?: string,
  ) {
    return this.createEntity<HabitTemplateEntity>(
      this.habitTemplatesRepository,
      {
        name: faker.name.firstName(),
        description: faker.random.words(),
        points: faker.random.number(32),
        defaultReccurence: '1 days' as any,
        category,
        family: familyId ? { id: familyId } : null,
      },
    );
  }

  private async createHabitFixture(
    category: HabitCategoryEntity,
    child: ChildEntity,
  ) {
    return this.createEntity<HabitEntity>(this.habitsRepository, {
      name: faker.name.firstName(),
      description: faker.random.words(),
      points: faker.random.number(32),
      reccurence: '1 days' as any,
      baseDate: moment(faker.date.recent()).format('YYYY-MM-DD'),
      pointsRate: faker.random.number(32),
      status: HabitsStatuses.IN_PROGRESS,
      category,
      child,
    });
  }

  private async createTaskFixture(habit: HabitEntity) {
    return this.createEntity<TaskEntity>(this.tasksRepository, {
      habit,
      ...(_.pick(habit, 'name', 'description', 'imagePath', 'child') as any),
      date: habit.baseDate,
    });
  }

  private async createAwardFixture(child: ChildEntity) {
    return this.createEntity<AwardEntity>(this.awardsRepository, {
      name: faker.name.title(),
      description: faker.random.words(),
      type: AwardTypes.MATERIAL,
      cost: faker.random.number(),
      child,
    });
  }

  private async createAwardTemplateFixture(familyId?: string) {
    return this.createEntity<AwardTemplateEntity>(
      this.awardTemplatesRepository,
      {
        name: faker.random.word(),
        description: faker.random.words(),
        type: AwardTypes.MATERIAL,
        cost: faker.random.number(200),
        imageUrl: faker.internet.url(),
        family: familyId ? { id: familyId } : null,
      },
    );
  }

  private async createAdminRoleFixture(permissions: AdminPermissions[]) {
    return this.createEntity<AdminRoleEntity>(this.adminRoleRepository, {
      name: faker.random.words(),
      permissions,
    });
  }

  private async createAdminUserFixture(
    roleId: string,
    password: string,
    shouldResetPassword: boolean,
  ) {
    const passwordHash = await this.authBaseService.createPasswordHash(
      password,
    );

    return this.createEntity<AdminUserEntity>(this.adminUsersRepository, {
      email: SUUID.generate() + faker.internet.email(),
      username: faker.name.firstName(),
      passwordHash,
      shouldResetPassword,
      role: { id: roleId },
    });
  }

  private async createEntity<Entity>(
    repository: Repository<Entity>,
    entity: DeepPartial<Entity>,
  ): Promise<Entity> {
    const createdEntity = await repository.save(entity);
    this.entities.push([repository, createdEntity]);

    return createdEntity;
  }
}
