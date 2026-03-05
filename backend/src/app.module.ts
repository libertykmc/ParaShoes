import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { Cart } from './cart/cart.entity'
import { CartModule } from './cart/cart.module'
import { ProductCategory } from './categories/category.entity'
import { CategoriesModule } from './categories/category.module'
import { Favorite } from './favorites/favorite.entity'
import { FavoritesModule } from './favorites/favorite.module'
import { ProductMaterial } from './material/product-material.entity'
import { MaterialModule } from './material/material.module'
import { OrderItem } from './orders/order-item.entity'
import { Order } from './orders/order.entity'
import { OrdersModule } from './orders/order.module'
import { ModelSizeStock } from './products/model-size-stock.entity'
import { ProductsModule } from './products/product.module'
import { Model } from './products/product.entity'
import { ProductSeason } from './season/product-season.entity'
import { SeasonModule } from './season/season.module'
import { ProductStyle } from './style/product-style.entity'
import { StyleModule } from './style/style.module'
import { User } from './users/user.entity'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt('5432'),
      username: 'postgres',
      password: '543637',
      database: 'parashoes2.0',
      entities: [
        User,
        Model,
        ModelSizeStock,
        ProductCategory,
        ProductMaterial,
        ProductStyle,
        ProductSeason,
        Order,
        OrderItem,
        Cart,
        Favorite,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    FavoritesModule,
    MaterialModule,
    SeasonModule,
    StyleModule,
  ],
})
export class AppModule {}

