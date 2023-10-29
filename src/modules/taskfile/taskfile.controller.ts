import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { TaskfileService } from './taskfile.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { TaskFileCreateReq, TaskFileRequest } from './dto/taskFile.request';

@Controller('taskFile')
@ApiBearerAuth()
@ApiTags('Task File')
export class TaskfileController {
  constructor(private readonly taskfileService: TaskfileService) {}

  @Post()
  async insertTaskFile(@Body() req: TaskFileCreateReq): Promise<string> {
    return await this.taskfileService.insertTaskFile(req);
  }

  @Put('/:taskId')
  @ApiBody({
    type: [TaskFileRequest],
  })
  async updateTaskFile(
    @Param('taskId') taskId: string,
    @Body() req: TaskFileRequest[],
  ): Promise<string> {
    return await this.taskfileService.updateTaskFile(taskId, req);
  }
}
