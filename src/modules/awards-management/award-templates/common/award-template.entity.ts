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
import { AwardTypes } from '../../award-types.enum';
import { FamilyEntity } from '../../../families/common/family.entity';
import { Languages } from '@src/shared/interfaces/languages.enum';

export interface AwardTemplateTranslations {
  name: Record<Languages, string>;
}

@Entity('award_templates')
export class AwardTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  description: string;

  @Column({ enum: AwardTypes, default: AwardTypes.MATERIAL })
  type: AwardTypes;

  @Column({ type: 'int' })
  cost: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('jsonb', { default: () => "'{}'::json" })
  translations: AwardTemplateTranslations;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  family: FamilyEntity;

  @RelationId((awardTemplate: AwardTemplateEntity) => awardTemplate.family)
  familyId: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
