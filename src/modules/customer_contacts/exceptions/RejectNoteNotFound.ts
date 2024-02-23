import { HttpException, HttpStatus } from '@nestjs/common';

export class RejectNoteNotFound extends HttpException {
  constructor() {
    super('Reject Note is not empty, please fill it', HttpStatus.NOT_FOUND);
  }
}
