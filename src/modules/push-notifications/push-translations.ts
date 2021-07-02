/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ChildNotificationsTypes } from '@src/shared/interfaces/child-notifications-types.enum';
import { ParentNotificationsTypes } from '@src/shared/interfaces/parent-notifications-types.enum';
import { TaskStatuses } from '../habits-management/tasks/common/task-statuses.enum';

export interface TranslationContext {
  childUsername?: string;
  habitName?: string;
  habitLevel?: number;
  taskName?: string;
}

export interface TranslationItem {
  title?: (ctx: TranslationContext) => string;
  body: (ctx: TranslationContext) => string;
}

export interface PushTranslation {
  type: string;
  translations: {
    [language: string]: TranslationItem;
  };
}

export const pushTranslations: PushTranslation[] = [
  {
    type: TaskStatuses.PENDING_APPROVAL,
    translations: {
      EN: {
        title: ctx => `${ctx.childUsername} completed the task ✅`,
        body: ctx => 'Awaiting your confirmation to earn points',
      },
      RU: {
        title: ctx => `Задание выполнено ✅`,
        body: ctx =>
          `${ctx.childUsername} ожидает подтверждение для начисления баллов`,
      },
      UA: {
        title: ctx => `Завдання виконано ✅`,
        body: ctx =>
          `${ctx.childUsername} чекає підтвердження для нарахування балів`,
      },
    },
  },
  {
    type: TaskStatuses.APPROVED,
    translations: {
      EN: {
        title: ctx => 'Parent checked the task ✅',
        body: ctx =>
          'Congratulation, completion of the task has been approved 🎉',
      },
      RU: {
        title: ctx => 'Задание проверено ✅',
        body: ctx => 'Поздравляем, выполнение задания было подтверждено 🎉',
      },
      UA: {
        title: ctx => 'Завдання перевірено ✅',
        body: ctx => 'Вітаємо, виконання завдання було підтверджено 🎉',
      },
    },
  },
  {
    type: TaskStatuses.REJECTED,
    translations: {
      EN: {
        title: ctx => 'Parent checked the task',
        body: ctx => 'The task has been rejected 😩',
      },
      RU: {
        title: ctx => 'Задание проверено',
        body: ctx => 'Задание отклонено родителем 😩',
      },
      UA: {
        title: ctx => 'Завдання перевірено',
        body: ctx => 'Завдання відхилено батьками 😩',
      },
    },
  },
  {
    type: ParentNotificationsTypes.AWARD_CREATION_REQUESTED,
    translations: {
      EN: {
        body: ctx => `${ctx.childUsername} wants to add a new reward 🤩`,
      },
      RU: {
        body: ctx => `${ctx.childUsername} хочет добавить новую награду 🤩`,
      },
      UA: {
        body: ctx => `${ctx.childUsername} хоче додати нову нагороду 🤩`,
      },
    },
  },
  {
    type: ParentNotificationsTypes.AWARD_UPDATE_REQUESTED,
    translations: {
      EN: {
        body: ctx =>
          `${ctx.childUsername} wants to change the current reward 🖌`,
      },
      RU: {
        body: ctx => `${ctx.childUsername} хочет изменить текущую награду 🖌`,
      },
      UA: {
        body: ctx => `${ctx.childUsername} хоче змінити поточну нагороду 🖌`,
      },
    },
  },
  {
    type: ParentNotificationsTypes.HABIT_CREATION_REQUESTED,
    translations: {
      EN: {
        body: ctx => `${ctx.childUsername} wants to add a new habit ✨`,
      },
      RU: {
        body: ctx => `${ctx.childUsername} хочет добавить новую привычку ✨`,
      },
      UA: {
        body: ctx => `${ctx.childUsername} хоче додати нову звичку ✨`,
      },
    },
  },
  {
    type: ParentNotificationsTypes.HABIT_UPDATE_REQUESTED,
    translations: {
      EN: {
        body: ctx => `${ctx.childUsername} wants to change the current habit 🖌`,
      },
      RU: {
        body: ctx => `${ctx.childUsername} хочет изменить текущую привычку 🖌`,
      },
      UA: {
        body: ctx => `${ctx.childUsername} хоче змінити поточну звичку 🖌`,
      },
    },
  },
  {
    type: ParentNotificationsTypes.HABIT_DELETION_REQUESTED,
    translations: {
      EN: {
        body: ctx =>
          `${ctx.childUsername} wants to remove the current habit ❗️`,
      },
      RU: {
        body: ctx => `${ctx.childUsername} хочет удалить текущую привычку ❗️`,
      },
      UA: {
        body: ctx => `${ctx.childUsername} хоче видалити поточну звичку ❗️`,
      },
    },
  },
  {
    type: ChildNotificationsTypes.HABIT_LEVEL_CHANGE,
    translations: {
      EN: {
        title: ctx => 'Habit level has been changed 🚀',
        body: ctx =>
          `The habit ${ctx.habitName} has moved to a ${ctx.habitLevel} level`,
      },
      RU: {
        title: ctx => 'Уровень привычки изменен 🚀',
        body: ctx =>
          `Привычка ${ctx.habitName} перешла на ${ctx.habitLevel} уровень`,
      },
      UA: {
        title: ctx => 'Рівень звички змінено 🚀',
        body: ctx =>
          `Звичка ${ctx.habitName} перейшла на ${ctx.habitLevel} рівень`,
      },
    },
  },
  {
    type: ChildNotificationsTypes.HABIT_COMPLETED,
    translations: {
      EN: {
        title: ctx => `Congratulation ${ctx.childUsername}💥`,
        body: ctx =>
          `You have successfully developed the habit - ${ctx.habitName}👌`,
      },
      RU: {
        title: ctx => `Поздравляем ${ctx.childUsername}💥`,
        body: ctx =>
          `Вы успешно выработали у себя новую привычку - ${ctx.habitName}👌`,
      },
      UA: {
        title: ctx => `Вітаємо ${ctx.childUsername}💥`,
        body: ctx =>
          `Ви успішно виробили у себе нову звичку - ${ctx.habitName}👌`,
      },
    },
  },
  {
    type: ParentNotificationsTypes.CHILD_ACTIVATED,
    translations: {
      EN: {
        body: ctx => `${ctx.childUsername} successfully activated account ✅`,
      },
      RU: {
        body: ctx => `Ребенок успешно активировал свой акканут ✅`,
      },
      UA: {
        body: ctx => `Дитина успішно активувала свій акканут ✅`,
      },
    },
  },
  {
    type: ChildNotificationsTypes.ONE_TIME_TASK_ADDED,
    translations: {
      EN: {
        body: ctx => `A new task ${ctx.taskName} has been added for today 📆`,
      },
      RU: {
        body: ctx => `Новая задача ${ctx.taskName} добавлена на сегодня 📆`,
      },
      UA: {
        body: ctx => `Нова задача ${ctx.taskName} додана на сьогодні 📆`,
      },
    },
  },
  {
    type: ParentNotificationsTypes.AWARD_PURCHASED,
    translations: {
      EN: {
        body: ctx =>
          `${ctx.childUsername} bought reward for the points earn 🥳`,
      },
      RU: {
        body: ctx => `Ребенок купил награду за набранные баллы 🥳`,
      },
      UA: {
        body: ctx => `Дитина купила нагороду за набрані бали 🥳`,
      },
    },
  },
  {
    type: ChildNotificationsTypes.SET_CREDS,
    translations: {
      EN: {
        title: ctx => 'Action is required 🔐',
        body: ctx => 'Indicate your user name and password on the profile tab',
      },
      RU: {
        title: ctx => 'Требуется действие 🔐',
        body: ctx => 'Укажите на вкладке профиля свой логин и пароль',
      },
      UA: {
        title: ctx => 'Потрібна ваша дія 🔐',
        body: ctx => 'Вкажіть на вкладці профілю свій логін і пароль',
      },
    },
  },
  {
    type: ChildNotificationsTypes.AWARD_UPDATED,
    translations: {
      EN: {
        title: ctx => 'Reward has been updated 🎁',
        body: ctx => 'Parent have updated the current reward',
      },
      RU: {
        title: ctx => 'Награда обновлена 🎁',
        body: ctx => 'Родители обновили текущую награду',
      },
      UA: {
        title: ctx => 'Нагорода оновлена 🎁',
        body: ctx => 'Батьки оновили поточну нагороду',
      },
    },
  },
  {
    type: ChildNotificationsTypes.AWARD_APPROVED,
    translations: {
      EN: {
        title: ctx => 'Changes to reward',
        body: ctx => 'Parent has approved changes to reward ✅',
      },
      RU: {
        title: ctx => 'Изменения по награде',
        body: ctx => 'Поздравляем, изменения по награде подтверждено ✅',
      },
      UA: {
        title: ctx => 'Зміна нагороди',
        body: ctx => 'Вітаємо, зміну затверджено батьками ✅',
      },
    },
  },
  {
    type: ChildNotificationsTypes.AWARD_REJECTED,
    translations: {
      EN: {
        title: ctx => 'Changes to reward',
        body: ctx => 'Parent has reject changes to reward 😩',
      },
      RU: {
        title: ctx => 'Изменения по награде',
        body: ctx => 'Изменения по награде отклонено 😩',
      },
      UA: {
        title: ctx => 'Зміна нагороди',
        body: ctx => 'Зміну по нагороді відхилено батьками 😩',
      },
    },
  },
];
