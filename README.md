# Bollybee Perfume E-commerce

Premium Nigerian fragrance e-commerce platform built with **Next.js**, **Supabase**, and **Paystack**.

**Live site:** https://bollybee.vercel.app/  
**Repository:** https://github.com/MarithaMiracle/bollybee

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
   - `supabase/migrations/004_stock_images.sql`
3. Copy URL and keys to `.env.local`
4. Verify setup: `npm run verify:setup`
5. Apply demo stock images: `npm run db:stock-images`

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
| `npm run db:stock-images` | Load demo product/hero image URLs into Supabase |

## Product images

**You do not need Cloudinary.** Admin product uploads go to **Supabase Storage** (`product-images` bucket) via the admin product edit page. URLs are saved in the `product_images` table.

Demo stock photos use Unsplash URLs stored in Supabase for preview purposes. Replace them by uploading real photos in admin — uploads overwrite/add new rows in `product_images`.

Cloudinary is only worth adding later if you need advanced on-the-fly transforms (auto-crop, face detection, etc.). Supabase Storage is sufficient for Bollybee.

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
- `bollybee-logo.jpeg` — full logo with wordmark
- `bollybee-mark.png` — transparent perfume bottle mark (used in nav/footer)
- `bollybee-shopping-bag.jpeg`

Upload product photography via admin → Supabase Storage when ready.

## Deployment

**Production:** [bollybee.vercel.app](https://bollybee.vercel.app/) (Vercel)

In Vercel → Project → Settings → Environment Variables, set:

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_APP_URL` | `https://bollybee.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (`sk_test_...` or `sk_live_...`) — also used to verify webhooks |
| `PAYSTACK_WEBHOOK_SECRET` | Optional — leave empty; Paystack has no separate webhook secret |

Also configure:

- **Paystack webhook URL:** `https://bollybee.vercel.app/api/payments/paystack/webhook`
- **Supabase Auth redirect URLs:** add `https://bollybee.vercel.app/**` under Authentication → URL configuration

### Supabase Auth emails vs Bollybee (Resend) emails

These are **two separate email systems**:

| System | Sends | Default limit |
|--------|--------|----------------|
| **Supabase Auth** (built-in SMTP) | Signup confirmation, password reset, magic links | **2 emails/hour** per project |
| **Bollybee app** (Resend API) | Welcome, order confirm, newsletter, contact ack, etc. | Resend free tier (100/day) |

If signup shows **"Email rate limit exceeded"**, that is **Supabase Auth**, not Resend — even after 1–2 test signups.

**Fix (recommended):** Connect Resend as Supabase custom SMTP:

1. [Supabase → Authentication → SMTP](https://supabase.com/dashboard/project/ngmpilqvgkwebjrqsogq/auth/smtp)
2. Enable custom SMTP
3. Host: `smtp.resend.com` · Port: `465` · User: `resend` · Password: your `RESEND_API_KEY`
4. Sender: `Bollybee <onboarding@resend.dev>` (test) or your verified domain later
5. After saving, raise **Authentication → Rate limits → Email sent** (e.g. 30/hour)

**Quick dev workaround:** Authentication → Providers → Email → turn off **Confirm email** so signup does not trigger Supabase emails (Bollybee’s Resend welcome still sends).

`NEXT_PUBLIC_APP_URL` drives SEO metadata, sitemap, robots.txt, and Paystack checkout callbacks — set it in Vercel for production builds.

## License

Private — Bollybee Fragrance Lab
