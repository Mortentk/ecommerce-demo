import { ReviewRepository } from "../db/reviewRepository";
import { ProductService } from "./productService";

export type Rating = 1 | 2 | 3 | 4 | 5;
export type SortOrder = "newest" | "oldest" | "highest" | "lowest" | "helpful";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: Rating;
  title: string;
  body: string;
  verified: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  verifiedCount: number;
  distribution: Record<Rating, number>;
}

export interface ListReviewsOptions {
  sortBy?: SortOrder;
  filterRating?: Rating;
  verifiedOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ReviewPage {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
}

function assertValidRating(rating: number): asserts rating is Rating {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5");
  }
}

const SORT_FNS: Record<SortOrder, (a: Review, b: Review) => number> = {
  newest:  (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  oldest:  (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  highest: (a, b) => b.rating - a.rating,
  lowest:  (a, b) => a.rating - b.rating,
  helpful: (a, b) => b.helpfulVotes - a.helpfulVotes,
};

export class ReviewService {
  constructor(
    private repo: ReviewRepository,
    private productService: ProductService
  ) {}

  async submitReview(
    productId: string,
    userId: string,
    rating: number,
    title: string,
    body: string,
    verified = false
  ): Promise<Review> {
    assertValidRating(rating);
    await this.productService.getProduct(productId);

    const existing = await this.repo.findByProductAndUser(productId, userId);
    if (existing) throw new Error("User has already reviewed this product");

    const now = new Date();
    const review: Review = {
      id: crypto.randomUUID(),
      productId,
      userId,
      rating,
      title: title.trim(),
      body: body.trim(),
      verified,
      helpfulVotes: 0,
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.save(review);
  }

  async updateReview(
    id: string,
    requestingUserId: string,
    updates: Partial<Pick<Review, "rating" | "title" | "body">>
  ): Promise<Review> {
    const review = await this.getReview(id);
    if (review.userId !== requestingUserId) throw new Error("Not authorized to edit this review");
    if (updates.rating !== undefined) assertValidRating(updates.rating);

    const updated: Review = {
      ...review,
      ...(updates.rating !== undefined && { rating: updates.rating as Rating }),
      ...(updates.title !== undefined && { title: updates.title.trim() }),
      ...(updates.body !== undefined && { body: updates.body.trim() }),
      updatedAt: new Date(),
    };
    return this.repo.save(updated);
  }

  async deleteReview(id: string, requestingUserId: string): Promise<void> {
    const review = await this.getReview(id);
    if (review.userId !== requestingUserId) throw new Error("Not authorized to delete this review");
    await this.repo.delete(id);
  }

  async markHelpful(id: string): Promise<Review> {
    const review = await this.getReview(id);
    return this.repo.save({ ...review, helpfulVotes: review.helpfulVotes + 1 });
  }

  async getReview(id: string): Promise<Review> {
    const review = await this.repo.findById(id);
    if (!review) throw new Error(`Review ${id} not found`);
    return review;
  }

  async listReviews(productId: string, options: ListReviewsOptions = {}): Promise<ReviewPage> {
    const { sortBy = "newest", filterRating, verifiedOnly = false, page = 1, pageSize = 10 } = options;

    let reviews = await this.repo.findByProductId(productId);
    if (filterRating !== undefined) reviews = reviews.filter((r) => r.rating === filterRating);
    if (verifiedOnly) reviews = reviews.filter((r) => r.verified);

    reviews.sort(SORT_FNS[sortBy]);

    const total = reviews.length;
    const start = (page - 1) * pageSize;
    return { reviews: reviews.slice(start, start + pageSize), total, page, pageSize };
  }

  async getSummary(productId: string): Promise<ReviewSummary> {
    const reviews = await this.repo.findByProductId(productId);
    const distribution: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    for (const r of reviews) {
      distribution[r.rating]++;
      total += r.rating;
    }
    return {
      productId,
      averageRating: reviews.length ? total / reviews.length : 0,
      totalReviews: reviews.length,
      verifiedCount: reviews.filter((r) => r.verified).length,
      distribution,
    };
  }
}
