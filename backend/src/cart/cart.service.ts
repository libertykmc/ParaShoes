import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cart } from './cart.entity'
import { AddToCartDto } from './dto/add-to-cart.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { Model } from '../products/product.entity'

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Model)
    private readonly productsRepo: Repository<Model>,
  ) {}

  async findAll(userId: string): Promise<Cart[]> {
    return this.cartRepo.find({
      where: { userId },
      relations: ['product'],
      order: { id: 'ASC' },
    })
  }

  async findById(id: string, userId: string): Promise<Cart> {
    const cartItem = await this.cartRepo.findOne({
      where: { id, userId },
      relations: ['product'],
    })
    if (!cartItem) throw new NotFoundException(`Элемент корзины с id ${id} не найден`)
    return cartItem
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    const product = await this.productsRepo.findOneBy({ id: dto.productId })
    if (!product) {
      throw new NotFoundException(`Товар с id ${dto.productId} не найден`)
    }

    if (product.quantityInStock < dto.quantity) {
      throw new NotFoundException('Недостаточно товара на складе')
    }

    const existingItem = await this.cartRepo.findOne({
      where: { userId, productId: dto.productId },
    })

    if (existingItem) {
      existingItem.quantity += dto.quantity
      if (product.quantityInStock < existingItem.quantity) {
        throw new NotFoundException('Недостаточно товара на складе')
      }
      return this.cartRepo.save(existingItem)
    }

    const cartItem = this.cartRepo.create({
      userId,
      productId: dto.productId,
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
    const product = await this.productsRepo.findOneBy({ id: cartItem.productId })

    if (!product) {
      throw new NotFoundException('Товар не найден')
    }

    if (product.quantityInStock < dto.quantity) {
      throw new NotFoundException('Недостаточно товара на складе')
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
