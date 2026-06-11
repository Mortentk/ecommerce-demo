import type { Product } from "../types";

export class ProductRepository {
  private store: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | undefined> {
    return this.store.get(id);
  }

  async findBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.store.values()).find((p) => p.sku === sku);
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.store.values()).filter((p) => p.category === category);
  }

  async save(product: Product): Promise<Product> {
    this.store.set(product.id, product);
    return product;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }
}
