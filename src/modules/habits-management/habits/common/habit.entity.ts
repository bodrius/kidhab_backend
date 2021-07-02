import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
  RelationId,
} from 'typeorm';
import { HabitCategoryEntity } from '../../habit-categories/common/habit-category.entity';
import { TaskEntity } from '../../tasks/common/task.entity';
import { ChildEntity } from '../../../children/common/child.entity';
import { HabitsStatuses } from './habits-statuses.enum';
import { Languages } from '@src/shared/interfaces/languages.enum';

export interface HabitDraft {
  name?: string;
  description?: string;
  points?: number;
  imagePath?: string;
  reccurence?: string;
  timesToComplete?: number;
  categoryId?: string;
  baseDate?: string;
  translations?: HabitTranslations;
}

export interface HabitTranslations {
  name: Record<Languages, string>;
}

@Entity('habits')
export class HabitEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  points?: number;

  @Column({ type: 'int', nullable: true })
  pointsRate?: number;

  @Column({ enum: HabitsStatuses, default: HabitsStatuses.IN_PROGRESS })
  status: HabitsStatuses;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'interval', nullable: true })
  reccurence?: string;

  @Column({ type: 'date', nullable: true })
  baseDate?: string;

  @Column({ type: 'int', nullable: true })
  timesToComplete?: number;

  @Column({ type: 'int', nullable: true })
  timesToCompleteLeft?: number;

  @Column({ type: 'int', default: 0 })
  timesToCompleteLevel: number;

  @Column({ type: 'int', default: 0 })
  timesToCompleteLevelLeft: number;

  @Column({ type: 'int', default: 0 })
  habitLevel: number;

  @Column({ default: false })
  levelStreakBroken: boolean;

  @Column('jsonb', { default: () => "'{}'::json" })
  translations: HabitTranslations;

  @ManyToOne(() => HabitCategoryEntity)
  @JoinColumn()
  category?: HabitCategoryEntity;

  @RelationId((habit: HabitEntity) => habit.category)
  categoryId?: string;

  @Column({ type: 'jsonb', nullable: true })
  draft?: HabitDraft;

  @ManyToOne(() => ChildEntity, { onDelete: 'CASCADE' })
  child: ChildEntity;

  @RelationId((habit: HabitEntity) => habit.child)
  childId: string;

  @OneToMany(
    () => TaskEntity,
    task => task.habit,
  )
  tasks: TaskEntity[];

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
