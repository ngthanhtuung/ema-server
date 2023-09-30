import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: 'annual_leave' })
export class AnnualLeaveEntity extends BaseEntity {

    @Column({ type: 'int' })
    year: number;

    @Column({ type: 'float' })
    amount: number;

    @ManyToOne(() => UserEntity, (user) => user.annualLeaves, { onDelete: 'CASCADE' })
    user: UserEntity;
}