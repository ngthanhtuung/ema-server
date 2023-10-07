import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssignTaskService } from './assign-task.service';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import { AssignTaskReq } from './dto/assign-task.request';
import { GetUser } from 'src/decorators/getUser.decorator';

@Controller('assign-task')
@ApiBearerAuth()
@ApiTags('assign-task-controller')
export class AssignTaskController {
  constructor(private readonly assignTaskService: AssignTaskService) {}

  @Post()
  @Roles(ERole.MANAGER, ERole.STAFF)
  async assignMemberToTask(
    @Body() req: AssignTaskReq,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.assignTaskService.assignMemberToTask(req, user);
  }
}
