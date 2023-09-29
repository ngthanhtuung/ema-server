import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { AccountEntity } from "../account/account.entity";

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

    @ManyToOne(() => AccountEntity, (account) => account.notifications, { onDelete: 'CASCADE' })
    account: AccountEntity;

}