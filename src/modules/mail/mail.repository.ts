import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import Mail from './mail.entity';
import { Repository } from 'typeorm';
import ApiResponse from 'src/shared/res/apiResponse';
import { HttpException, HttpStatus } from '@nestjs/common';

@CustomRepository(Mail)
export default class MailRepository extends Repository<Mail> {
  /**
   * getDetailMailTemplate
   * @param idMail
   * @returns
   */
  async getDetailMailTemplate(idMail: number): Promise<Mail> {
    try {
      const mailData = await this.findOne({
        where: { id: idMail },
      });
      return mailData;
    } catch (err) {
      console.info('Error at MailRepository: ', err.message);
      throw new HttpException(
        new ApiResponse('Fail', err.message),
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
