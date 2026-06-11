import { UserService } from "./userService";

export type NotificationChannel = "email" | "sms" | "push";

export interface Notification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  sentAt: Date;
}

export class NotificationService {
  private log: Notification[] = [];

  constructor(private userService: UserService) {}

  async sendOrderConfirmation(userId: string, orderId: string): Promise<void> {
    await this.send(userId, "email", "Order Confirmed", `Your order ${orderId} has been confirmed.`);
  }

  async sendShipmentUpdate(userId: string, orderId: string, trackingId: string): Promise<void> {
    await this.send(userId, "email", "Order Shipped", `Order ${orderId} shipped. Tracking: ${trackingId}`);
  }

  async sendPaymentFailed(userId: string, orderId: string): Promise<void> {
    await this.send(userId, "email", "Payment Failed", `Payment for order ${orderId} failed. Please retry.`);
  }

  async sendPasswordReset(userId: string, resetToken: string): Promise<void> {
    await this.send(userId, "email", "Password Reset", `Your reset token: ${resetToken}`);
  }

  getLog(): Notification[] {
    return [...this.log];
  }

  private async send(userId: string, channel: NotificationChannel, subject: string, body: string): Promise<void> {
    await this.userService.getUser(userId);
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      channel,
      subject,
      body,
      sentAt: new Date(),
    };
    this.log.push(notification);
    console.log(`[Notification] ${channel.toUpperCase()} → ${userId}: ${subject}`);
  }
}
