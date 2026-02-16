import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Favorite } from './favorite.entity'
import { FavoritesService } from './favorite.service'
import { FavoritesController } from './favorite.controller'
import { Model } from '../products/product.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Model])],
  providers: [FavoritesService],
  controllers: [FavoritesController],
  exports: [FavoritesService],
})
export class FavoritesModule {}
