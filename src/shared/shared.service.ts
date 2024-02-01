import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/modules/mail/mail.service';
import * as moment from 'moment';
// import {
//   InvalidFormatError,
//   InvalidNumberError,
//   NotEnoughUnitError,
//   ReadingConfig,
//   doReadNumber,
// } from 'read-vietnamese-number';

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
      uniqueNumber = Math.floor(1000 + Math.random() * 9000);
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

  public async moneyToWord(amount: number): Promise<string | undefined> {
    // const config = new ReadingConfig();
    // config.unit = ['đồng'];
    try {
      // const result = doReadNumber(config, amount.toString());
      // return result.charAt(0).toUpperCase() + result.slice(1);
      return 'Đang fix lỗi này';
    } catch (err) {
      return undefined;
    }
  }

  public async formattedCurrency(amount: number): Promise<string | undefined> {
    try {
      const formattedAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
      return formattedAmount;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  public async calculateDuration(
    startDate: Date,
    endDate: Date,
  ): Promise<string | undefined> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Calculate the difference in milliseconds
      const durationInMs = end.getTime() - start.getTime();

      // Convert milliseconds to days, hours, minutes, and seconds
      const days = Math.floor(durationInMs / (24 * 60 * 60 * 1000));
      // Format the result
      const durationString = `${days} ngày`;
      return durationString;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  public async formatDateToString(
    date: Date,
    format: string,
  ): Promise<string | undefined> {
    try {
      return moment(date).format(format);
    } catch (err) {
      return undefined;
    }
  }

  public async generateContractCode(): Promise<string | undefined> {
    try {
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const contractCode = `#C-${randomPart}`;

      return contractCode;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
