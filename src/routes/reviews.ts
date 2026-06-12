import type { IncomingMessage, ServerResponse } from "http";
import { ReviewService } from "../services/reviewService";

export function handleReviews(
  req: IncomingMessage,
  res: ServerResponse,
  reviewService: ReviewService,
  userId: string
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      if (url.pathname === "/reviews" && req.method === "GET") {
        const productId = url.searchParams.get("productId") ?? "";
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
        const sortBy = (url.searchParams.get("sortBy") as "newest" | "oldest" | "highest" | "lowest" | "helpful") ?? "newest";
        const result = await reviewService.listReviews(productId, { page, pageSize, sortBy });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } else if (url.pathname === "/reviews" && req.method === "POST") {
        const { productId, rating, title, body: reviewBody, verified } = JSON.parse(body);
        const review = await reviewService.submitReview(productId, userId, rating, title, reviewBody, verified);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(review));
      } else if (url.pathname.match(/^\/reviews\/[^/]+$/) && req.method === "PATCH") {
        const id = url.pathname.split("/")[2];
        const updates = JSON.parse(body);
        const review = await reviewService.updateReview(id, userId, updates);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(review));
      } else if (url.pathname.match(/^\/reviews\/[^/]+$/) && req.method === "DELETE") {
        const id = url.pathname.split("/")[2];
        await reviewService.deleteReview(id, userId);
        res.writeHead(204);
        res.end();
      } else if (url.pathname.match(/^\/reviews\/[^/]+\/helpful$/) && req.method === "POST") {
        const id = url.pathname.split("/")[2];
        const review = await reviewService.markHelpful(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(review));
      } else if (url.pathname.match(/^\/reviews\/[^/]+\/summary$/) && req.method === "GET") {
        const productId = url.pathname.split("/")[2];
        const summary = await reviewService.getSummary(productId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(summary));
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
