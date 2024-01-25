import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from './settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettingEntity])],
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}
