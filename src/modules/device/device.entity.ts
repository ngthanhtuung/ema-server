import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'device' })
export class DeviceEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    deviceToken: string;
}