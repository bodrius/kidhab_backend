import { registerEnumType } from '@nestjs/graphql';

export enum Languages {
  EN = 'EN',
  RU = 'RU',
  UA = 'UA',
}

registerEnumType(Languages, {
  name: 'Languages',
});
