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
import { ParentNotificationsTypes } from '../../../../shared/interfaces/parent-notifications-types.enum';
import { NotificationsStatuses } from '../../notifications-statuses.enum';
import { ChildEntity } from '../../../children/common/child.entity';
import { HabitEntity } from '../../../habits-management/habits/common/habit.entity';
import { AwardEntity } from '../../../awards-management/awards/common/award.entity';
import { ParentEntity } from '../../../parents/common/parent.entity';

@Entity('notifications_for_parent')
export class NotificationForParentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ enum: ParentNotificationsTypes })
  type: ParentNotificationsTypes;

  @Column({
    enum: NotificationsStatuses,
    default: NotificationsStatuses.ACTIVE,
  })
  status: NotificationsStatuses;

  @ManyToOne(() => ParentEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  parentReceiver: ParentEntity;

  @RelationId(
    (notification: NotificationForParentEntity) => notification.parentReceiver,
  )
  parentReceiverId: string;

  @ManyToOne(() => ChildEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  childAuthor: ChildEntity;

  @RelationId(
    (notification: NotificationForParentEntity) => notification.childAuthor,
  )
  childAuthorId: string;

  @ManyToOne(() => HabitEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  habit: HabitEntity;

  @RelationId((notification: NotificationForParentEntity) => notification.habit)
  habitId: string;

  @ManyToOne(() => AwardEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  award: AwardEntity;

  @RelationId((notification: NotificationForParentEntity) => notification.award)
  awardId: string;

  @CreateDateColumn({ type: 'timestamptz', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true })
  updatedAt: Date;
}
