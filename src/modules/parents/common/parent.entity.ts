import { Languages } from '../../../shared/interfaces/languages.enum';
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
import { FamilyEntity } from '../../families/common/family.entity';

@Entity('parents')
export class ParentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isTestPassed: boolean;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  avatarPath?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: Languages.RU })
  language: Languages;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  family: FamilyEntity;

  @RelationId((parent: ParentEntity) => parent.family)
  familyId: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
