import type { Payment, PaymentStatus } from "../types";
import { OrderRepository } from "../db/orderRepository";

export class PaymentService {
  private payments: Map<string, Payment> = new Map();

  constructor(private orderRepo: OrderRepository) {}

  async authorize(orderId: string, amount: number, currency: string): Promise<Payment> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    const payment: Payment = {
      id: crypto.randomUUID(),
      orderId,
      amount,
      currency,
      status: "authorized",
      provider: "stripe-mock",
      providerTransactionId: `mock_${crypto.randomUUID()}`,
      createdAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async capture(paymentId: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    const updated = { ...payment, status: "captured" as PaymentStatus };
    this.payments.set(paymentId, updated);
    return updated;
  }

  async refund(paymentId: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    if (payment.status !== "captured") throw new Error("Only captured payments can be refunded");
    const updated = { ...payment, status: "refunded" as PaymentStatus };
    this.payments.set(paymentId, updated);
    return updated;
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    return payment;
  }

  async getPaymentByOrder(orderId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find((p) => p.orderId === orderId);
  }
}
