import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RoleEntity } from './roles.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<RoleEntity[] | undefined> {
    try {
      const result = await this.roleRepository.find({});
      if (result) {
        return result;
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
