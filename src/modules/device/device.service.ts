import { Injectable } from '@nestjs/common';
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
        super(deviceRepository)
    }

    async updateDeviceToken(deviceToken: string): Promise<any | undefined> {
        
    }
}
