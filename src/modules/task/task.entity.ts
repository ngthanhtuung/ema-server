import { EPriority, ETaskStatus } from "src/common/enum/enum";
import { BaseEntity } from "../base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'task' })
export class TaskEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'datetime' })
    startDate: Date;

    @Column({ type: 'datetime' })
    endDate: Date;

    @Column({ type: 'varchar' })
    description: string;

    @Column({
        type: 'enum',
        enum: EPriority,
    })
    priority: EPriority;

    @Column({ type: 'varchar', nullable: true })
    hasParent: string;

    @Column({
        type: 'enum',
        enum: ETaskStatus,
        default: ETaskStatus.PENDING,
    })
    status: ETaskStatus;

    @Column({ type: 'int' })
    estimationTime: number;

    @Column({ type: 'int' })
    effort: number;
}