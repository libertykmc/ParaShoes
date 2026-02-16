import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { ProductItem } from './product-item.entity'
import { CreateProductItemDto } from './dto/create-product-item.dto'
import { UpdateProductItemDto } from './dto/update-product-item.dto'
import { Model } from '../products/product.entity'

@Injectable()
export class ProductItemsService {
  constructor(
    @InjectRepository(ProductItem)
    private readonly productItemsRepo: Repository<ProductItem>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<ProductItem[]> {
    return this.productItemsRepo.find({
      relations: ['model'],
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string): Promise<ProductItem> {
    const productItem = await this.productItemsRepo.findOne({
      where: { id },
      relations: ['model'],
    })

    if (!productItem) {
      throw new NotFoundException(`Товар с id ${id} не найден`)
    }

    return productItem
  }

  async create(dto: CreateProductItemDto): Promise<ProductItem> {
    return this.dataSource.transaction(async (manager) => {
      const modelRepo = manager.getRepository(Model)
      const itemRepo = manager.getRepository(ProductItem)

      const model = await modelRepo.findOneBy({ id: dto.modelId })
      if (!model) {
        throw new BadRequestException(`Модель с id ${dto.modelId} не найдена`)
      }

      model.quantityInStock += 1
      await modelRepo.save(model)

      const productItem = itemRepo.create(dto)
      return itemRepo.save(productItem)
    })
  }

  async update(id: string, dto: UpdateProductItemDto): Promise<ProductItem> {
    return this.dataSource.transaction(async (manager) => {
      const modelRepo = manager.getRepository(Model)
      const itemRepo = manager.getRepository(ProductItem)

      const productItem = await itemRepo.findOneBy({ id })
      if (!productItem) {
        throw new NotFoundException(`Товар с id ${id} не найден`)
      }

      if (dto.modelId && dto.modelId !== productItem.modelId) {
        const oldModel = await modelRepo.findOneBy({ id: productItem.modelId })
        const newModel = await modelRepo.findOneBy({ id: dto.modelId })

        if (!newModel) {
          throw new BadRequestException(`Модель с id ${dto.modelId} не найдена`)
        }

        if (oldModel) {
          oldModel.quantityInStock = Math.max(0, oldModel.quantityInStock - 1)
          await modelRepo.save(oldModel)
        }

        newModel.quantityInStock += 1
        await modelRepo.save(newModel)
      }

      Object.assign(productItem, dto)
      await itemRepo.save(productItem)

      return itemRepo.findOneOrFail({
        where: { id: productItem.id },
        relations: ['model'],
      })
    })
  }

  async remove(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const modelRepo = manager.getRepository(Model)
      const itemRepo = manager.getRepository(ProductItem)

      const productItem = await itemRepo.findOneBy({ id })
      if (!productItem) {
        throw new NotFoundException(`Товар с id ${id} не найден`)
      }

      const model = await modelRepo.findOneBy({ id: productItem.modelId })
      if (model) {
        model.quantityInStock = Math.max(0, model.quantityInStock - 1)
        await modelRepo.save(model)
      }

      await itemRepo.remove(productItem)
    })
  }
}
