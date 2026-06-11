import http from "http";
import { CartRepository } from "./db/cartRepository";
import { OrderRepository } from "./db/orderRepository";
import { ProductRepository } from "./db/productRepository";
import { UserRepository } from "./db/userRepository";
import { AuthService } from "./services/authService";
import { CartService } from "./services/cartService";
import { InventoryService } from "./services/inventoryService";
import { NotificationService } from "./services/notificationService";
import { OrderService } from "./services/orderService";
import { PaymentService } from "./services/paymentService";
import { ProductService } from "./services/productService";
import { SearchService } from "./services/searchService";
import { UserService } from "./services/userService";
import { handleAuth } from "./routes/auth";
import { handleCart } from "./routes/cart";
import { handleOrders } from "./routes/orders";
import { handleProducts } from "./routes/products";

const userRepo = new UserRepository();
const productRepo = new ProductRepository();
const orderRepo = new OrderRepository();
const cartRepo = new CartRepository();

const userService = new UserService(userRepo);
const authService = new AuthService(userRepo);
const productService = new ProductService(productRepo);
const inventoryService = new InventoryService(productRepo);
const cartService = new CartService(cartRepo, productService, userService);
const paymentService = new PaymentService(orderRepo);
const orderService = new OrderService(orderRepo, cartService, paymentService, inventoryService);
const notificationService = new NotificationService(userService);
const searchService = new SearchService(productService, inventoryService);

const PORT = process.env.PORT ?? 3001;

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";
  const userId = (req.headers["x-user-id"] as string) ?? "";

  if (url.startsWith("/auth")) {
    handleAuth(req, res, authService);
  } else if (url.startsWith("/products")) {
    handleProducts(req, res, productService, searchService);
  } else if (url.startsWith("/cart")) {
    handleCart(req, res, cartService, userId);
  } else if (url.startsWith("/orders")) {
    handleOrders(req, res, orderService, userId);
  } else if (url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        services: [
          "auth", "user", "product", "inventory",
          "cart", "order", "payment", "notification", "search",
        ],
        uptime: process.uptime(),
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// suppress unused warning — notificationService is wired but event-driven
void notificationService;

server.listen(PORT, () => {
  console.log(`E-commerce API running on :${PORT}`);
  console.log("Services: Auth, User, Product, Inventory, Cart, Order, Payment, Notification, Search");
});
