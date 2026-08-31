# Bollybee Perfume E-commerce

Premium Nigerian fragrance e-commerce platform built with **Next.js**, **Supabase**, and **Paystack**.

**Repository:** https://github.com/MarithaMiracle/bollybee-perfume

## Features

- Storefront with shop, search, filters, product pages, scent notes
- Volume-based product variations (30ml / 50ml / 100ml)
- Cart with localStorage persistence
- Guest checkout with Nigerian state/LGA shipping
- Paystack payments (initialize, verify, webhook)
- Order tracking
- Admin dashboard (products, orders, payments, shipping, contacts, newsletter, analytics)
- Newsletter subscriptions
- Gift sets & sample packs
- SEO (sitemap, robots, metadata)

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, React 19, Tailwind CSS v4, shadcn/ui patterns, Framer Motion, Lucide
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments:** Paystack

## Architecture

```
Storefront + Admin → Next.js (App Router) → Supabase + Paystack
```

## Setup

### 1. Clone and install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor (in order):
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_seed.sql`
   - `supabase/migrations/003_storage.sql`
3. Copy URL and keys to `.env.local`
4. Verify setup: `npm run verify:setup`

### 3. Paystack

1. Create account at [paystack.com](https://paystack.com)
2. Add keys to `.env.local`
3. Set webhook URL: `{APP_URL}/api/payments/paystack/webhook`

### 4. Admin user

After signing up a user in Supabase Auth, set their role:

```sql
UPDATE profiles SET role = 'ADMIN' WHERE id = 'your-user-uuid';
```

### 5. Run

```bash
npm run dev
```

Visit `http://localhost:3000` (storefront) and `http://localhost:3000/admin/login` (admin).

## Environment Variables

See `.env.example` for all required variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run Vitest tests |
| `npm run verify:setup` | Check Supabase connection and migrations |

## Testing

```bash
npm test
```

Tests cover money utilities, cart validation schemas, and Paystack reference format. Paystack API is mocked — no real payments in tests.

## Security

- RLS enabled on all tables
- `requireAdmin()` on admin server operations
- Server-side cart/price/shipping validation
- Paystack webhook signature verification
- Idempotent payment fulfillment
- Secrets never exposed to client

## Brand Assets

Official assets in `public/brand/`:
- `bollybee-logo.jpeg`
- `bollybee-shopping-bag.jpeg`

Upload product photography via admin → Supabase Storage when ready.

## Deployment

Deploy to Vercel or any Node host. Configure all env vars and Paystack webhook in production.

## License

Private — Bollybee Fragrance Lab
