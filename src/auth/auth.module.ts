import { Module } from '@nestjs/common';
import { AuthenticationController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { AccountModule } from 'src/modules/account/account.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [AccountModule, SharedModule],
  controllers: [AuthenticationController],
  providers: [AuthService],
})
export class AuthenticationModule {}
