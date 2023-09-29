import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { EEventStatus } from "src/common/enum/enum";

@Entity({ name: 'event' })
export class EventEntity extends BaseEntity {

    @Column({ type: 'varchar' })
    eventName: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    processDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ type: 'float' })
    income: number;

    @Column({ type: 'float' })
    outcome: number;

    @Column({ type: 'varchar' })
    coverUrl: string;

    @Column({ type: 'float' })
    estBugdet: number;

    @Column({
        enum: EEventStatus,
        type: 'enum',
        default: EEventStatus.PENDING,
    })
    status: EEventStatus;

}