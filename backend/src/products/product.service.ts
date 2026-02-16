import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Model } from './product.entity'
import { CategoriesService } from '../categories/category.service'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Model)
    private readonly productsRepo: Repository<Model>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(): Promise<Model[]> {
    return this.productsRepo.find({
      relations: ['category', 'material', 'style', 'season', 'products'],
    })
  }

  async findById(id: string): Promise<Model> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category', 'material', 'style', 'season', 'products'],
    })
    if (!product) throw new NotFoundException(`Товар с id ${id} не найден`)
    return product
  }

  async create(data: Partial<Model>): Promise<Model> {
    if (data.categoryId) {
      try {
        await this.categoriesService.findById(data.categoryId)
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Категория с id ${data.categoryId} не найдена. Сначала создайте категорию.`
          )
        }
        throw error
      }
    }

    const newProduct = this.productsRepo.create(data)
    return this.productsRepo.save(newProduct)
  }

  async update(id: string, data: Partial<Model>): Promise<Model> {
    if (data.categoryId) {
      try {
        await this.categoriesService.findById(data.categoryId)
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Категория с id ${data.categoryId} не найдена. Сначала создайте категорию.`
          )
        }
        throw error
      }
    }

    const product = await this.findById(id)
    Object.assign(product, data)
    return this.productsRepo.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id)
    await this.productsRepo.remove(product)
  }
}
