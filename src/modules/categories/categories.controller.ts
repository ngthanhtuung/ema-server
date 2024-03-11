import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './categories.entity';
import { CreateCategoryRequest } from './dto/categories.request';
import { Roles } from '../../decorators/role.decorator';
import { ERole } from '../../common/enum/enum';

@Controller('categories')
@ApiTags('Category')
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('')
  @Roles(ERole.MANAGER)
  async getAllCategories(): Promise<CategoryEntity[]> {
    return this.categoriesService.getCategories();
  }

  @Post()
  @Roles(ERole.MANAGER)
  async createCategory(
    @Body() category: CreateCategoryRequest,
  ): Promise<CategoryEntity> {
    return this.categoriesService.createCategory(category);
  }
}
