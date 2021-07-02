import { registerEnumType } from '@nestjs/graphql';

export enum FamilyAccountTypes {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

registerEnumType(FamilyAccountTypes, {
  name: 'FamilyAccountTypes',
});
