import { Controller, Post, Body, Query, Put, Get, Param } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import {
  FilterTask,
  GetListTaskByDate,
  TaskConditonFind,
  TaskCreateReq,
  TaskIDReq,
  TaskUpdateReq,
  TaskUpdateStatusReq,
} from './dto/task.request';
import { GetUser } from 'src/decorators/getUser.decorator';
import { TaskEntity } from './task.entity';
import { UserPagination } from '../user/dto/user.request';

@Controller('task')
@ApiBearerAuth()
@ApiTags('Task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTaskById(
    @Query() condition: TaskConditonFind,
    @Query() userPagination: UserPagination,
  ): Promise<TaskEntity> {
    return await this.taskService.getTaskInfo(condition, userPagination);
  }

  @Get('/filterByDate')
  async getListTaskInfoByDateOfUser(
    @Query() condition: GetListTaskByDate,
  ): Promise<TaskEntity> {
    return await this.taskService.getListTaskInfoByDateOfUser(condition);
  }

  @Get('/filterByAssignee')
  async filterTaskByCondition(
    @Query() filter: FilterTask,
  ): Promise<TaskEntity> {
    return await this.taskService.filterTaskByAssignee(filter);
  }

  @Post('createTask')
  @Roles(ERole.MANAGER, ERole.STAFF)
  async createTask(
    @GetUser() user: string,
    @Body() req: TaskCreateReq,
  ): Promise<string> {
    return await this.taskService.createTask(req, user);
  }

  @Put('updateTask')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.EMPLOYEE)
  async updateTask(
    @Query() taskIDReq: TaskIDReq,
    @Body() req: TaskUpdateReq,
    @GetUser() user: string,
  ): Promise<string> {
    const oUser = JSON.parse(user);
    const data = {
      modifiedBy: oUser.id,
    };
    for (const key in req) {
      if (req[key] && key === 'parentTask') {
        Object.assign(data, {
          parent: {
            id: req[key],
          },
        });
      } else if (req[key]) {
        Object.assign(data, { [key]: req[key] });
      }
    }
    const res = await this.taskService.updateTask(
      taskIDReq.taskID,
      data,
      oUser,
    );
    if (res) return 'Update task information success';
  }

  @Put('updateTaskStatus')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.EMPLOYEE)
  async updateTaskStatus(
    @Query() req: TaskUpdateStatusReq,
    @GetUser() user: string,
  ): Promise<string> {
    const { taskID, status } = req;
    const oUser = JSON.parse(user);
    const data = {
      status,
      modifiedBy: oUser.id,
    };
    const res = await this.taskService.updateTask(taskID, data, oUser);
    if (res) return 'Update status success';
  }

  @Get('/user-task/:userId')
  async checkUserInTask(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<unknown> {
    return this.taskService.checkUserInTask(userId, startDate, endDate);
  }
}
