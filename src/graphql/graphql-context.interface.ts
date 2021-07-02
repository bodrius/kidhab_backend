import { ChildEntity } from '@src/modules/children/common/child.entity';
import { ParentEntity } from '@src/modules/parents/common/parent.entity';
import { SessionEntity } from '@src/modules/sessions/session.entity';

export interface GqlContext {
  token: string;
  session?: SessionEntity;
  child?: ChildEntity;
  parent?: ParentEntity;
  user?: ChildEntity | ParentEntity;
}
