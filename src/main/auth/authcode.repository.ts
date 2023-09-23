import { Repository } from "typeorm";
import { CustomRepository } from "src/type-orm/typeorm-ex.decorator";
import AuthCode from "./authcode.entity";


@CustomRepository(AuthCode)
export default class AuthCodeRepository extends Repository<AuthCode> {

    /**
     * checkCodeByIdUser
     * @param idUser 
     * @returns 
     */
    async checkCodeByIdUser(idUser: string): Promise<any | undefined> {
        try {
            const code = await this.findOne({
                where: { user: { id: idUser } },
                relations: ['user', 'authcode']
            })
            return code;
        } catch (err) {
            console.log('Error at checkCodeByIdUser in AccountRepository: ', err.message)
            return null;
        }
    }
}