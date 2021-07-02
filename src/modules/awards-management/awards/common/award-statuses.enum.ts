import { registerEnumType } from '@nestjs/graphql';

export enum AwardStatuses {
  CREATED = 'CREATED',
  PURCHASED = 'PURCHASED',
}

registerEnumType(AwardStatuses, {
  name: 'AwardStatuses',
});
