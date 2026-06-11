import type { IncomingMessage, ServerResponse } from "http";
import { OrderService } from "../services/orderService";

export function handleOrders(
  req: IncomingMessage,
  res: ServerResponse,
  orderService: OrderService,
  userId: string
): void {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      if (req.url === "/orders" && req.method === "GET") {
        const orders = await orderService.getUserOrders(userId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(orders));
      } else if (req.url === "/orders" && req.method === "POST") {
        const { shippingAddress } = JSON.parse(body);
        const order = await orderService.checkout(userId, shippingAddress);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(order));
      } else if (req.url?.match(/^\/orders\/[\w-]+$/) && req.method === "GET") {
        const id = req.url.split("/")[2];
        const order = await orderService.getOrder(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(order));
      } else if (req.url?.match(/^\/orders\/[\w-]+\/cancel$/) && req.method === "POST") {
        const id = req.url.split("/")[2];
        const order = await orderService.cancelOrder(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(order));
      } else {
        res.writeHead(404);
        res.end();
      }
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: (err as Error).message }));
    }
  });
}
