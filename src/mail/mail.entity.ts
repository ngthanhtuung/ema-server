import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AutoMap } from "@automapper/classes";

@Entity()
export default class Mail {

    @PrimaryGeneratedColumn('increment')
    public id: number;

    @AutoMap()
    @Column('nvarchar', { name: 'mailTitle', nullable: false, length: 500 })
    public mailTitle: string;

    @AutoMap()
    @Column('nvarchar', { name: 'mailText', nullable: false, length: 500 })
    public mailText: string;
}
