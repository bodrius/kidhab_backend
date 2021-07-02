import context from 'jest-plugin-context';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import {
  FixturesService,
  FamilyFixtures,
  AwardsFixtures,
} from '@src/shared/fixtures/fixtures.service';
import { Connection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationForParentEntity } from '@src/modules/notifications/notifications-for-parent/common/notification-for-parent.entity';
import { ParentNotificationsTypes } from '@src/shared/interfaces/parent-notifications-types.enum';
import { AwardsRepository } from './awards.repository';

describe('Awards Repository (integration)', () => {
  let app: INestApplication;
  let fixturesService: FixturesService;
  let awardsRepository: AwardsRepository;
  let notificationsForParentRepository: Repository<NotificationForParentEntity>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    fixturesService = moduleFixture.get(FixturesService);
    awardsRepository = moduleFixture.get(AwardsRepository);
    notificationsForParentRepository = moduleFixture.get(
      getRepositoryToken(NotificationForParentEntity),
    );
    connection = moduleFixture.get(Connection);

    await app.init();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('#remove', () => {
    context('when award has notifications', () => {
      let familyFixtures: FamilyFixtures;
      let awardsFixtures: AwardsFixtures;
      let awardNotification: NotificationForParentEntity;
      let awardId: string;

      beforeAll(async () => {
        familyFixtures = await fixturesService.createFamilyFixtures();
        awardsFixtures = await fixturesService.createAwardsFixtures(
          familyFixtures.child,
        );

        awardNotification = await notificationsForParentRepository.findOne({
          childAuthor: { id: familyFixtures.child.id },
          parentReceiver: { id: familyFixtures.parent.id },
          type: ParentNotificationsTypes.AWARD_UPDATE_REQUESTED,
          award: { id: awardsFixtures.award.id },
        });

        awardId = awardsFixtures.award.id;
        await awardsRepository.remove(awardsFixtures.award);
      });

      afterAll(async () => {
        await notificationsForParentRepository.remove(awardNotification);
        await fixturesService.clearAll();
      });

      it('should remove award', async () => {
        const removedAward = await awardsRepository.findOne(awardId);
        expect(removedAward).toBeFalsy();
      });

      it('should remove award notifications', async () => {
        const removedAwardNotifications = await notificationsForParentRepository.find(
          { award: { id: awardsFixtures.award.id } },
        );
        expect(removedAwardNotifications.length).toEqual(0);
      });
    });
  });
});
