import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cart } from './cart.entity'
import { CartService } from './cart.service'
import { CartController } from './cart.controller'
import { Model } from '../products/product.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Model])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
