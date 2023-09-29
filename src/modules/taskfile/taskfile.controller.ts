import { Controller } from '@nestjs/common';
import { TaskfileService } from './taskfile.service';

@Controller('taskfile')
export class TaskfileController {
  constructor(private readonly taskfileService: TaskfileService) {}
}
