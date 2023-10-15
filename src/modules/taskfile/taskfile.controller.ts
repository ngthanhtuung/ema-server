import { Controller, Post, Body } from '@nestjs/common';
import { TaskfileService } from './taskfile.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TaskFileCreateReq } from './dto/taskFile.request';

@Controller('taskFile')
@ApiBearerAuth()
@ApiTags('Task File')
export class TaskfileController {
  constructor(private readonly taskfileService: TaskfileService) { }

  @Post()
  async insertTaskFile(@Body() req: TaskFileCreateReq): Promise<string> {
    return await this.taskfileService.insertTaskFile(req);
  }
}
