import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GetUser } from 'src/decorators/getUser.decorator';
import { Roles } from 'src/decorators/role.decorator';
import {
  EContractEvidenceType,
  EContractStatus,
  ERole,
} from 'src/common/enum/enum';
import { IPaginateResponse } from '../base/filter.pagination';
import { ContractPagination } from './dto/contract.pagination';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { FileRequest } from 'src/file/dto/file.request';
import { ContractEvidenceEntity } from './contract_evidence.entity';
import { EventCreateRequestContract } from '../event/dto/event.request';
import {
  ContractRejectNote,
  FilterContract,
  UpdateContractInfo,
} from './dto/contract.dto';
import { ContractEntity } from './contracts.entity';

@Controller('contracts')
@ApiBearerAuth()
@ApiTags('Contracts')
export class ContractsController {
  constructor(
    private readonly contractService: ContractsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Roles(ERole.ADMIN, ERole.MANAGER)
  async getAllContracts(
    @Query() contractPagination: ContractPagination,
    @Query() filter: FilterContract,
    @GetUser() user: string,
  ): Promise<IPaginateResponse<unknown>> {
    return await this.contractService.getAllContracts(
      filter,
      contractPagination,
      JSON.parse(user),
    );
  }

  @Get('file')
  @Roles(ERole.MANAGER)
  async getAllContractFile(): Promise<ContractEntity[]> {
    return await this.contractService.getAllContractFile();
  }

  @Get('file/customer')
  @Roles(ERole.CUSTOMER)
  async getAllContractFileByCustomer(
    @GetUser() user: string,
  ): Promise<ContractEntity[]> {
    return await this.contractService.getAllContractFileByCustomer(user);
  }

  @Get('file/:customerContactId')
  @Roles(ERole.CUSTOMER, ERole.MANAGER)
  async getContractFileByContractId(
    @Param('customerContactId') contractId: string,
  ): Promise<object | undefined> {
    return await this.contractService.getContractFileByCustomerContactId(
      contractId,
    );
  }

  @Get('/:eventId')
  @Roles(ERole.MANAGER, ERole.ADMIN)
  async getContractByEventId(
    @Param('eventId') id: string,
  ): Promise<unknown | undefined> {
    return await this.contractService.getContractByEventId(id);
  }

  @Post('/:customerContactId/new')
  @Roles(ERole.MANAGER)
  async createContract(
    @Param('customerContactId') id: string,
    @Body() contract: EventCreateRequestContract,
    @GetUser() user: string,
  ): Promise<object | undefined> {
    return await this.contractService.generateNewContract(
      contract,
      id,
      JSON.parse(user),
    );
  }

  @Post('/:customerContactId/re-create')
  @Roles(ERole.MANAGER)
  async reGenerateContract(
    @Param('customerContactId') customerContactId: string,
    @GetUser() user: string,
  ): Promise<object | string> {
    return await this.contractService.recreateContract(
      customerContactId,
      JSON.parse(user),
    );
  }

  @Get('/:contractId/evidence')
  @Roles(ERole.MANAGER, ERole.ADMIN, ERole.CUSTOMER)
  async getEvidenceByContractId(
    @Param('contractId') contractId: string,
  ): Promise<ContractEvidenceEntity[]> {
    return await this.contractService.getEvidenceByContractId(contractId);
  }

  @Post('/:contractId/evidence')
  @ApiConsumes('multipart/form-data')
  @Roles(ERole.MANAGER, ERole.ADMIN, ERole.CUSTOMER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'type',
    enum: EContractEvidenceType,
    required: true,
  })
  @UseInterceptors(FilesInterceptor('files'))
  async updateContractEvidence(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('contractId') id: string,
    @Query('type') type: EContractEvidenceType,
    @GetUser() user: string,
  ): Promise<unknown | undefined> {
    const fileDtos = files.map((file) =>
      plainToInstance(FileRequest, {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        fileBuffer: file.buffer,
      }),
    );
    return await this.contractService.updateContractEvidence(
      id,
      type,
      fileDtos,
      user,
    );
  }

  @Put('file/:contractFileId/status')
  @ApiBearerAuth()
  @Roles(ERole.CUSTOMER)
  @ApiQuery({
    name: 'status',
    type: 'enum',
    enum: [EContractStatus.ACCEPTED, EContractStatus.REJECTED],
  })
  @ApiBody({
    type: ContractRejectNote,
    required: false,
  })
  async updateStatusContractFile(
    @GetUser() user: string,
    @Param('contractFileId') contractFileId: string,
    @Body() rejectNote: ContractRejectNote,
    @Query('status') status: EContractStatus,
  ): Promise<string> {
    return await this.contractService.updateStatusContractFile(
      contractFileId,
      rejectNote,
      status,
      user,
    );
  }

  @Put('/info/:contractId')
  @Roles(ERole.MANAGER)
  async updateContractInfo(
    @Param('contractId') contractId: string,
    @Body() data: UpdateContractInfo,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.contractService.updateContractInfo(
      contractId,
      data,
      JSON.parse(user),
    );
  }
}
