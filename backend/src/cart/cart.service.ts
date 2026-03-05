import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ModelSizeStock } from '../products/model-size-stock.entity'
import { Model } from '../products/product.entity'
import { Cart } from './cart.entity'
import { AddToCartDto } from './dto/add-to-cart.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Model)
    private readonly modelsRepo: Repository<Model>,
    @InjectRepository(ModelSizeStock)
    private readonly sizeStocksRepo: Repository<ModelSizeStock>,
  ) {}

  async findAll(userId: string): Promise<Cart[]> {
    return this.cartRepo.find({
      where: { userId },
      relations: ['model'],
      order: { id: 'ASC' },
    })
  }

  async findById(id: string, userId: string): Promise<Cart> {
    const cartItem = await this.cartRepo.findOne({
      where: { id, userId },
      relations: ['model'],
    })
    if (!cartItem) {
      throw new NotFoundException(`Элемент корзины с id ${id} не найден`)
    }
    return cartItem
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    const model = await this.modelsRepo.findOneBy({ id: dto.modelId })
    if (!model) {
      throw new NotFoundException(`Модель с id ${dto.modelId} не найдена`)
    }

    const sizeStock = await this.sizeStocksRepo.findOne({
      where: { modelId: dto.modelId, size: dto.size },
    })
    if (!sizeStock) {
      throw new BadRequestException(`Размер ${dto.size} для этой модели недоступен`)
    }

    const existingItem = await this.cartRepo.findOne({
      where: { userId, modelId: dto.modelId, size: dto.size },
    })

    const nextQuantity = (existingItem?.quantity || 0) + dto.quantity
    if (sizeStock.stock < nextQuantity) {
      throw new BadRequestException('Недостаточно товара на складе для выбранного размера')
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity
      return this.cartRepo.save(existingItem)
    }

    const cartItem = this.cartRepo.create({
      userId,
      modelId: dto.modelId,
      size: dto.size,
      quantity: dto.quantity,
    })
    return this.cartRepo.save(cartItem)
  }

  async updateQuantity(
    id: string,
    userId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cartItem = await this.findById(id, userId)
    const sizeStock = await this.sizeStocksRepo.findOne({
      where: { modelId: cartItem.modelId, size: cartItem.size },
    })

    if (!sizeStock) {
      throw new BadRequestException('Выбранный размер больше недоступен')
    }
    if (sizeStock.stock < dto.quantity) {
      throw new BadRequestException('Недостаточно товара на складе для выбранного размера')
    }

    cartItem.quantity = dto.quantity
    return this.cartRepo.save(cartItem)
  }

  async removeFromCart(id: string, userId: string): Promise<void> {
    const cartItem = await this.findById(id, userId)
    await this.cartRepo.remove(cartItem)
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.delete({ userId })
  }
}

