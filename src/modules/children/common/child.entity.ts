import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  RelationId,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Genders } from './gender.enum';
import { FamilyEntity } from '../../families/common/family.entity';
import { ChildStatuses } from './child-statuses.enum';
import { HabitEntity } from '../../habits-management/habits/common/habit.entity';
import { AwardEntity } from '../../awards-management/awards/common/award.entity';
import { HabitCategoryEntity } from '../../habits-management/habit-categories/common/habit-category.entity';
import { Languages } from '../../../shared/interfaces/languages.enum';

@Entity('children')
export class ChildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ type: 'int2' })
  age: number;

  @Column({ enum: Genders })
  gender: Genders;

  @Column({
    enum: ChildStatuses,
    nullable: true,
    default: ChildStatuses.CREATED,
  })
  status: ChildStatuses;

  @Column({ nullable: true, unique: true })
  inviteHash?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  avatarPath: string;

  @Column({ default: 0, type: 'integer' })
  balance: number;

  @Column({ default: Languages.RU })
  language: Languages;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  family: FamilyEntity;

  @RelationId((child: ChildEntity) => child.family)
  familyId: string;

  @ManyToMany(() => HabitCategoryEntity)
  @JoinTable()
  categories: HabitCategoryEntity[];

  @OneToMany(
    () => HabitEntity,
    habit => habit.child,
    { cascade: true },
  )
  habits: HabitEntity[];

  @OneToMany(
    () => AwardEntity,
    award => award.child,
    { cascade: true },
  )
  awards: AwardEntity[];

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
