import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import { RoleRepository } from './role.repository';
import { RoleProfile } from './role.profile';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([RoleRepository])
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleProfile],
  exports: [RoleService]
})
export class RoleModule { }
