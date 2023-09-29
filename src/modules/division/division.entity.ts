import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'division' })
export class DivisionEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    divisionName: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;
}