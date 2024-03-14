import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun, { MessagesSendResult } from 'mailgun.js';
import * as FormData from 'form-data';
import MailRepository from './mail.repository';
import { IMailgunClient } from 'mailgun.js/Interfaces';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailRepository: MailRepository,
  ) {}

  /**
   * getConnection
   * @returns
   */
  getConnection(): IMailgunClient {
    const mailgunKey = this.configService.get<string>(
      'MAILGUN_API_PRIVATE_KEY',
    );
    // const mailGunBaseUrl = this.configService.get<string>(
    //   'MAILGUN_API_BASE_URL',
    // );
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({ username: 'api', key: mailgunKey });
    return mg;
  }

  /**
   * sendEmail
   * @param toUser
   * @param username
   * @param password
   * @returns
   */
  async sendEmail(
    toUser: string,
    password: string,
  ): Promise<MessagesSendResult> {
    try {
      const mg = await this.getConnection();
      const mailData = await this.mailRepository.getDetailMailTemplate(1);
      console.info('mailData:', mailData);
      const htmlMail = mailData?.mailText
        ?.replace('${email}', toUser)
        ?.replace('${password}', password);
      console.info('htmlMail:', htmlMail);
      const data = {
        // from: 'EMA System <hreasytems.event@gmail.com>',
        from: 'EMA System <ema.event@gmail.com>',
        to: [toUser],
        subject: mailData?.mailTitle,
        html: htmlMail,
      };
      const response = await mg.messages.create(
        this.configService.get<string>('MAILGUN_API_BASE_URL'),
        data,
      );
      return response;
    } catch (err) {
      console.info(err);
    }
  }

  /**
   * sendCodeByEmail
   * @param toUser
   * @param username
   * @param code
   * @returns
   */
  async sendCodeByEmail(
    toUser: string,
    code: string,
  ): Promise<MessagesSendResult> {
    try {
      const mg = await this.getConnection();
      // Get ID : 2
      const mailData = await this.mailRepository.getDetailMailTemplate(2);
      console.info('mailData:', mailData);
      const htmlMail = mailData?.mailText
        ?.replace('${email}', toUser)
        ?.replace('${code}', code);
      console.info('htmlMail:', htmlMail);
      const data = {
        from: 'EMA System <ema.event@gmail.com>',
        to: [toUser],
        subject: mailData?.mailTitle,
        html: htmlMail,
      };
      const response = await mg.messages.create(
        this.configService.get<string>('MAILGUN_API_BASE_URL'),
        data,
      );
      return response;
    } catch (err) {
      console.info(err);
    }
  }

  async sendConfirmContractEmail(
    toUser: string,
    customerName: string,
    emailConfirm: string,
    companyRepresentativeName: string,
    companyRepresentativeEmail: string,
    companyRepresentativePhoneNumber: string,
  ): Promise<MessagesSendResult> {
    try {
      const mg = await this.getConnection();
      // Get ID : 3
      const mailData = await this.mailRepository.getDetailMailTemplate(3);
      const htmlMail = mailData?.mailText
        ?.replace('{customerName}', customerName)
        ?.replace('{emailConfirm}', emailConfirm)
        ?.replace('{companyRepresentativeName}', companyRepresentativeName)
        ?.replace('{companyRepresentativeEmail}', companyRepresentativeEmail)
        ?.replace(
          '{companyRepresentativePhoneNumber}',
          companyRepresentativePhoneNumber,
        );
      const data = {
        from: 'EMA System <ema.event@gmail.com>',
        to: [toUser],
        subject: mailData?.mailTitle,
        html: htmlMail,
      };
      const response = await mg.messages.create(
        this.configService.get<string>('MAILGUN_API_BASE_URL'),
        data,
      );
      return response;
    } catch (err) {
      console.error(err);
    }
  }
}
