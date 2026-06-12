import { UserRepository } from "../db/userRepository";

export interface LoyaltyAccount {
  userId: string;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  createdAt: Date;
  updatedAt: Date;
}

const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 2000, platinum: 10000 };

function tierForPoints(points: number): LoyaltyAccount["tier"] {
  if (points >= TIER_THRESHOLDS.platinum) return "platinum";
  if (points >= TIER_THRESHOLDS.gold) return "gold";
  if (points >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

const accounts = new Map<string, LoyaltyAccount>();

export class LoyaltyService {
  constructor(private userRepo: UserRepository) {}

  async getAccount(userId: string): Promise<LoyaltyAccount> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    if (!accounts.has(userId)) {
      const now = new Date();
      accounts.set(userId, { userId, points: 0, tier: "bronze", createdAt: now, updatedAt: now });
    }
    return accounts.get(userId)!;
  }

  async addPoints(userId: string, points: number): Promise<LoyaltyAccount> {
    const account = await this.getAccount(userId);
    const updated: LoyaltyAccount = {
      ...account,
      points: account.points + points,
      tier: tierForPoints(account.points + points),
      updatedAt: new Date(),
    };
    accounts.set(userId, updated);
    return updated;
  }

  async redeemPoints(userId: string, points: number): Promise<LoyaltyAccount> {
    const account = await this.getAccount(userId);
    if (account.points < points) throw new Error("Insufficient loyalty points");
    const updated: LoyaltyAccount = {
      ...account,
      points: account.points - points,
      tier: tierForPoints(account.points - points),
      updatedAt: new Date(),
    };
    accounts.set(userId, updated);
    return updated;
  }

  async leaderboard(): Promise<LoyaltyAccount[]> {
    const users = await this.userRepo.findAll();
    return users
      .map((u) => accounts.get(u.id) ?? { userId: u.id, points: 0, tier: "bronze" as const, createdAt: u.createdAt, updatedAt: u.createdAt })
      .sort((a, b) => b.points - a.points);
  }
}
