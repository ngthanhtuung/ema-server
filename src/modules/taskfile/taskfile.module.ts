import { Module } from '@nestjs/common';
import { TaskfileService } from './taskfile.service';
import { TaskfileController } from './taskfile.controller';

@Module({
  controllers: [TaskfileController],
  providers: [TaskfileService],
})
export class TaskfileModule {}
