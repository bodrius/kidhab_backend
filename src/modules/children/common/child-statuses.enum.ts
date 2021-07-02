import { registerEnumType } from '@nestjs/graphql';

export enum ChildStatuses {
  CREATED = 'CREATED',
  ACTIVATED = 'ACTIVATED',
}

registerEnumType(ChildStatuses, {
  name: 'ChildStatuses',
});
