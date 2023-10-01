import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import DivisionRepository from './division.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionEntity } from './division.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DivisionEntity])
  ],
  controllers: [DivisionController],
  providers: [DivisionService],
})
export class DivisionModule { }
