import type { User } from "../types";

export class UserRepository {
  private store: Map<string, User> = new Map();

  async findById(id: string): Promise<User | undefined> {
    return this.store.get(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.store.values()).find((u) => u.email === email);
  }

  async save(user: User): Promise<User> {
    this.store.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.store.values());
  }
}
