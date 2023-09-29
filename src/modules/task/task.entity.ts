import { EPriority, ETaskStatus } from "src/common/enum/enum";
import { BaseEntity } from "../base/base.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { EventEntity } from "../event/event.entity";
import { TaskFileEntity } from "../taskfile/taskfile.entity";
import { CommentEntity } from "../comment/comment.entity";
import { AccountEntity } from "../account/account.entity";

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

    @ManyToOne(() => EventEntity, (event) => event.tasks, { onDelete: 'CASCADE' })
    event: EventEntity;

    @OneToMany(() => TaskFileEntity, (taskFile) => taskFile.task, { onDelete: 'CASCADE' })
    taskFiles: TaskFileEntity[];

    @OneToMany(() => CommentEntity, (comment) => comment.task, { onDelete: 'CASCADE' })
    comments: CommentEntity[];

    @ManyToOne(() => AccountEntity, (account) => account.tasks, { onDelete: 'CASCADE' })
    account: AccountEntity;
}