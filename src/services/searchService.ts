import type { SearchResult } from "../types";
import { InventoryService } from "./inventoryService";
import { ProductService } from "./productService";

export class SearchService {
  constructor(
    private productService: ProductService,
    private inventoryService: InventoryService
  ) {}

  async search(query: string, page = 1, pageSize = 20): Promise<SearchResult> {
    const allProducts = await this.productService.listAll();
    const lower = query.toLowerCase();
    const matched = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
    const total = matched.length;
    const products = matched.slice((page - 1) * pageSize, page * pageSize);
    return { products, total, page, pageSize };
  }

  async searchInStock(query: string, page = 1, pageSize = 20): Promise<SearchResult> {
    const result = await this.search(query, page, pageSize);
    const filtered = await Promise.all(
      result.products.map(async (p) => ({
        product: p,
        available: await this.inventoryService.isAvailable(p.id, 1),
      }))
    );
    const products = filtered.filter((x) => x.available).map((x) => x.product);
    return { products, total: products.length, page, pageSize };
  }

  async getByCategory(category: string): Promise<SearchResult> {
    const products = await this.productService.listByCategory(category);
    return { products, total: products.length, page: 1, pageSize: products.length };
  }
}
