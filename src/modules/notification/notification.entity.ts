import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

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

}