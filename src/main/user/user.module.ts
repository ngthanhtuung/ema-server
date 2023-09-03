import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import UserRepository from './user.repository';
import { UserProfile } from './user.profile';
import { RoleModule } from '../role/role.module';
import Department from '../department/department.entity';
import { DepartmentModule } from '../department/department.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository]),
    RoleModule,
    DepartmentModule,
    SharedModule
  ],
  controllers: [UserController],
  providers: [UserService, UserProfile],
  exports: [UserService]
})
export class UserModule { }
