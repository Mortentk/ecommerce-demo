import type { Address, Order } from "../types";
import { OrderRepository } from "../db/orderRepository";
import { CartService } from "./cartService";
import { InventoryService } from "./inventoryService";
import { PaymentService } from "./paymentService";

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private cartService: CartService,
    private paymentService: PaymentService,
    private inventoryService: InventoryService
  ) {}

  async checkout(userId: string, shippingAddress: Address): Promise<Order> {
    const cart = await this.cartService.getCart(userId);
    if (cart.items.length === 0) throw new Error("Cart is empty");

    for (const item of cart.items) {
      const available = await this.inventoryService.isAvailable(item.productId, item.quantity);
      if (!available) throw new Error(`Product ${item.productId} is out of stock`);
    }

    const total = await this.cartService.getTotal(userId);
    const order: Order = {
      id: crypto.randomUUID(),
      userId,
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      total,
      status: "pending",
      shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.orderRepo.save(order);

    const payment = await this.paymentService.authorize(order.id, total, "USD");
    await this.paymentService.capture(payment.id);

    for (const item of cart.items) {
      await this.inventoryService.deduct(item.productId, item.quantity);
    }

    await this.cartService.clearCart(userId);
    return (await this.orderRepo.updateStatus(order.id, "confirmed")) as Order;
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error(`Order ${id} not found`);
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.findByUserId(userId);
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    if (!["pending", "confirmed"].includes(order.status)) {
      throw new Error(`Cannot cancel order in status ${order.status}`);
    }
    const payment = await this.paymentService.getPaymentByOrder(id);
    if (payment?.status === "captured") {
      await this.paymentService.refund(payment.id);
    }
    for (const item of order.items) {
      await this.inventoryService.release(item.productId, item.quantity);
    }
    return (await this.orderRepo.updateStatus(id, "cancelled")) as Order;
  }

  async shipOrder(id: string): Promise<Order> {
    return (await this.orderRepo.updateStatus(id, "shipped")) as Order;
  }
}
