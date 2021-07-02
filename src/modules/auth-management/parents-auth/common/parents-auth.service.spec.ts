import context from 'jest-plugin-context';
import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { ParentsAuthService } from './parents-auth.service';
import { ParentsService } from '@src/modules/parents/common/parents.service';
import { SessionsService } from '@src/modules/sessions/sessions.service';
import { FamiliesService } from '@src/modules/families/common/families.service';
import { AuthBaseService } from '@src/modules/auth-management/auth-base/auth-base.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ParentsServiceMock,
  FamiliesServiceMock,
  SessionsServiceMock,
  AuthBaseServiceMock,
} from '@src/shared/mocks';
import { Languages } from '@src/shared/interfaces/languages.enum';

describe('ParentsAuthService', () => {
  let service: ParentsAuthService;
  let parentsService: ParentsServiceMock;
  let familiesService: FamiliesServiceMock;
  let sessionsService: SessionsServiceMock;
  let authService: AuthBaseServiceMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsAuthService,
        {
          provide: ParentsService,
          useClass: ParentsServiceMock,
        },
        {
          provide: SessionsService,
          useClass: SessionsServiceMock,
        },
        {
          provide: FamiliesService,
          useClass: FamiliesServiceMock,
        },
        {
          provide: AuthBaseService,
          useClass: AuthBaseServiceMock,
        },
      ],
    }).compile();

    service = module.get<ParentsAuthService>(ParentsAuthService);
    parentsService = module.get(ParentsService);
    familiesService = module.get(FamiliesService);
    sessionsService = module.get(SessionsService);
    authService = module.get(AuthBaseService);
  });

  describe('#signUp', () => {
    context('when parent with such email already exists', () => {
      const signUpDto = {
        email: faker.internet.email(),
        password: faker.random.words(),
        language: Languages.RU,
      };
      const existingUser = { id: faker.random.uuid() };

      let actualResult;

      beforeAll(async () => {
        parentsService.findByEmail.mockResolvedValue(existingUser);

        try {
          await service.signUp(signUpDto);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call parentsService.findByEmail once', () => {
        expect(parentsService.findByEmail).toBeCalledTimes(1);
        expect(parentsService.findByEmail).toBeCalledWith(signUpDto.email);
      });

      it('should not call familiesService.create', () => {
        expect(familiesService.create).not.toBeCalled();
      });

      it('should not call parentsService.create', () => {
        expect(parentsService.create).not.toBeCalled();
      });

      it('should not call sessionsService.createForParent', () => {
        expect(sessionsService.createForParent).not.toBeCalled();
      });

      it('should throw ConflictException', () => {
        expect(actualResult).toBeInstanceOf(ConflictException);
      });
    });

    context('when parent email does not exist yet', () => {
      const signUpDto = {
        email: faker.internet.email(),
        password: faker.random.words(),
        language: Languages.RU,
      };
      const newFamily = { id: faker.random.uuid() };
      const passwordHash = faker.random.words();
      const newParent = { id: faker.random.uuid() };
      const newSession = { id: faker.random.uuid() };
      const token = faker.random.uuid();

      let actualResult;

      beforeAll(async () => {
        familiesService.create.mockResolvedValue(newFamily);
        authService.createPasswordHash.mockResolvedValue(passwordHash);
        parentsService.create.mockResolvedValue(newParent);
        sessionsService.createForParent.mockResolvedValue(newSession);
        authService.createToken.mockReturnValue(token);

        actualResult = await service.signUp(signUpDto);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call parentsService.findByEmail once', () => {
        expect(parentsService.findByEmail).toBeCalledTimes(1);
        expect(parentsService.findByEmail).toBeCalledWith(signUpDto.email);
      });

      it('should call familiesService.create once', () => {
        expect(familiesService.create).toBeCalledTimes(1);
        expect(familiesService.create).toBeCalledWith();
      });

      it('should call authService.createPasswordHash once', () => {
        expect(authService.createPasswordHash).toBeCalledTimes(1);
        expect(authService.createPasswordHash).toBeCalledWith(
          signUpDto.password,
        );
      });

      it('should call parentsService.create once', () => {
        expect(parentsService.create).toBeCalledTimes(1);
        expect(parentsService.create).toBeCalledWith({
          email: signUpDto.email,
          passwordHash,
          family: newFamily,
          language: signUpDto.language,
        });
      });

      it('should call sessionsService.createForParent once', () => {
        expect(sessionsService.createForParent).toBeCalledTimes(1);
        expect(sessionsService.createForParent).toBeCalledWith(newParent);
      });

      it('should call authService.createToken once', () => {
        expect(authService.createToken).toBeCalledTimes(1);
        expect(authService.createToken).toBeCalledWith(newSession);
      });

      it('should return expected result', () => {
        const expectedResult = {
          parent: newParent,
          token,
        };
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('#signIn', () => {
    context('when parent with such email does not exist', () => {
      const signInDto = {
        email: faker.internet.email(),
        password: faker.random.words(),
      };

      let actualResult;

      beforeAll(async () => {
        try {
          await service.signIn(signInDto);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call parentsService.findByEmail once', () => {
        expect(parentsService.findByEmail).toBeCalledTimes(1);
        expect(parentsService.findByEmail).toBeCalledWith(signInDto.email);
      });

      it('should not call authService.comparePasswords', () => {
        expect(authService.comparePasswords).not.toBeCalled();
      });

      it('should not call sessionsService.createForParent', () => {
        expect(sessionsService.createForParent).not.toBeCalled();
      });

      it('should not call authService.createToken', () => {
        expect(authService.createToken).not.toBeCalled();
      });

      it('should throw NotFoundException', () => {
        expect(actualResult).toBeInstanceOf(NotFoundException);
      });
    });

    context('when parents account password is not valid', () => {
      const signInDto = {
        email: faker.internet.email(),
        password: faker.random.words(),
      };
      const existingParent = {
        id: faker.random.uuid(),
        passwordHash: faker.random.words(),
      };

      let actualResult;

      beforeAll(async () => {
        parentsService.findByEmail.mockResolvedValue(existingParent);
        authService.comparePasswords.mockResolvedValue(false);

        try {
          await service.signIn(signInDto);
        } catch (err) {
          actualResult = err;
        }
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call parentsService.findByEmail once', () => {
        expect(parentsService.findByEmail).toBeCalledTimes(1);
        expect(parentsService.findByEmail).toBeCalledWith(signInDto.email);
      });

      it('should call authService.comparePasswords', () => {
        expect(authService.comparePasswords).toBeCalledTimes(1);
        expect(authService.comparePasswords).toBeCalledWith(
          signInDto.password,
          existingParent.passwordHash,
        );
      });

      it('should not call sessionsService.createForParent', () => {
        expect(sessionsService.createForParent).not.toBeCalled();
      });

      it('should not call authService.createToken', () => {
        expect(authService.createToken).not.toBeCalled();
      });

      it('should throw UnauthorizedException', () => {
        expect(actualResult).toBeInstanceOf(UnauthorizedException);
      });
    });

    context('when parent provided valid credentials', () => {
      const signInDto = {
        email: faker.internet.email(),
        password: faker.random.words(),
      };
      const existingParent = {
        id: faker.random.uuid(),
        passwordHash: faker.random.words(),
      };
      const newSession = { id: faker.random.uuid() };
      const token = faker.random.uuid();

      let actualResult;

      beforeAll(async () => {
        parentsService.findByEmail.mockResolvedValue(existingParent);
        authService.comparePasswords.mockResolvedValue(true);
        sessionsService.createForParent.mockResolvedValue(newSession);
        authService.createToken.mockReturnValue(token);

        actualResult = await service.signIn(signInDto);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should call parentsService.findByEmail once', () => {
        expect(parentsService.findByEmail).toBeCalledTimes(1);
        expect(parentsService.findByEmail).toBeCalledWith(signInDto.email);
      });

      it('should call authService.comparePasswords', () => {
        expect(authService.comparePasswords).toBeCalledTimes(1);
        expect(authService.comparePasswords).toBeCalledWith(
          signInDto.password,
          existingParent.passwordHash,
        );
      });

      it('should call sessionsService.createForParent once', () => {
        expect(sessionsService.createForParent).toBeCalledTimes(1);
        expect(sessionsService.createForParent).toBeCalledWith(existingParent);
      });

      it('should call authService.createToken once', () => {
        expect(authService.createToken).toBeCalledTimes(1);
        expect(authService.createToken).toBeCalledWith(newSession);
      });

      it('should return expected result', () => {
        const expectedResult = { parent: existingParent, token };
        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});
