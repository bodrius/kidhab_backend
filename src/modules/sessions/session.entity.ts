import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { SessionStatuses } from './session-statuses.enum';
import { ParentEntity } from '../parents/common/parent.entity';
import { ChildEntity } from '../children/common/child.entity';
import { AdminUserEntity } from '../admin-users/common/admin-user.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: SessionStatuses, default: SessionStatuses.ACTIVE })
  status: SessionStatuses;

  @Column({ nullable: true })
  deviceToken?: string;

  @RelationId((s: SessionEntity) => s.parent)
  parentId: string;

  @ManyToOne(() => ParentEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  parent: ParentEntity;

  @RelationId((s: SessionEntity) => s.child)
  childId: string;

  @ManyToOne(() => ChildEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  child: ChildEntity;

  @ManyToOne(() => AdminUserEntity, { nullable: true })
  @JoinColumn()
  adminUser: AdminUserEntity;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
