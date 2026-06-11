import type { InventoryItem } from "../types";
import { ProductRepository } from "../db/productRepository";

export class InventoryService {
  private inventory: Map<string, InventoryItem> = new Map();

  constructor(private productRepo: ProductRepository) {}

  async getStock(productId: string): Promise<InventoryItem> {
    await this.productRepo.findById(productId);
    return (
      this.inventory.get(productId) ?? {
        productId,
        quantity: 0,
        reserved: 0,
        warehouseLocation: "UNKNOWN",
      }
    );
  }

  async setStock(productId: string, quantity: number, warehouseLocation: string): Promise<InventoryItem> {
    const item: InventoryItem = { productId, quantity, reserved: 0, warehouseLocation };
    this.inventory.set(productId, item);
    return item;
  }

  async reserve(productId: string, quantity: number): Promise<boolean> {
    const item = await this.getStock(productId);
    if (item.quantity - item.reserved < quantity) return false;
    this.inventory.set(productId, { ...item, reserved: item.reserved + quantity });
    return true;
  }

  async release(productId: string, quantity: number): Promise<void> {
    const item = await this.getStock(productId);
    this.inventory.set(productId, { ...item, reserved: Math.max(0, item.reserved - quantity) });
  }

  async deduct(productId: string, quantity: number): Promise<void> {
    const item = await this.getStock(productId);
    this.inventory.set(productId, {
      ...item,
      quantity: item.quantity - quantity,
      reserved: Math.max(0, item.reserved - quantity),
    });
  }

  async isAvailable(productId: string, quantity: number): Promise<boolean> {
    const item = await this.getStock(productId);
    return item.quantity - item.reserved >= quantity;
  }
}
