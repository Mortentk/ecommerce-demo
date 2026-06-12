import type { IncomingMessage, ServerResponse } from "http";
import { LoyaltyService } from "../services/loyaltyService";

export function handleLoyalty(
  req: IncomingMessage,
  res: ServerResponse,
  loyaltyService: LoyaltyService,
  userId: string
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      if (url.pathname === "/loyalty" && req.method === "GET") {
        const account = await loyaltyService.getAccount(userId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(account));
      } else if (url.pathname === "/loyalty/add" && req.method === "POST") {
        const { points } = JSON.parse(body);
        const account = await loyaltyService.addPoints(userId, points);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(account));
      } else if (url.pathname === "/loyalty/redeem" && req.method === "POST") {
        const { points } = JSON.parse(body);
        const account = await loyaltyService.redeemPoints(userId, points);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(account));
      } else if (url.pathname === "/loyalty/leaderboard" && req.method === "GET") {
        const board = await loyaltyService.leaderboard();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(board));
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
