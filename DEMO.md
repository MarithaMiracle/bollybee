# Bollybee — Client Demo Walkthrough

Use this script when presenting **bollybeefragrancelab.com** to the client. Allow ~15–20 minutes.

## Before you start

- [ ] Site deployed with `NEXT_PUBLIC_APP_URL=https://bollybeefragrancelab.com`
- [ ] Paystack **test mode** keys configured (switch to live only after sign-off)
- [ ] At least 4–6 products uploaded with real photos via admin
- [ ] Admin user promoted (`role = 'ADMIN'`)
- [ ] One successful test order already placed (optional backup demo)

---

## 1. Homepage (2 min)

**URL:** `/`

- Hero: brand story, “Shop Fragrances” CTA
- Scroll: featured / bestsellers / categories / gift sets teaser
- Footer: contact email `hello@bollybeefragrancelab.com`, phone, social links
- Mention: mobile-friendly, fast product images

---

## 2. Shop & discovery (3 min)

**URL:** `/shop`

- Left sidebar filters: **Category** and **Family**
- Search bar + sort (Newest / A–Z)
- Click a product card → product detail

**URL:** `/product/[slug]`

- Product images, price variations (50ml / 100ml etc.)
- Scent notes pyramid
- Add to cart + wishlist (if signed in)
- Related reviews section

**Optional:** `/gift-sets`, `/sample-packs`, `/search?q=oud`

---

## 3. Cart & checkout (5 min)

**URL:** `/cart`

- Adjust quantity, remove item
- Proceed to checkout

**URL:** `/checkout`

- Fill delivery details (use Lagos + LGA for lowest shipping demo)
- Apply promo code if one exists (e.g. admin-created `WELCOME10`)
- Shipping fee updates by location
- Pay with Paystack test card: `4084084084084081`, CVV any, expiry any future date, PIN `0000`, OTP `123456`

**URL:** `/order/success?reference=...`

- Order confirmation + reference number

---

## 4. Order tracking & account (3 min)

**URL:** `/track-order`

- Enter order number from success page → show status timeline

**URL:** `/account/login`

- Sign in or register
- **Forgot password** flow (mention for customers)
- `/account/orders` — order history
- `/account/wishlist` — saved products
- `/account/addresses` — saved addresses

---

## 5. Admin portal (5 min)

**URL:** `/admin/login`

Sign in as admin, then tour:

| Page | What to show |
|------|----------------|
| **Dashboard** | Revenue snapshot, recent orders |
| **Products** | Add/edit product, upload images, variations |
| **Orders** | Open the demo order, update fulfillment status |
| **Shipping** | View/edit rates by state & LGA, add new rate |
| **Promo codes** | Create a discount code |
| **Reviews** | Approve or hide customer reviews |
| **Contacts** | Messages from contact form |
| **Newsletter** | Subscriber list |

---

## 6. Trust & polish (1 min)

- `/about` — brand story
- `/faq` — common questions
- `/contact` — contact form (submit live if time allows)
- `/privacy` & `/terms` — legal pages
- Share a link in WhatsApp/iMessage to show **OG preview image**
- Browser tab shows **favicon**

---

## Talking points for Q&A

| Topic | Answer |
|-------|--------|
| Payments | Paystack — cards, bank transfer, USSD (Nigeria) |
| Shipping | Nationwide; rates by state/LGA, editable in admin |
| Emails | Order confirmation, welcome, contact ack via Resend |
| Inventory | Stock deducted on successful payment |
| Security | Admin-only dashboard, Supabase RLS, webhook signature verification |
| Domain | `bollybeefragrancelab.com` |

---

## After sign-off checklist

1. Switch Paystack to **live** keys + webhook URL
2. Verify Resend domain; remove `RESEND_TEST_TO`
3. Replace any remaining demo products/images
4. Configure Supabase Auth SMTP + production redirect URLs
5. Run full live payment test with a small real amount
