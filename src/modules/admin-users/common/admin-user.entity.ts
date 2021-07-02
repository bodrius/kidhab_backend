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
import { AdminRoleEntity } from './admin-role.entity';

@Entity('admin_users')
export class AdminUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: true })
  shouldResetPassword: boolean;

  @RelationId((adminUser: AdminUserEntity) => adminUser.role)
  roleId: string;

  @ManyToOne(() => AdminRoleEntity)
  @JoinColumn()
  role: AdminRoleEntity;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
