import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import DivisionRepository from './division.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([DivisionRepository])
  ],
  controllers: [DivisionController],
  providers: [DivisionService],
})
export class DivisionModule { }
