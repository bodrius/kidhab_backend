import context from 'jest-plugin-context';
import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import {
  FixturesService,
  FamilyFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { Connection } from 'typeorm';
import { ChildrenRepository } from './children.repository';
import { ChildEntity } from './child.entity';

describe('Children Repository (integration)', () => {
  let app: INestApplication;
  let fixturesService: FixturesService;
  let childrenRepository: ChildrenRepository;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    fixturesService = moduleFixture.get(FixturesService);
    childrenRepository = moduleFixture.get(ChildrenRepository);
    connection = moduleFixture.get(Connection);

    await app.init();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('#getChildWithHabitsAndAwards', () => {
    context('when child have many awards and habits', () => {
      let familyFixtures: FamilyFixtures;

      let childWithHabitsAndAwards: ChildEntity;

      beforeAll(async () => {
        familyFixtures = await fixturesService.createFamilyFixtures();

        await Promise.all([
          fixturesService.createAwardsFixtures(familyFixtures.child),
          fixturesService.createAwardsFixtures(familyFixtures.child),
          fixturesService.createHabitsFixtures({
            child: familyFixtures.child,
            habits: true,
          }),
          fixturesService.createHabitsFixtures({
            child: familyFixtures.child,
            habits: true,
          }),
        ]);

        childWithHabitsAndAwards = await childrenRepository.getChildWithHabitsAndAwards(
          familyFixtures.child.id,
        );
      });

      afterAll(async () => {
        await fixturesService.clearAll();
      });

      it('should return child with all his awards and habits', async () => {
        expect(childWithHabitsAndAwards).toEqual(
          expect.objectContaining(_.omit(familyFixtures.child, 'family')),
        );

        expect(childWithHabitsAndAwards.habits.length).toEqual(2);
        expect(childWithHabitsAndAwards.awards.length).toEqual(2);
      });
    });
  });
});
