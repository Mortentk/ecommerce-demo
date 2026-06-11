import type { IncomingMessage, ServerResponse } from "http";
import { ProductService } from "../services/productService";
import { SearchService } from "../services/searchService";

export function handleProducts(
  req: IncomingMessage,
  res: ServerResponse,
  productService: ProductService,
  searchService: SearchService
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      if (url.pathname === "/products" && req.method === "GET") {
        const query = url.searchParams.get("q");
        const result = query
          ? await searchService.search(query)
          : { products: await productService.listAll(), total: 0, page: 1, pageSize: 100 };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } else if (url.pathname.startsWith("/products/") && req.method === "GET") {
        const id = url.pathname.split("/")[2];
        const product = await productService.getProduct(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(product));
      } else if (url.pathname === "/products" && req.method === "POST") {
        const product = await productService.createProduct(JSON.parse(body));
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(product));
      } else if (url.pathname.startsWith("/products/") && req.method === "DELETE") {
        const id = url.pathname.split("/")[2];
        await productService.deleteProduct(id);
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
