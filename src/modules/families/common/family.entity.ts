import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ParentEntity } from '../../parents/common/parent.entity';
import { ChildEntity } from '../../children/common/child.entity';
import { AwardTemplateEntity } from '../../awards-management/award-templates/common/award-template.entity';
import { HabitTemplateEntity } from '../../habits-management/habit-templates/common/habit-template.entity';
import { FamilyAccountTypes } from './family-account-types.enum';

@Entity('families')
export class FamilyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ enum: FamilyAccountTypes, default: FamilyAccountTypes.BASIC })
  accountType: FamilyAccountTypes;

  @Column({ nullable: true })
  parentInviteHash?: string;

  @Column({ nullable: true })
  subscriptionId?: string;

  @Column({ nullable: true })
  subscriptionExpiresAt?: Date;

  @Column({ default: false })
  isTest: boolean;

  @OneToMany(
    () => ParentEntity,
    parent => parent.family,
    { cascade: true },
  )
  parents: ParentEntity[];

  @OneToMany(
    () => ChildEntity,
    child => child.family,
    { cascade: true },
  )
  children: ChildEntity[];

  @OneToMany(
    () => AwardTemplateEntity,
    awardTemplate => awardTemplate.family,
    { cascade: true },
  )
  awardTemplates: AwardTemplateEntity[];

  @OneToMany(
    () => HabitTemplateEntity,
    habitTemplate => habitTemplate.family,
    { cascade: true },
  )
  habitTemplates: HabitTemplateEntity[];

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
