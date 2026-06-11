import type { AuthToken, User } from "../types";
import { UserRepository } from "../db/userRepository";

export class AuthService {
  private tokens: Map<string, AuthToken> = new Map();

  constructor(private userRepo: UserRepository) {}

  async register(email: string, name: string, password: string): Promise<User> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error("Email already registered");
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: this.hashPassword(password),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.userRepo.save(user);
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new Error("Invalid credentials");
    }
    const token: AuthToken = {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    this.tokens.set(token.token, token);
    return token;
  }

  async logout(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  async validateToken(token: string): Promise<string | null> {
    const record = this.tokens.get(token);
    if (!record || record.expiresAt < new Date()) return null;
    return record.userId;
  }

  private hashPassword(password: string): string {
    return Buffer.from(password).toString("base64");
  }

  private verifyPassword(password: string, hash: string): boolean {
    return Buffer.from(password).toString("base64") === hash;
  }
}
