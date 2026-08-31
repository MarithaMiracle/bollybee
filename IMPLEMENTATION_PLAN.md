# Bollybee Perfume — Implementation Plan

## Architecture

```
                     BOLLYBEE
                         │
                 ┌───────┴───────┐
                 │               │
            STOREFRONT         ADMIN
                 │               │
                 └───────┬───────┘
                         │
                      NEXT.JS
                   (App Router)
                         │
             ┌───────────┴───────────┐
             │                       │
          SUPABASE                PAYSTACK
             │
      ┌──────┼──────┐
      │      │      │
   Database  Auth  Storage
```

- **Frontend**: Next.js 16, TypeScript, React 19, Tailwind CSS v4, shadcn/ui patterns, Framer Motion, Lucide
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS) via Server Components, Server Actions, Route Handlers
- **Payments**: Paystack (initialize, verify, webhook)
- **No separate API server**, Prisma, MongoDB, or Flutterwave

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to auth.users (CUSTOMER/ADMIN) |
| `categories` | Product categories |
| `products` | Fragrance catalogue |
| `product_variations` | Volume-based SKUs (30ml, 50ml, 100ml) |
| `product_images` | Product/variation images (Supabase Storage URLs) |
| `scent_notes` | TOP / HEART / BASE notes per product |
| `states` | Nigerian states + FCT |
| `lgas` | Local government areas |
| `shipping_rates` | State/LGA shipping prices |
| `orders` | Customer orders (guest + authenticated) |
| `order_items` | Line item snapshots |
| `payments` | Paystack payment records |
| `contact_submissions` | Contact form messages |
| `newsletter_subscribers` | Email subscriptions |
| `gift_sets` | Curated gift bundles |
| `gift_set_items` | Products in gift sets |

## Routes

### Storefront
- `/` — Homepage
- `/shop`, `/shop/[category]` — Catalogue with filters
- `/product/[slug]` — Product detail
- `/search` — Search results
- `/cart`, `/checkout`, `/order/success`
- `/track-order`, `/about`, `/faq`, `/contact`
- `/gift-sets`, `/sample-packs`
- `/account/login`, `/account/register`, `/account/orders`

### Admin (protected)
- `/admin/login`, `/admin` — Dashboard
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/orders`, `/admin/orders/[id]`
- `/admin/customers`, `/admin/payments`, `/admin/shipping`
- `/admin/contacts`, `/admin/newsletter`, `/admin/analytics`

### API
- `POST /api/payments/paystack/initialize`
- `GET /api/payments/paystack/verify/[reference]`
- `POST /api/payments/paystack/webhook`
- `GET /api/shipping/lgas`, `GET /api/shipping/rate`

## Components

- **Layout**: Navbar, Footer, MobileNav, BrandLogo
- **Product**: ProductCard, ProductGrid, ProductGallery, ScentNotes, VariationSelector, ProductPlaceholder
- **Cart**: CartProvider, CartDrawer, CartItem, CartSummary
- **Checkout**: CheckoutForm, ShippingSelector, OrderReview
- **Admin**: AdminSidebar, DataTable, ProductForm, OrderDetail, AnalyticsCharts

## Supabase Setup

1. Create Supabase project
2. Run `supabase/migrations/001_schema.sql`
3. Run `supabase/migrations/002_seed.sql`
4. Create Storage bucket `product-images` (public read, admin write)
5. Configure Auth email/password
6. Set env vars in `.env.local`

## Authentication

- Supabase Auth for customers and admins
- `profiles.role` = `ADMIN` | `CUSTOMER`
- `requireAdmin()` server helper for all admin operations
- RLS enforces data access at database level

## Payment Architecture

```
Checkout → Server validates cart/stock/prices/shipping
        → Create pending order + payment
        → Initialize Paystack (reference: BOLLYBEE-{uuid})
        → Customer pays
        → Verify endpoint + Webhook (signature verified)
        → Update payment/order, deduct inventory (idempotent)
        → Order confirmation
```

## Shipping

- States/LGAs/rates in Supabase
- Server recalculates shipping at checkout (never trust client)
- LGA-specific rate falls back to state-level rate

## Testing

- Vitest for unit/integration tests
- Mock Paystack API in tests
- Test cart, checkout validation, payment verification, inventory, authorization

## Deployment

- Vercel (recommended) or any Node host
- Configure Paystack webhook URL: `{APP_URL}/api/payments/paystack/webhook`
- Set all environment variables in production

## Phases

| Phase | Status |
|-------|--------|
| 0 — Discovery & plan | ✅ |
| 1 — Foundation (Next.js, design system) | 🔄 |
| 2 — Supabase schema, RLS, seed | 🔄 |
| 3 — Storefront pages | Pending |
| 4 — Cart | Pending |
| 5 — Checkout & shipping | Pending |
| 6 — Paystack | Pending |
| 7 — Order tracking | Pending |
| 8 — Admin panel | Pending |
| 9 — Polish & animations | Pending |
| 10 — SEO & performance | Pending |
| 11 — Security audit | Pending |
| 12 — Testing | Pending |
