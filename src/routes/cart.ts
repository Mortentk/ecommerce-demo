import type { IncomingMessage, ServerResponse } from "http";
import { CartService } from "../services/cartService";

export function handleCart(
  req: IncomingMessage,
  res: ServerResponse,
  cartService: CartService,
  userId: string
): void {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      if (req.url === "/cart" && req.method === "GET") {
        const cart = await cartService.getCart(userId);
        const total = await cartService.getTotal(userId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ...cart, total }));
      } else if (req.url === "/cart/items" && req.method === "POST") {
        const { productId, quantity } = JSON.parse(body);
        const cart = await cartService.addItem(userId, productId, quantity);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(cart));
      } else if (req.url?.startsWith("/cart/items/") && req.method === "DELETE") {
        const productId = req.url.split("/")[3];
        const cart = await cartService.removeItem(userId, productId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(cart));
      } else if (req.url === "/cart" && req.method === "DELETE") {
        await cartService.clearCart(userId);
        res.writeHead(204);
        res.end();
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
