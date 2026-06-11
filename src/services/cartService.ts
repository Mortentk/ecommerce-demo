import type { Cart, CartItem } from "../types";
import { CartRepository } from "../db/cartRepository";
import { ProductService } from "./productService";
import { UserService } from "./userService";

export class CartService {
  constructor(
    private cartRepo: CartRepository,
    private productService: ProductService,
    private userService: UserService
  ) {}

  async getCart(userId: string): Promise<Cart> {
    await this.userService.getUser(userId);
    return (
      (await this.cartRepo.findByUserId(userId)) ?? {
        id: crypto.randomUUID(),
        userId,
        items: [],
        updatedAt: new Date(),
      }
    );
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.productService.getProduct(productId);
    const item: CartItem = { productId, quantity, unitPrice: product.price };
    return this.cartRepo.addItem(userId, item);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartRepo.removeItem(userId, productId);
    if (!cart) throw new Error("Cart not found");
    return cart;
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    await this.cartRepo.removeItem(userId, productId);
    return this.addItem(userId, productId, quantity);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.clear(userId);
  }

  async getTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }
}
