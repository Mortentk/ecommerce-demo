import type { Product } from "../types";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: Date;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const store = new Map<string, Review>();

export class ReviewService {
  async submitReview(
    productId: string,
    userId: string,
    rating: number,
    title: string,
    body: string,
    verified = false
  ): Promise<Review> {
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    const review: Review = {
      id: crypto.randomUUID(),
      productId,
      userId,
      rating,
      title,
      body,
      verified,
      createdAt: new Date(),
    };
    store.set(review.id, review);
    return review;
  }

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    return [...store.values()].filter((r) => r.productId === productId);
  }

  async getReview(id: string): Promise<Review> {
    const review = store.get(id);
    if (!review) throw new Error(`Review ${id} not found`);
    return review;
  }

  async deleteReview(id: string, requestingUserId: string): Promise<void> {
    const review = await this.getReview(id);
    if (review.userId !== requestingUserId) throw new Error("Not authorized to delete this review");
    store.delete(id);
  }

  async getSummary(productId: string): Promise<ReviewSummary> {
    const reviews = await this.getReviewsForProduct(productId);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    let total = 0;
    for (const r of reviews) {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
      total += r.rating;
    }
    return {
      productId,
      averageRating: reviews.length ? total / reviews.length : 0,
      totalReviews: reviews.length,
      distribution,
    };
  }
}
