import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, QueryFailedError, Repository } from 'typeorm'
import { CategoriesService } from '../categories/category.service'
import { CreateProductDto, ProductSizeStockDto } from './dto/create-product.dto'
import { ModelSizeStock } from './model-size-stock.entity'
import { Model } from './product.entity'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Model)
    private readonly productsRepo: Repository<Model>,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Model[]> {
    return this.productsRepo.find({
      relations: ['category', 'material', 'style', 'season', 'sizes'],
      order: { createdAt: 'DESC', sizes: { size: 'ASC' } },
    })
  }

  async findById(id: string): Promise<Model> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category', 'material', 'style', 'season', 'sizes'],
      order: { sizes: { size: 'ASC' } },
    })

    if (!product) {
      throw new NotFoundException(`Товар с id ${id} не найден`)
    }

    return product
  }

  async create(data: CreateProductDto): Promise<Model> {
    await this.validateCategory(data.categoryId)
    const normalizedSizes = this.normalizeSizes(data.sizes)

    return this.dataSource.transaction(async (manager) => {
      const modelRepo = manager.getRepository(Model)
      const sizeStockRepo = manager.getRepository(ModelSizeStock)

      const { sizes, ...modelPayload } = data
      const createdModel = await modelRepo.save(modelRepo.create(modelPayload))

      if (normalizedSizes.length > 0) {
        await sizeStockRepo.save(
          normalizedSizes.map((sizeStock) =>
            sizeStockRepo.create({
              modelId: createdModel.id,
              size: sizeStock.size,
              stock: sizeStock.stock,
            }),
          ),
        )
      }

      return modelRepo.findOneOrFail({
        where: { id: createdModel.id },
        relations: ['category', 'material', 'style', 'season', 'sizes'],
        order: { sizes: { size: 'ASC' } },
      })
    })
  }

  async update(id: string, data: Partial<CreateProductDto>): Promise<Model> {
    if (data.categoryId) {
      await this.validateCategory(data.categoryId)
    }

    const product = await this.findById(id)
    const normalizedSizes = data.sizes ? this.normalizeSizes(data.sizes) : undefined

    return this.dataSource.transaction(async (manager) => {
      const modelRepo = manager.getRepository(Model)
      const sizeStockRepo = manager.getRepository(ModelSizeStock)

      const { sizes, ...modelPayload } = data
      Object.assign(product, modelPayload)
      await modelRepo.save(product)

      if (normalizedSizes) {
        await sizeStockRepo.delete({ modelId: id })

        if (normalizedSizes.length > 0) {
          await sizeStockRepo.save(
            normalizedSizes.map((sizeStock) =>
              sizeStockRepo.create({
                modelId: id,
                size: sizeStock.size,
                stock: sizeStock.stock,
              }),
            ),
          )
        }
      }

      return modelRepo.findOneOrFail({
        where: { id },
        relations: ['category', 'material', 'style', 'season', 'sizes'],
        order: { sizes: { size: 'ASC' } },
      })
    })
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id)
    try {
      await this.productsRepo.remove(product)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Нельзя удалить товар, пока он используется в заказах, корзине или избранном',
        )
      }
      throw error
    }
  }

  private async validateCategory(categoryId?: string): Promise<void> {
    if (!categoryId) {
      return
    }

    try {
      await this.categoriesService.findById(categoryId)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `Категория с id ${categoryId} не найдена. Сначала создайте категорию.`,
        )
      }
      throw error
    }
  }

  private normalizeSizes(sizeStocks?: ProductSizeStockDto[]): ProductSizeStockDto[] {
    if (!sizeStocks || sizeStocks.length === 0) {
      return []
    }

    const normalized = sizeStocks.map((sizeStock) => ({
      size: Number(sizeStock.size),
      stock: Number(sizeStock.stock),
    }))

    const seen = new Set<number>()
    for (const sizeStock of normalized) {
      if (!Number.isInteger(sizeStock.size) || sizeStock.size < 35 || sizeStock.size > 45) {
        throw new BadRequestException(`Размер ${sizeStock.size} вне допустимого диапазона 35-45`)
      }
      if (!Number.isInteger(sizeStock.stock) || sizeStock.stock < 0) {
        throw new BadRequestException(
          `Остаток для размера ${sizeStock.size} должен быть целым неотрицательным числом`,
        )
      }
      if (seen.has(sizeStock.size)) {
        throw new BadRequestException(`Размер ${sizeStock.size} указан более одного раза`)
      }
      seen.add(sizeStock.size)
    }

    return normalized.sort((left, right) => left.size - right.size)
  }
}
