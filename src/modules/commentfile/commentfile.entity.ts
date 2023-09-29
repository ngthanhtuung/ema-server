import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'comment_file' })
export class CommentFileEntity extends BaseEntity {

    @Column({ type: 'varchar' })
    fileType: string;

    @Column({ type: 'varchar', nullable: false })
    fileUrl: string;
}