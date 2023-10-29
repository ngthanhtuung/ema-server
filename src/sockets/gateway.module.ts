import { Module } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { CommentGateway } from './comment.gateway';

@Module({
  imports: [UserModule, CommentModule],
  providers: [CommentGateway],
})
export class GatewayModule {}
