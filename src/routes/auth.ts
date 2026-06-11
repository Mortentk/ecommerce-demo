import type { IncomingMessage, ServerResponse } from "http";
import { AuthService } from "../services/authService";

export function handleAuth(req: IncomingMessage, res: ServerResponse, authService: AuthService): void {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const data = JSON.parse(body || "{}");
      if (req.url === "/auth/register" && req.method === "POST") {
        const user = await authService.register(data.email, data.name, data.password);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: user.id, email: user.email, name: user.name }));
      } else if (req.url === "/auth/login" && req.method === "POST") {
        const token = await authService.login(data.email, data.password);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(token));
      } else if (req.url === "/auth/logout" && req.method === "POST") {
        await authService.logout(data.token);
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
