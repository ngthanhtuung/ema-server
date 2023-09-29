import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'comment' })
export class CommentEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    text: string;

    @Column({
        type: 'boolean',
        default: true,
    })
    status: boolean;
}