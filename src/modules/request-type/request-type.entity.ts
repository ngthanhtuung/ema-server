import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'request_type' })
export class RequestTypeEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    typeName: string;

}