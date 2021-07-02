import { Provider } from '@nestjs/common';
import { RepositoryMock } from './repositories/repository.mock';
import { ChildrenRepositoryMock } from './repositories/children.repository.mock';
import { FamiliesRepositoryMock } from './repositories/families.repository.mock';
import { HabitCategoriesRepositoryMock } from './repositories/habit-categories.repository.mock';
import { ParentsRepositoryMock } from './repositories/parents.repository.mock';

export const repositoryMocks = [
  getMockProvider('AwardTemplateEntityRepository', RepositoryMock),
  getMockProvider('AwardsRepository', RepositoryMock),
  getMockProvider('ChildrenRepository', ChildrenRepositoryMock),
  getMockProvider('FamiliesRepository', FamiliesRepositoryMock),
  getMockProvider('HabitCategoryEntityRepository', RepositoryMock),
  getMockProvider('HabitTemplateEntityRepository', RepositoryMock),
  getMockProvider('HabitCategoriesRepository', HabitCategoriesRepositoryMock),
  getMockProvider('TaskEntityRepository', RepositoryMock),
  getMockProvider('NotificationForParentEntityRepository', RepositoryMock),
  getMockProvider('ParentsRepository', ParentsRepositoryMock),
  getMockProvider('SeedsEntityRepository', RepositoryMock),
  getMockProvider('SessionsRepository', RepositoryMock),
];

function getMockProvider(
  repositoryName: string,
  RepositoryMockClass: any,
): Provider {
  return {
    provide: repositoryName,
    useClass: RepositoryMockClass,
  };
}
