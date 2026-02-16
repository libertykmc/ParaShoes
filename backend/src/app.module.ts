import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { User } from './users/user.entity'
import { Model } from './products/product.entity'
import { ProductItem } from './product-items/product-item.entity'
import { ProductCategory } from './categories/category.entity'
import { Order } from './orders/order.entity'
import { OrderItem } from './orders/order-item.entity'
import { Cart } from './cart/cart.entity'
import { Favorite } from './favorites/favorite.entity'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { ProductsModule } from './products/product.module'
import { ProductItemsModule } from './product-items/product-items.module'
import { CategoriesModule } from './categories/category.module'
import { OrdersModule } from './orders/order.module'
import { CartModule } from './cart/cart.module'
import { FavoritesModule } from './favorites/favorite.module'
import { MaterialModule } from './material/material.module'
import { SeasonModule } from './season/season.module'
import { StyleModule } from './style/style.module'
import { ProductMaterial } from './material/product-material.entity'
import { ProductStyle } from './style/product-style.entity'
import { ProductSeason } from './season/product-season.entity'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt('5432'),
      username: 'postgres',
      password: '543637',
      database: 'parashoes',
      entities: [
        User,
        Model,
        ProductItem,
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
    ProductItemsModule,
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
