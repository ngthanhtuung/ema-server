import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../base/base.entity";
import { TaskEntity } from "../task/task.entity";
import { CommentFileEntity } from "../commentfile/commentfile.entity";
import { AccountEntity } from "../account/account.entity";

@Entity({ name: 'comment' })
export class CommentEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    text: string;

    @Column({
        type: 'boolean',
        default: true,
    })
    status: boolean;

    @ManyToOne(() => TaskEntity, (task) => task.comments, { onDelete: 'CASCADE' })
    task: TaskEntity;

    @OneToMany(() => CommentFileEntity, (commentFile) => commentFile.comment, { onDelete: 'CASCADE' })
    commentFiles: CommentFileEntity[];

    @ManyToOne(() => AccountEntity, (account) => account.comments, { onDelete: 'CASCADE' })
    account: AccountEntity;
}