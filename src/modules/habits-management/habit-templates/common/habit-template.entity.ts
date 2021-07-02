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
import { HabitCategoryEntity } from '../../habit-categories/common/habit-category.entity';
import { FamilyEntity } from '../../../families/common/family.entity';
import { Languages } from '@src/shared/interfaces/languages.enum';

export interface HabitTemplateTranslations {
  name: Record<Languages, string>;
}

@Entity('habit-templates')
export class HabitTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'int' })
  points: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('interval')
  defaultReccurence: string;

  @Column('jsonb', { default: () => "'{}'::json" })
  translations: HabitTemplateTranslations;

  @ManyToOne(() => HabitCategoryEntity)
  @JoinColumn()
  category: HabitCategoryEntity;

  @RelationId((habitTemplate: HabitTemplateEntity) => habitTemplate.category)
  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  family?: FamilyEntity;

  @RelationId((habitTemplate: HabitTemplateEntity) => habitTemplate.family)
  familyId?: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
