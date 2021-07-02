import { registerAs } from '@nestjs/config';
import * as convict from 'convict';

export const generalConfig = registerAs('general', () => {
  return convict({
    env: {
      doc: 'Server environment',
      format: ['development', 'production', 'test', 'azure'],
      default: null,
      env: 'NODE_ENV',
    },
    defaultTaskNumberToCreate: {
      doc: 'Server environment',
      format: Number,
      default: null,
      env: 'DEFAULT_TASK_NUMBER_TO_CREATE',
    },
    allowedOrigin: {
      doc: 'Allowed origin by CORS policy',
      format: String,
      default: null,
      env: 'ALLOWED_ORIGIN',
    },
    habitLevels: {
      first: {
        levelTasksPercentage: {
          doc:
            'Percentage of tasks for completing first habit level out of whole tasks count',
          format: Number,
          default: null,
          env: 'FIRST_TASK_LEVEL_PERCENTAGE',
        },
        defaultLevelTasksCount: {
          doc:
            'Default amount of tasks for completing second habit level if habit is infinite',
          format: Number,
          default: null,
          env: 'DEFAULT_FIRST_LEVEL_TASKS_COUNT',
        },
      },
      second: {
        levelTasksPercentage: {
          doc:
            'Percentage of tasks for completing first habit level out of whole tasks count',
          format: Number,
          default: null,
          env: 'SECOND_TASK_LEVEL_PERCENTAGE',
        },
        defaultLevelTasksCount: {
          doc:
            'Default amount of tasks for completing second habit level if habit is infinite',
          format: Number,
          default: null,
          env: 'DEFAULT_SECOND_LEVEL_TASKS_COUNT',
        },
      },
      pointsBoostForLevelUpPercentage: {
        doc:
          'In Percents. How many percents from base points to add (for next tasks completion) for successful level completion',
        format: String,
        default: null,
        env: 'POINTS_BOOST_FOR_LEVEL_UP_PERCENTAGE',
      },
    },
    testFamiliesQuota: {
      doc: 'How many test families allowed',
      format: Number,
      default: 20,
      env: 'TEST_FAMILIES_QUOTA',
    },
  })
    .validate()
    .getProperties();
});
