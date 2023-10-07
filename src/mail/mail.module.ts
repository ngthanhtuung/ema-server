import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Mail from './mail.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Mail])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
