import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { DeviceEntity } from './device.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeviceService extends BaseService<DeviceEntity> {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {
    super(deviceRepository);
  }
  async insertDeviceToken(
    deviceToken: string,
    userId: string,
  ): Promise<string> {
    try {
      const checkExist = await this.deviceRepository.findOne({
        where: {
          deviceToken: deviceToken,
        },
      });
      if (!checkExist) {
        await this.deviceRepository.insert({
          deviceToken,
          user: { id: userId },
        });
      }
      return `Device token: '${deviceToken}' has been added successfully`;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteByValue(deviceToken: string, userId: string): Promise<string> {
    try {
      await this.deviceRepository.delete({
        deviceToken,
        user: { id: userId },
      });
      return `Device token: '${deviceToken}' has been delete successfully`;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getListDeviceTokens(listUserId: string[]): Promise<string[]> {
    try {
      const listDeviceTokens = await this.deviceRepository
        .createQueryBuilder('device')
        .select('device.deviceToken')
        .where('device.user IN (:...listUserId)', { listUserId })
        .getMany();
      const result = listDeviceTokens.map((device) => device.deviceToken);
      return result.flat();
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
