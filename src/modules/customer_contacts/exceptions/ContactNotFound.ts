import { HttpException, HttpStatus } from '@nestjs/common';

export class ContactNotFoundException extends HttpException {
  constructor() {
    super('Contact not found', HttpStatus.NOT_FOUND);
  }
}
