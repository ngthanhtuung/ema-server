import { Injectable } from '@nestjs/common';

interface CsvData {
  id: number;
  name: string;
  age: number;
  someKey: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
