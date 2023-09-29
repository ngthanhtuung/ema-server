import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { AccountEntity } from "../account/account.entity";

@Entity({ name: 'device' })
export class DeviceEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    deviceToken: string;

    @ManyToOne(() => AccountEntity, (account) => account.devices, { onDelete: 'CASCADE' })
    account: AccountEntity;
}