import { BeforeInsert, Column, PrimaryGeneratedColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { AutoMap } from "@automapper/classes";

export default class BaseEntity {

    @AutoMap()
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    public id: string;

    @AutoMap()
    @Column('datetime', { name: 'createdAt' })
    public createdAt: Date;

    @AutoMap()
    @Column('varchar', { name: 'createdBy', nullable: true })
    public createdBy: string;

    @AutoMap()
    @Column('datetime', { name: 'modifiedAt', nullable: true })
    public modifiedAt: Date;

    @AutoMap()
    @Column('varchar', { name: 'modifiedBy', nullable: true })
    public modifiedBy: string;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = moment().tz('Asia/Ho_Chi_Minh').toDate();
    }
}