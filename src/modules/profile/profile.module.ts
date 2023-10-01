import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmExModule } from 'src/type-orm/typeorm-ex.module';
import ProfileRepository from './profile.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([ProfileRepository])],
  providers: [ProfileService],
})
export class ProfileModule {}
