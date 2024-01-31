import { map } from 'rxjs/operators';
import { ContractCreateRequest } from './dto/contract.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ContractEntity } from './contracts.entity';
import { BaseService } from '../base/base.service';
import {
  DataSource,
  Repository,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import * as admin from 'firebase-admin';
import * as Docxtemplater from 'docxtemplater';
import * as PizZip from 'pizzip';
import { EventEntity } from '../event/event.entity';
import { SharedService } from 'src/shared/shared.service';
import { EEventStatus, ERole } from 'src/common/enum/enum';
import { UserService } from '../user/user.service';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { ContractPagination } from './dto/contract.pagination';
import { FileRequest } from 'src/file/dto/file.request';
import { FileService } from 'src/file/file.service';
import { ContractEvidenceEntity } from './contract_evidence.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class ContractsService extends BaseService<ContractEntity> {
  constructor(
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly sharedService: SharedService,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {
    super(contractRepository);
  }

  private generalBuilderContracts(): SelectQueryBuilder<ContractEntity> {
    return this.contractRepository.createQueryBuilder('contracts');
  }

  private async downloadTemplate(path: string): Promise<Buffer | undefined> {
    try {
      const bucket = admin.storage().bucket(); // Get the default bucket
      const file = bucket.file(path);
      // Download the file
      const data = await file.download();
      const buffer = data[0] as Buffer;
      return buffer;
    } catch (err) {
      return undefined;
    }
  }

  private async uploadFile(
    buf: Buffer,
    fileName: string,
  ): Promise<object | undefined> {
    try {
      //upload to firebase storage
      const bucket = admin.storage().bucket();
      const filePath = `contract/${fileName}`;
      const file = bucket.file(filePath);
      await file.save(buf, {
        metadata: {
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });
      const downloadUrl = await file.getSignedUrl({
        action: 'read',
        expires: '2030-01-01',
      });
      const downloadInfo = {
        downloadUrl: downloadUrl[0],
        fileSize: buf.length,
      };
      return downloadInfo;
    } catch (err) {
      return undefined;
    }
  }
  private async generateContractDocs(
    eventId: string,
    contractRequest: ContractCreateRequest,
    user: UserEntity,
  ): Promise<Buffer | undefined> {
    try {
      //get the infomation of event and user
      const queryRunner = this.dataSource.createQueryRunner();
      const event = await queryRunner.manager.findOne(EventEntity, {
        where: { id: eventId },
        relations: ['eventType'],
      });
      if (!event) {
        throw new InternalServerErrorException(
          'Event not found or deleted by admin',
        );
      }
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id: event.createdBy },
        relations: ['profile', 'role'],
      });
      if (!user) {
        throw new InternalServerErrorException(
          'User not found or deleted by admin',
        );
      }
      //download contract template
      const template = await this.downloadTemplate(
        'contract/template/Contract_Template.docx',
      );
      const zip = new PizZip(template);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      const formattedCurrency = await this.sharedService.formattedCurrency(
        parseFloat(contractRequest.contractValue),
      );
      const contractValueByName = await this.sharedService.moneyToWord(
        parseFloat(contractRequest.contractValue),
      );
      const calculateDuration = await this.sharedService.calculateDuration(
        event.startDate,
        event.endDate,
      );

      const formattedDateProcessing =
        await this.sharedService.formatDateToString(
          event.processingDate,
          'DD/MM/YYYY HH:mm:ss',
        );
      doc.render({
        companyRepresentativeName: user.profile.fullName,
        companyRepresentativeRole: user.role.roleName,
        companyRepresentativeNationalId: user.profile.nationalId,
        compannyRepresentativePhoneNumber: user.profile.phoneNumber,
        companyRepresentativeEmail: user.email,
        customerName: contractRequest.customerName,
        customerNationalId: contractRequest.customerNationalId,
        customerAddress: contractRequest.customerAddress,
        customerPhoneNumber: contractRequest.customerPhoneNumber,
        customerEmail: contractRequest.customerEmail,
        eventName: event.eventName,
        eventAddress: event.location,
        processingDate: formattedDateProcessing,
        duration: calculateDuration,
        contractValue: formattedCurrency,
        contractValueByName: contractValueByName,
        paymentMethod: contractRequest.paymentMethod,
      });
      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });
      return buf;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async generateNewContract(
    eventId: string,
    contractRequest: ContractCreateRequest,
    user: UserEntity,
  ): Promise<object | undefined> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const event = await queryRunner.manager.findOne(EventEntity, {
        where: { id: eventId },
      });
      console.log('User: ', user);
      if (event.createdBy !== user.id && user.role.toString() !== ERole.ADMIN) {
        throw new ForbiddenException('You are not allowed to do this action');
      }
      const generateCode = await this.sharedService.generateContractCode();
      const contract = await queryRunner.manager.insert(ContractEntity, {
        contractCode: generateCode,
        customerName: contractRequest.customerName,
        customerNationalId: contractRequest.customerNationalId,
        customerAddress: contractRequest.customerAddress,
        customerEmail: contractRequest.customerEmail,
        customerPhoneNumber: contractRequest.customerPhoneNumber,
        companyRepresentative: event.createdBy,
        createdBy: user.id,
        paymentMethod: contractRequest.paymentMethod,
        event: event,
      });
      if (!contract) {
        throw new InternalServerErrorException('Create contract failed');
      }
      const buf = await this.generateContractDocs(
        eventId,
        contractRequest,
        user,
      );
      if (!buf) return undefined;
      const fileName = `${generateCode}.docx`;
      const download = await this.uploadFile(buf, fileName);
      if (!download) return undefined;
      await this.contractRepository.update(
        {
          id: contract.identifiers[0].id,
        },
        {
          contractFileName: fileName,
          contractFileSize: buf.length,
          contractFileUrl: download['downloadUrl'],
        },
      );
      return download;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getContractByEventId(eventId: string): Promise<unknown | undefined> {
    try {
      const contract = await this.contractRepository.findOne({
        where: { event: { id: eventId } },
      });
      if (!contract) {
        throw new InternalServerErrorException('Contract not found');
      }
      const contractWithUserDetails = await this.userService.findByIdV2(
        contract.companyRepresentative,
      );
      if (!contractWithUserDetails) {
        throw new InternalServerErrorException(
          'Contact representative not found',
        );
      }
      const companyRepresentative = {
        id: contractWithUserDetails.id,
        fullName: contractWithUserDetails.fullName,
        email: contractWithUserDetails.email,
        phoneNumber: contractWithUserDetails.phoneNumber,
        dob: contractWithUserDetails.dob,
        avatar: contractWithUserDetails.avatar,
        status: contractWithUserDetails.status,
      };
      const newContract = { ...contract, companyRepresentative };
      return newContract;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getAllContracts(
    contractPagination: ContractPagination,
    user: UserEntity,
  ): Promise<IPaginateResponse<unknown> | undefined> {
    try {
      const { currentPage, sizePage } = contractPagination;
      const query = this.generalBuilderContracts();
      query.leftJoinAndSelect('contracts.event', 'event');
      query.select([
        'contracts.id as id',
        'contracts.contractCode as contractCode',
        'contracts.customerName as customerName',
        'contracts.customerNationalId as customerNationalId',
        'contracts.customerEmail as customerEmail',
        'contracts.customerPhoneNumber as customerPhoneNumber',
        'contracts.customerAddress as customerAddress',
        'contracts.dateOfSigning as dateOfSigning',
        'contracts.companyRepresentative as companyRepresentative',
        'contracts.contractFileName as contractFileName',
        'contracts.contractFileSize as contractFileSize',
        'contracts.contractFileUrl as contractFileUrl',
        'contracts.paymentMethod as paymentMethod',
        'contracts.createdAt as createdAt',
        'contracts.createdBy as createdBy',
        'contracts.updatedAt as updateAt',
        'contracts.updatedBy as updateBy',
        'event.id as eventId',
        'event.eventName as eventName',
        'event.startDate as startDate',
        'event.endDate as endDate',
        'event.location as location',
        'event.processingDate as processingDate',
        'event.status as status',
        'event.eventType as eventType',
        'event.createdAt as eventCreatedAt',
        'event.createdBy as eventCreatedBy',
      ]);
      if (user.role.toString() !== ERole.ADMIN) {
        query.where('contracts.companyRepresentative = :userId', {
          userId: user.id,
        });
      }
      query.orderBy('contracts.createdAt', 'DESC');
      const [result, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);

      const contractWithCompanyRepresentative = await Promise.all(
        result.map(async (contract) => {
          if (contract.companyRepresentative) {
            const userDetails = await this.userService.findByIdV2(
              contract.companyRepresentative,
            );
            const companyRepresentative = {
              id: userDetails.id,
              fullName: userDetails.fullName,
              email: userDetails.email,
              phoneNumber: userDetails.phoneNumber,
              dob: userDetails.dob,
              avatar: userDetails.avatar,
              status: userDetails.status,
            };
            return { ...contract, companyRepresentative };
          }
          return contract;
        }),
      );
      return paginateResponse<unknown>(
        [contractWithCompanyRepresentative, total],
        currentPage as number,
        sizePage as number,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateContractEvidence(
    contractId: string,
    files: FileRequest[],
    user: UserEntity,
  ): Promise<unknown | undefined> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const contract = await queryRunner.manager.findOne(ContractEntity, {
        where: { id: contractId },
        relations: ['event'],
      });
      if (!contract) {
        throw new InternalServerErrorException('Contract not found');
      }
      if (
        contract.companyRepresentative !== user.id &&
        user.role.toString() !== ERole.ADMIN
      ) {
        throw new ForbiddenException('You are not allowed to do this action');
      }
      const result = await Promise.all(
        files.map(async (file, index) => {
          const number = index + 1;
          const buf = await this.fileService.uploadFile(
            file,
            'contract/signed', //file path to upload on Firebase
            `${contract.contractCode} - ${number}`,
          );
          if (!buf) return undefined;
          const updatedEvidence = await queryRunner.manager.insert(
            ContractEvidenceEntity,
            {
              contract: contract,
              evidenceFileName: `${contract.contractCode} - ${number}`,
              evidenceFileSize: buf['fileSize'],
              evidenceFileType: buf['fileType'],
              evidenceUrl: buf['downloadUrl'],
              createdBy: user.id,
            },
          );
          return buf;
        }),
      );
      if (result.length > 0) {
        await queryRunner.manager.update(
          ContractEntity,
          {
            id: contractId,
          },
          {
            dateOfSigning: moment
              .tz('Asia/Ho_Chi_Minh')
              .format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment
              .tz('Asia/Ho_Chi_Minh')
              .format('YYYY-MM-DD HH:mm:ss'),
            updatedBy: user.id,
          },
        );
        await queryRunner.manager.update(
          EventEntity,
          {
            id: contract.event.id,
          },
          {
            updatedAt: moment
              .tz('Asia/Ho_Chi_Minh')
              .format('YYYY-MM-DD HH:mm:ss'),
            updatedBy: user.id,
            status: EEventStatus.PREPARING,
          },
        );
      }
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
