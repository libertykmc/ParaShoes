import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { ProductCategory } from './categories/category.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { Cart } from './cart/cart.entity';
import { Favorite } from './favorites/favorite.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/product.module';
import { CategoriesModule } from './categories/category.module';
import { OrdersModule } from './orders/order.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorite.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt('5432'),
      username:  'postgres',
      password: '1',
      database: 'parashoes',
      entities: [
        User,
        Product,
        ProductCategory,
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
  ],
})
export class AppModule {}
