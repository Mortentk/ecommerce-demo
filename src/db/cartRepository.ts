import type { Cart, CartItem } from "../types";

export class CartRepository {
  private store: Map<string, Cart> = new Map();

  async findByUserId(userId: string): Promise<Cart | undefined> {
    return Array.from(this.store.values()).find((c) => c.userId === userId);
  }

  async save(cart: Cart): Promise<Cart> {
    this.store.set(cart.id, cart);
    return cart;
  }

  async addItem(userId: string, item: CartItem): Promise<Cart> {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = { id: crypto.randomUUID(), userId, items: [], updatedAt: new Date() };
    }
    const existing = cart.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    cart.updatedAt = new Date();
    return this.save(cart);
  }

  async removeItem(userId: string, productId: string): Promise<Cart | undefined> {
    const cart = await this.findByUserId(userId);
    if (!cart) return undefined;
    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updatedAt = new Date();
    return this.save(cart);
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      await this.save(cart);
    }
  }
}
