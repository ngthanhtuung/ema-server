import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { SharedModule } from 'src/shared/shared.module';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SharedModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
