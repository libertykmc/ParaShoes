import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './product.entity'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepo.find({ relations: ['category'] })
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category'],
    })
    if (!product) throw new NotFoundException(`Товар с id ${id} не найден`)
    return product
  }

  async create(data: Partial<Product>): Promise<Product> {
    const newProduct = this.productsRepo.create(data)
    return this.productsRepo.save(newProduct)
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.findById(id)
    Object.assign(product, data)
    return this.productsRepo.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id)
    await this.productsRepo.remove(product)
  }
}
