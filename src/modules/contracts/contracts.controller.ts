import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags, ApiBody } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GetUser } from 'src/decorators/getUser.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import { ContractCreateRequest } from './dto/contract.dto';
import { IPaginateResponse } from '../base/filter.pagination';
import { ContractPagination } from './dto/contract.pagination';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { FileRequest } from 'src/file/dto/file.request';
import { ContractEvidenceEntity } from './contract_evidence.entity';

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
    @GetUser() user: string,
  ): Promise<IPaginateResponse<unknown>> {
    return await this.contractService.getAllContracts(
      contractPagination,
      JSON.parse(user),
    );
  }

  @Get('/:eventId')
  @Roles(ERole.MANAGER, ERole.ADMIN)
  async getContractByEventId(
    @Param('eventId') id: string,
  ): Promise<unknown | undefined> {
    return await this.contractService.getContractByEventId(id);
  }

  // @Post('/:eventId/new')
  // @Roles(ERole.MANAGER)
  // async createContract(
  //   @Param('eventId') id: string,
  //   @Body() contractRequest: ContractCreateRequest,
  //   @GetUser() user: string,
  // ): Promise<object | undefined> {
  //   return await this.contractService.generateNewContract(
  //     id,
  //     contractRequest,
  //     JSON.parse(user),
  //   );
  // }

  @Get('/:contractId/evidence')
  @Roles(ERole.MANAGER, ERole.ADMIN)
  async getEvidenceByContractId(
    @Param('contractId') contractId: string,
  ): Promise<ContractEvidenceEntity[]> {
    return await this.contractService.getEvidenceByContractId(contractId);
  }

  @Post('/:contractId/evidence')
  @ApiConsumes('multipart/form-data')
  @Roles(ERole.MANAGER, ERole.ADMIN)
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
  @UseInterceptors(FilesInterceptor('files'))
  async updateContractEvidence(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('contractId') id: string,
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
      fileDtos,
      JSON.parse(user),
    );
  }
}
