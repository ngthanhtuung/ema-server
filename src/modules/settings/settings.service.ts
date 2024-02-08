import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SettingEntity } from './settings.entity';
import { SettingRequestDto } from './dto/settings.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EGroupSetting } from 'src/common/enum/enum';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {}

  async createNewSetting(
    group: EGroupSetting,
    settingRequest: SettingRequestDto,
  ): Promise<string | undefined> {
    try {
      const payload = {
        ...settingRequest,
        group,
      };
      await this.settingRepository.save(payload);
      return 'Success';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSettingByCode(code: string): Promise<SettingEntity | undefined> {
    try {
      const result = await this.settingRepository.findOne({
        where: { code },
      });
      console.log('Result: ', result);
      const valueParse = JSON.parse(result.value);
      console.log('JSON parse: ', valueParse);
      if (result) {
        return {
          id: result.id,
          code: result.code,
          name: result.name,
          group: result.group,
          value: result.value,
        };
      }
      throw new NotFoundException(`Setting ${code} not found`);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
