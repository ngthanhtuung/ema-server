import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from 'src/modules/profile/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity])],
})
export class ProfileModule {}
