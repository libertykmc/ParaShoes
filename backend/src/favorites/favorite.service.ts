import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Favorite } from './favorite.entity'
import { Product } from '../products/product.entity'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async findAll(userId: string): Promise<Favorite[]> {
    return this.favoritesRepo.find({
      where: { userId },
      relations: ['product'],
      order: { id: 'DESC' },
    })
  }

  async findById(id: string, userId: string): Promise<Favorite> {
    const favorite = await this.favoritesRepo.findOne({
      where: { id, userId },
      relations: ['product'],
    })
    if (!favorite) throw new NotFoundException(`Избранное с id ${id} не найдено`)
    return favorite
  }

  async addToFavorites(userId: string, productId: string): Promise<Favorite> {
    // Проверяем наличие товара
    const product = await this.productsRepo.findOneBy({ id: productId })
    if (!product) {
      throw new NotFoundException(`Товар с id ${productId} не найден`)
    }

    // Проверяем, не добавлен ли уже товар в избранное
    const existing = await this.favoritesRepo.findOne({
      where: { userId, productId },
    })

    if (existing) {
      throw new ConflictException('Товар уже в избранном')
    }

    const favorite = this.favoritesRepo.create({
      userId,
      productId,
    })
    return this.favoritesRepo.save(favorite)
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    const favorite = await this.favoritesRepo.findOne({
      where: { userId, productId },
    })
    if (!favorite) {
      throw new NotFoundException('Товар не найден в избранном')
    }
    await this.favoritesRepo.remove(favorite)
  }

  async checkIfFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await this.favoritesRepo.findOne({
      where: { userId, productId },
    })
    return !!favorite
  }
}

