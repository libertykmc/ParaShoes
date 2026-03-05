import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriesModule } from '../categories/category.module'
import { ModelSizeStock } from './model-size-stock.entity'
import { ProductsController } from './product.controller'
import { Model } from './product.entity'
import { ProductsService } from './product.service'

@Module({
  imports: [TypeOrmModule.forFeature([Model, ModelSizeStock]), CategoriesModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}

