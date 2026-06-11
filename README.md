# E-commerce API Demo

Demo e-commerce backend used to test [Artifact](https://github.com) architecture tracking.

Merge PRs into this repo to watch the architecture graph evolve in real time.

## Architecture

9 services across 4 route domains:

- **Auth** — registration, login, token validation
- **User** — profile management
- **Product** — catalog, CRUD
- **Inventory** — stock levels, reservations
- **Cart** — per-user cart, item management
- **Order** — checkout flow, status transitions
- **Payment** — authorize / capture / refund
- **Notification** — email dispatch on order events
- **Search** — full-text product search with stock filtering

## Running locally

```bash
npm install
npm run dev
# API starts on :3001
```

## Suggested PRs to evolve the graph

- Add a `ReviewService` (reads ProductService + UserService)
- Add a `WishlistService` (reads ProductService)
- Add a `CouponService` (called by OrderService)
- Add a `ShippingService` (called by OrderService after payment)
- Add `src/routes/admin.ts` (calls all services)
