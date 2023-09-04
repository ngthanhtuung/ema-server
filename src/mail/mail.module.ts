import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import MailRepository from './mail.repository';
@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([MailRepository])
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule { }
