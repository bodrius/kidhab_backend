import { SeedsModule } from './modules/seeds/seeds.module';

const isProd = process.env.NODE_ENV === 'azure';

const modules: any[] = [];
if (!isProd) {
  modules.push(SeedsModule);
}

export const devModules = modules;
