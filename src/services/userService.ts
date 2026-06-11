import type { User } from "../types";
import { UserRepository } from "../db/userRepository";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  }

  async updateProfile(id: string, updates: Partial<Pick<User, "name" | "email">>): Promise<User> {
    const user = await this.getUser(id);
    return this.userRepo.save({ ...user, ...updates, updatedAt: new Date() });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.getUser(id);
    await this.userRepo.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
