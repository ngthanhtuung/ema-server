import { EReplyRequest } from "src/common/enum/enum";
import { BaseEntity } from "../base/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'request' })
export class RequestEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    title: string;

    @Column({ type: 'varchar', nullable: false })
    content: string;

    @Column({
        type: 'enum',
        enum: EReplyRequest,
        default: EReplyRequest.PENDING,
    })
    replyStatus: EReplyRequest;

    @Column({ type: 'varchar' })
    replyMessage: string;


}