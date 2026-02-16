import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './order.entity'
import { OrderItem } from './order-item.entity'
import { OrdersService } from './order.service'
import { OrdersController } from './order.controller'
import { Model } from '../products/product.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Model])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
