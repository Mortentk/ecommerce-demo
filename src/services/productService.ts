import type { Product } from "../types";
import { ProductRepository } from "../db/productRepository";

export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getProduct(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) throw new Error(`Product ${id} not found`);
    return product;
  }

  async getProductBySku(sku: string): Promise<Product> {
    const product = await this.productRepo.findBySku(sku);
    if (!product) throw new Error(`Product with SKU ${sku} not found`);
    return product;
  }

  async createProduct(data: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const product: Product = { id: crypto.randomUUID(), ...data, createdAt: new Date() };
    return this.productRepo.save(product);
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product> {
    const product = await this.getProduct(id);
    return this.productRepo.save({ ...product, ...updates });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.getProduct(id);
    await this.productRepo.delete(id);
  }

  async listByCategory(category: string): Promise<Product[]> {
    return this.productRepo.findByCategory(category);
  }

  async listAll(): Promise<Product[]> {
    return this.productRepo.findAll();
  }
}
