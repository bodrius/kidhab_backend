import { RepositoryMock } from './repository.mock';

export class SessionsRepositoryMock extends RepositoryMock {
  findActiveSessionById = jest.fn();
}
