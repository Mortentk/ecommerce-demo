import type { Review } from "../services/reviewService";

export class ReviewRepository {
  private store: Map<string, Review> = new Map();

  async findById(id: string): Promise<Review | undefined> {
    return this.store.get(id);
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return Array.from(this.store.values()).filter((r) => r.productId === productId);
  }

  async findByProductAndUser(productId: string, userId: string): Promise<Review | undefined> {
    return Array.from(this.store.values()).find(
      (r) => r.productId === productId && r.userId === userId
    );
  }

  async save(review: Review): Promise<Review> {
    this.store.set(review.id, review);
    return review;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
