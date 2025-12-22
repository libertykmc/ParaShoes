import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductCategory } from './category.entity'
import { CategoriesService } from './category.service'
import { CategoriesController } from './category.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}

