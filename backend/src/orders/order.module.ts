import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './order.entity'
import { OrderItem } from './order-item.entity'
import { OrdersService } from './order.service'
import { OrdersController } from './order.controller'
import { Product } from '../products/product.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

