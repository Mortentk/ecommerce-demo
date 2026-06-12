import type { IncomingMessage, ServerResponse } from "http";
import { ProfileService } from "../services/profileService";

export function handleProfile(
  req: IncomingMessage,
  res: ServerResponse,
  profileService: ProfileService,
  userId: string
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      if (url.pathname === "/profile/all" && req.method === "GET") {
        const profiles = await profileService.listProfiles();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(profiles));
      } else if (url.pathname === "/profile" && req.method === "GET") {
        const profile = await profileService.getProfile(userId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(profile));
      } else if (url.pathname === "/profile" && req.method === "PATCH") {
        const updates = JSON.parse(body);
        const profile = await profileService.updateProfile(userId, updates);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(profile));
      } else if (url.pathname === "/profile" && req.method === "DELETE") {
        await profileService.deleteAccount(userId);
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
