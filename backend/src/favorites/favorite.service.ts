import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository } from 'typeorm'
import { Favorite } from './favorite.entity'
import { Model } from '../products/product.entity'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(Model)
    private readonly productsRepo: Repository<Model>,
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
    const product = await this.productsRepo.findOneBy({ id: productId })
    if (!product) {
      throw new NotFoundException(`Товар с id ${productId} не найден`)
    }

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

    try {
      return await this.favoritesRepo.save(favorite)
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Товар уже в избранном')
      }
      throw error
    }
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
