import type { Order, OrderStatus } from "../types";

export class OrderRepository {
  private store: Map<string, Order> = new Map();

  async findById(id: string): Promise<Order | undefined> {
    return this.store.get(id);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.store.values()).filter((o) => o.userId === userId);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return Array.from(this.store.values()).filter((o) => o.status === status);
  }

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, order);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = this.store.get(id);
    if (!order) return undefined;
    const updated = { ...order, status, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }
}
