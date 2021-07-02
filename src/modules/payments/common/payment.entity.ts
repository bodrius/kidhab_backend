import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FamilyEntity } from '../../families/common/family.entity';
import { ParentEntity } from '../../parents/common/parent.entity';
import { PaymentTypes } from './payment-types.enum';

@Entity('payments')
@Unique(['subscriptionId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column()
  subscriptionId: string;

  @Column('timestamp')
  expiresAt: Date;

  @Column('timestamp')
  purchasedAt: Date;

  @Column('uuid', { nullable: true })
  familyId?: string;

  @Column('uuid', { nullable: true })
  parentId?: string;

  @Column({ enum: PaymentTypes, default: PaymentTypes.APPLE })
  type: PaymentTypes;

  @ManyToOne(() => FamilyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId', referencedColumnName: 'id' })
  family?: FamilyEntity;

  @ManyToOne(() => ParentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId', referencedColumnName: 'id' })
  parent?: ParentEntity;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
