import { Languages } from '@src/shared/interfaces/languages.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { ChildEntity } from '../../../children/common/child.entity';
import { AwardTypes } from '../../award-types.enum';
import { AwardStatuses } from './award-statuses.enum';

export interface AwardDraft {
  name?: string;
  description?: string;
  type?: AwardTypes;
  cost?: number;
  imageUrl?: string;
  isActive?: boolean;
  translations?: AwardTranslations;
}

export interface AwardTranslations {
  name: Record<Languages, string>;
}

@Entity('awards')
export class AwardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ enum: AwardTypes, nullable: true })
  type?: AwardTypes;

  @Column({ type: 'int', nullable: true })
  cost?: number;

  @Column({ default: AwardStatuses.CREATED, enum: AwardStatuses })
  status: AwardStatuses;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  draft?: AwardDraft;

  @Column('jsonb', { default: () => "'{}'::json" })
  translations: AwardTranslations;

  @ManyToOne(() => ChildEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  child: ChildEntity;

  @RelationId((award: AwardEntity) => award.child)
  childId: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
