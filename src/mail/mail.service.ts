import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import * as FormData from 'form-data';
import MailRepository from './mail.repository';
@Injectable()
export class MailService {

    constructor(
        private readonly configService: ConfigService,
        private readonly mailRepository: MailRepository,
    ) { }

    /**
     * getConnection
     * @returns 
     */
    async getConnection(): Promise<any | undefined> {
        const mailgunKey = this.configService.get<string>('MAILGUN_API_PRIVATE_KEY');
        const mailGunBaseUrl = this.configService.get<string>('MAILGUN_API_BASE_URL');
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
    async sendEmail(toUser: string, password: string): Promise<any | undefined> {
        try {
            const mg = await this.getConnection();
            const mailData = await this.mailRepository.getDetailMailTemplate(1);
            console.log("mailData:", mailData);
            const htmlMail = mailData?.mailText?.replace('${email}', toUser)?.replace('${password}', password)
            console.log("htmlMail:", htmlMail);
            const data = {
                from: "HREA System <tungnt16092001@gmail.com>",
                to: [toUser],
                subject: mailData?.mailTitle,
                html: htmlMail
            }
            const response = await mg.messages.create(this.configService.get<string>('MAILGUN_API_BASE_URL'), data);
            return response;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * sendCodeByEmail
     * @param toUser 
     * @param username 
     * @param code 
     * @returns 
     */
    async sendCodeByEmail(toUser: string, username: string, code: string): Promise<any | undefined> {
        try {
            const mg = await this.getConnection();
            // Get ID : 2
            const mailData = await this.mailRepository.getDetailMailTemplate(2);
            console.log("mailData:", mailData);
            const htmlMail = mailData?.mailText?.replace('${username}', username)?.replace('${code}', code)
            console.log("htmlMail:", htmlMail);
            const data = {
                from: "HREA System <tungnt16092001@gmail.com>",
                to: [toUser],
                subject: mailData?.mailTitle,
                html: htmlMail
            }
            const response = await mg.messages.create(this.configService.get<string>('MAILGUN_API_BASE_URL'), data);
            return response;
        } catch (err) {
            console.log(err);
        }
    }
}
