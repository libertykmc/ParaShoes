import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductCategory } from './category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoriesRepo: Repository<ProductCategory>,
  ) { }

  async findAll(): Promise<ProductCategory[]> {
    return this.categoriesRepo.find({ relations: ['products'] })
  }

  async findById(id: string): Promise<ProductCategory> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: ['products'],
    })
    if (!category) throw new NotFoundException(`Категория с id ${id} не найдена`)
    return category
  }

  async create(dto: CreateCategoryDto): Promise<ProductCategory> {
    const category = this.categoriesRepo.create(dto)
    return this.categoriesRepo.save(category)
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<ProductCategory> {
    const category = await this.findById(id)
    Object.assign(category, dto)
    return this.categoriesRepo.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id)
    await this.categoriesRepo.remove(category)
  }
}
