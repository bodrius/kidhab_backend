import { GraphQLModule } from '@nestjs/graphql';
import { HabitCategoriesRepository } from '../modules/habits-management/habit-categories/common/habit-categories.repository';
import { ChildrenRepository } from '../modules/children/common/children.repository';
import { FamiliesRepository } from '../modules/families/common/families.repository';
import { GraphQLOptionsService } from './graphql-options.service';

export const graphQLModule = GraphQLModule.forRootAsync({
  useClass: GraphQLOptionsService,
  inject: [HabitCategoriesRepository, ChildrenRepository, FamiliesRepository],
});
