import { Module } from '@nestjs/common';
import { AuthenticationController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/modules/user/user.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [UserModule, SharedModule],
  controllers: [AuthenticationController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthenticationModule {}
