import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import DepartmentRepository from './department.repository';
import { DepartmentProfile } from './department.profile';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([DepartmentRepository])
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentProfile],
  exports: [DepartmentService]
})
export class DepartmentModule { }
