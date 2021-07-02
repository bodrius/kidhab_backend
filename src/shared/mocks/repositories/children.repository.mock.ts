import { RepositoryMock } from './repository.mock';

export class ChildrenRepositoryMock extends RepositoryMock {
  getChildWithHabitsAndAwards = jest.fn();
  getFamilyChildrenWithAwardsAndHabits = jest.fn();
}
