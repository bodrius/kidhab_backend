import { registerEnumType } from '@nestjs/graphql';

export enum AwardTypes {
  MATERIAL = 'MATERIAL',
  NON_MATERIAL = 'NON_MATERIAL',
}

registerEnumType(AwardTypes, {
  name: 'AwardTypes',
});
