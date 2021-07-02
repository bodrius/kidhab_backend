import { Languages } from '@src/shared/interfaces/languages.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HabitTemplateEntity } from '../../habit-templates/common/habit-template.entity';
import { HabitCategoryStatuses } from './habit-category-statuses.enum';

export interface HabitCategoriesTranslations {
  name: Record<Languages, string>;
}

@Entity('habit_categories')
export class HabitCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: HabitCategoryStatuses.ACTIVE })
  status: HabitCategoryStatuses;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  imageHabitScreenUrl: string;

  @Column('jsonb', { default: () => "'{}'::json" })
  translations: HabitCategoriesTranslations;

  @OneToMany(
    () => HabitTemplateEntity,
    habitTemplate => habitTemplate.category,
    { cascade: true },
  )
  templates: HabitTemplateEntity[];

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
