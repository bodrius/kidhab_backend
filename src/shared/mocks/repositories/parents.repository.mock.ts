import { RepositoryMock } from './repository.mock';

export class ParentsRepositoryMock extends RepositoryMock {
  upsert = jest.fn();
}
