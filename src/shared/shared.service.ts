import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import User from 'src/main/user/user.entity';

@Injectable()
export class SharedService {

    constructor(
        private readonly configService: ConfigService,
        private readonly mailService: MailService
    ) { }

    public async hashPassword(password: string): Promise<string> {
        const salt: string = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    public async comparePassword(
        password: string,
        hashPassword: string,
    ): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword);
    }

    public async sendConfirmEmail(email: string, username: string): Promise<any | undefined> {
        try {
            const response = await this.mailService.sendEmail(email, 'Welcome to the HREA System', username);
            if (response) {
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    }
}
