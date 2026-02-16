import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductItem } from './product-item.entity'
import { ProductItemsService } from './product-items.service'
import { ProductItemsController } from './product-items.controller'
import { Model } from '../products/product.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ProductItem, Model])],
  providers: [ProductItemsService],
  controllers: [ProductItemsController],
  exports: [ProductItemsService],
})
export class ProductItemsModule {}
