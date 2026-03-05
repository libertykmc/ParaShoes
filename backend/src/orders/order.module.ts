import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ModelSizeStock } from '../products/model-size-stock.entity'
import { Model } from '../products/product.entity'
import { OrderItem } from './order-item.entity'
import { OrdersController } from './order.controller'
import { Order } from './order.entity'
import { OrdersService } from './order.service'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Model, ModelSizeStock])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

