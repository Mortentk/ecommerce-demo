import { UserRepository } from "../db/userRepository";
import type { User } from "../types";

export class ProfileService {
  constructor(private userRepo: UserRepository) {}

  async getProfile(userId: string): Promise<Omit<User, "passwordHash">> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, "name" | "email">>
  ): Promise<Omit<User, "passwordHash">> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    const updated = await this.userRepo.save({
      ...user,
      ...updates,
      updatedAt: new Date(),
    });
    const { passwordHash: _, ...profile } = updated;
    return profile;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    await this.userRepo.delete(userId);
  }

  async listProfiles(): Promise<Omit<User, "passwordHash">[]> {
    const users = await this.userRepo.findAll();
    return users.map(({ passwordHash: _, ...profile }) => profile);
  }
}
