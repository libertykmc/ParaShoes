import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Model } from './product.entity'
import { ProductsService } from './product.service'
import { ProductsController } from './product.controller'
import { CategoriesModule } from '../categories/category.module'

@Module({
  imports: [TypeOrmModule.forFeature([Model]), CategoriesModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
