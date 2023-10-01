import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionEntity } from './division.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DivisionEntity])],
  controllers: [DivisionController],
  providers: [DivisionService],
})
export class DivisionModule {}
