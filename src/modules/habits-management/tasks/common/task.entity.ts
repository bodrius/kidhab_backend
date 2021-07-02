import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { HabitEntity } from '../../habits/common/habit.entity';
import { TaskStatuses } from './task-statuses.enum';
import { ChildEntity } from '../../../children/common/child.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  totalPoints?: number;

  @Column({ enum: TaskStatuses, default: TaskStatuses.CREATED })
  status: TaskStatuses;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => HabitEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  habit: HabitEntity;

  @RelationId((task: TaskEntity) => task.habit)
  habitId: string;

  @ManyToOne(() => ChildEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  child: ChildEntity;

  @RelationId((task: TaskEntity) => task.child)
  childId: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
