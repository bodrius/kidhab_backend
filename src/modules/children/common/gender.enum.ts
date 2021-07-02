import { registerEnumType } from '@nestjs/graphql';

export enum Genders {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

registerEnumType(Genders, {
  name: 'Genders',
});
