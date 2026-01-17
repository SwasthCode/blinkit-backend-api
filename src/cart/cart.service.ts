import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ user_id: userId })
      .populate('items.product_id');

    if (!cart) {
      cart = await this.cartModel.create({ user_id: userId, items: [] });
    }
    return cart;
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ user_id: userId });

    if (!cart) {
      cart = new this.cartModel({ user_id: userId, items: [] });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === addToCartDto.product_id,
    );

    if (productIndex > -1) {
      // Product exists, update quantity
      cart.items[productIndex].quantity += addToCartDto.quantity;
    } else {
      // New product
      cart.items.push({
        product_id: new Types.ObjectId(addToCartDto.product_id),
        quantity: addToCartDto.quantity,
      });
    }

    await cart.save();
    return this.getCart(userId); // Return populated cart
  }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<CartDocument> {
    await this.cartModel.updateOne(
      { user_id: userId },
      { $pull: { items: { product_id: new Types.ObjectId(productId) } } },
    );
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.updateOne({ user_id: userId }, { items: [] });
  }
}
