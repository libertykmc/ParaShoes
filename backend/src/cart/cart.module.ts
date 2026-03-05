import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ModelSizeStock } from '../products/model-size-stock.entity'
import { Model } from '../products/product.entity'
import { CartController } from './cart.controller'
import { Cart } from './cart.entity'
import { CartService } from './cart.service'

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Model, ModelSizeStock])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}

