import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity({ name: 'task_file' })
export class TaskFileEntity extends BaseEntity {

    @Column({ type: 'varchar' })
    fileType: string;

    @Column({ type: 'varchar', nullable: false })
    fileUrl: string;
}