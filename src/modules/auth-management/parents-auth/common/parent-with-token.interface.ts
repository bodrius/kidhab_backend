import { ParentEntity } from '@src/modules/parents/common/parent.entity';

export interface IParentWithToken {
  parent: ParentEntity;

  token: string;
}
