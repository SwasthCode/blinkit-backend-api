import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './subcategories/subcategories.module';
import { AddressesModule } from './addresses/addresses.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BannersModule } from './banners/banners.module';
import { MainCategoriesModule } from './main-categories/main-categories.module';
import { CartModule } from './cart/cart.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { OrdersModule } from './orders/orders.module';
import { Order, OrderSchema } from './schemas/order.schema';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Address, AddressSchema } from './schemas/address.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { SubCategory, SubCategorySchema } from './schemas/subcategory.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://anshu:Anshu123@testingcluster.s2vkdgu.mongodb.net/?appName=TestingCluster',
      {
        dbName: 'blinket',
      },
    ),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS_SECRET || 'base-api-secret-key',
      signOptions: { expiresIn: '1440h' },
    }),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    AuthModule,
    RolesModule,
    BannersModule,
    MainCategoriesModule,
    CategoriesModule,
    SubCategoriesModule,
    ProductsModule,
    CartModule,
    AddressesModule,
    OrdersModule,
    ReviewsModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule { }
