import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/modules/account/account.entity';
import { AccountService } from 'src/modules/account/account.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity]), SharedModule],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
