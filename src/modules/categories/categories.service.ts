import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CategoryEntity } from './categories.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../base/base.service';
import { EventEntity } from '../event/event.entity';
import { CreateCategoryRequest } from './dto/categories.request';
import { popResultSelector } from 'rxjs/internal/util/args';

@Injectable()
export class CategoriesService extends BaseService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(categoriesRepository);
  }

  generalBuilderEvent(): SelectQueryBuilder<CategoryEntity> {
    return this.categoriesRepository.createQueryBuilder('category');
  }

  async getCategories(): Promise<CategoryEntity[]> {
    try {
      const result = await this.categoriesRepository.find({});
      if (result.length > 0) {
        return result;
      }
      throw new NotFoundException('Categories is empty');
    } catch (err) {
      throw new InternalServerErrorException(err.messages);
    }
  }

  async createCategory(data: CreateCategoryRequest): Promise<CategoryEntity> {
    try {
      const result = await this.categoriesRepository.save(data);
      if (result) {
        return result;
      }
      throw new BadRequestException('Categories is not created');
    } catch (err) {
      throw new InternalServerErrorException(err.messages);
    }
  }
}
