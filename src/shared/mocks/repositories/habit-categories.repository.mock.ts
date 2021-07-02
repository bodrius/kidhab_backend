import { RepositoryMock } from './repository.mock';

export class HabitCategoriesRepositoryMock extends RepositoryMock {
  getHabitCategoriesWithTemplates = jest.fn();
}
