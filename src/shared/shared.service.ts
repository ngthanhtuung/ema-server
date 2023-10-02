import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class SharedService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * hashPassword
   * @param password
   * @returns
   */
  public async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * shuffleArray
   * @param array
   * @returns
   */
  private shuffleArray = (array: Array<string>): string[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[i];
      array[j] = temp;
    }
    return array;
  };

  /**
   * generatePassword
   * @param passwordLength
   * @returns
   */
  public generatePassword = (passwordLength: number): string => {
    const numberChars = '0123456789';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const symbolsChars = '!@#$%^&*_-+=';
    const allChars = numberChars + upperChars + lowerChars + symbolsChars;
    let randomPasswordArray = Array(passwordLength);
    randomPasswordArray[0] = numberChars;
    randomPasswordArray[1] = upperChars;
    randomPasswordArray[2] = lowerChars;
    randomPasswordArray[3] = symbolsChars;
    randomPasswordArray = randomPasswordArray.fill(allChars, 4);
    return this.shuffleArray(
      randomPasswordArray.map((x) => x[Math.floor(Math.random() * x.length)]),
    ).join('');
  };

  public generateUniqueRandomNumber(): string {
    let uniqueNumber;
    const usedNumbers = new Set();
    do {
      uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    } while (usedNumbers.has(uniqueNumber));

    usedNumbers.add(uniqueNumber);
    return String(uniqueNumber);
  }

  /**
   * comparePassword
   * @param password
   * @param hashPassword
   * @returns
   */
  public async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  /**
   * sendConfirmEmail
   * @param email
   * @param username
   * @param password
   * @returns
   */
  public async sendConfirmEmail(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const response = await this.mailService.sendEmail(email, password);
      if (response) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  /**
   * sendCodeEmail
   * @param email
   * @param username
   * @returns
   */
  public async sendCodeEmail(email: string, code: string): Promise<boolean> {
    try {
      const response = await this.mailService.sendCodeByEmail(email, code);
      if (response) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}
