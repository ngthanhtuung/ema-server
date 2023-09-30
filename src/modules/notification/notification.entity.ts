import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: 'notification' })
export class NotificationEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'varchar', nullable: false })
    content: string;

    @Column({
        type: 'boolean',
        default: false,
    })
    readFlag: boolean;

    @ManyToOne(() => UserEntity, (user) => user.notifications, { onDelete: 'CASCADE' })
    user: UserEntity;

}