import { Repository } from "typeorm";
import { DivisionEntity } from "./division.entity";
import { CustomRepository } from "src/type-orm/typeorm-ex.decorator";


@CustomRepository(DivisionEntity)
export default class DivisionRepository extends Repository<DivisionEntity> {

}