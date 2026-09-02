# Bollybee Fragrance Lab — Work Report

**Project:** Complete online store for Bollybee Fragrance Lab  
**Live site:** [bollybeefragrancelab.com](https://bollybeefragrancelab.com)  
**Prepared for:** Client review & handoff  

---

## 1. Executive summary

Bollybee Fragrance Lab now has a full online fragrance boutique — not a template site with a payment button bolted on. Customers can discover scents, buy as guests or with an account, pay securely, track delivery, and stay in touch. The business runs day-to-day operations from a private admin portal: products, stock, orders, shipping prices, discounts, reviews, messages, and newsletter subscribers.

The experience is built around soft luxury branding, mobile-first shopping, Nigerian delivery realities (state and LGA shipping), and clear communication at every step — especially after payment.

---

## 2. Admin login & access

### Where to sign in

| Item | Detail |
|------|--------|
| **Admin login URL** | [bollybeefragrancelab.com/admin/login](https://bollybeefragrancelab.com/admin/login) |
| **Storefront (public)** | [bollybeefragrancelab.com](https://bollybeefragrancelab.com) |
| **Customer account login** | [bollybeefragrancelab.com/account/login](https://bollybeefragrancelab.com/account/login) — separate from admin |

### Credentials

Admin access uses a normal account that has been **promoted to Admin** in the system. It is **not** a shared “master password” baked into the site.

| Field | Value |
|-------|--------|
| **Email** | The email used when the admin account was created (often the business Gmail, e.g. `bollybeefraglab@gmail.com` — confirm with whoever set it up) |
| **Password** | The password chosen at signup / last reset — **not stored in this document for security** |

**If you forget the password:** use **Forgot password** on the customer login flow for that same email, or request a reset from whoever manages the site — then sign in again at `/admin/login`.

**If login works but admin is blocked:** the account exists as a customer only. Someone with database access must mark that profile’s role as **ADMIN**. After that, `/admin/login` opens the full portal.

**Business alert email:** Order and low-stock alerts are sent to the configured admin inbox (commonly the same business Gmail). That address is for **notifications**, not necessarily the same as the login email — confirm both with the technical setup.

### After login

You see the admin sidebar: Dashboard, Products, Orders, Customers, Payments, Shipping, Contacts, Promo codes, Reviews, Newsletter, Analytics — plus **View storefront** and **Log out**. The floating WhatsApp button is hidden in admin so it does not get in the way.

---

## 3. Search engine & social visibility (SEO)

**Yes — SEO foundations are in place.** In plain language:

| What was added | Why it matters |
|----------------|----------------|
| **Page titles** | Browser tabs and Google results show names like “Gift Sets \| Bollybee”, product names, category names |
| **Page descriptions** | Short summaries for search results and social shares on key pages |
| **Site-wide brand title template** | Consistent “\| Bollybee” naming |
| **Sitemap** (`/sitemap.xml`) | Lists the homepage, shop, about, FAQ, contact, privacy, terms, gift sets, sample packs, track order, **each product**, and **each shop category** so search engines can find them |
| **Robots instructions** (`/robots.txt`) | Allows public pages to be indexed; keeps **/admin** and **/api** private from search crawlers |
| **Open Graph / share image** | When someone pastes the site link in WhatsApp or iMessage, a branded preview image can appear |
| **Favicon** | Bollybee bottle mark in the browser tab |
| **Product structured data** | Product pages include a machine-readable product summary (name, brand, price in naira) that search engines can use for richer listings |
| **Canonical site URL** | Built around bollybeefragrancelab.com so links and previews point at the real domain |

### SEO / marketing gaps (honest list — not yet done or outside the site build)

These are normal “next steps after launch,” not missing storefront features:

- Submitting the sitemap in **Google Search Console** and **Bing Webmaster Tools** (manual, once DNS is live)  
- Optional **Google Analytics** / Meta Pixel for ads (not required to sell)  
- Custom meta copy for every marketing page beyond titles (some pages use short titles; product/category descriptions are stronger)  
- Product share images per scent (currently the brand-wide preview image is the main social card)  
- Blog / content hub for long-term SEO (not built — fragrance catalogue is the focus)  
- BIMI / advanced email brand logo certification (separate from website SEO)  

---

## 4. What might still be missing or worth noting

| Area | Status |
|------|--------|
| Core shop, checkout, Paystack, tracking | Built |
| Admin operations suite | Built |
| Branded emails + WhatsApp float | Built |
| Privacy & Terms | Built for this domain |
| Real product photography | Depends on uploads in admin |
| Live Paystack (real money) | Switch from test to live after business verification |
| Email sending as `hello@…` | Needs domain verified with the email provider + production sender settings |
| Google Search Console | Manual registration after go-live |
| Staff training | Use this report + a live walkthrough (`DEMO.md`) |
| Contact message “status” workflow | Messages appear in admin; triage is mainly reading/searching |
| Gift set / sample pack inventory | Treated more loosely than standard bottle SKUs — keep an eye on stock manually |

---

## 5. What the website is for

Bollybee sells premium perfumes, gift sets, and sample packs online to customers across Nigeria. The site handles browsing, cart and checkout (guest or account), secure payment, order confirmation, delivery tracking, customer accounts, brand pages, contact, and WhatsApp. The admin portal runs catalogue, fulfilment, shipping prices, promos, reviews, and inbox lists.

---

## 6. Every page — full inventory

### A. Public storefront

| Page | URL | What it does |
|------|-----|----------------|
| **Home** | `/` | Hero, trust strip, featured products, categories, fragrance families, bestsellers, new arrivals, gift set teaser, about blurb, testimonials, newsletter signup |
| **Shop (all)** | `/shop` | Full catalogue; category & family filters; search; sort (newest / A–Z / Z–A); pagination; mobile filter drawer |
| **Shop by category** | `/shop/[category]` | Same shopping tools scoped to one category (e.g. women, men) with its own page title |
| **Search** | `/search` | Dedicated search results with count and pagination |
| **Product detail** | `/product/[slug]` | Photos, volumes & prices, stock, Add to Cart / Buy Now, wishlist, scent notes, description, related products, reviews |
| **Gift sets** | `/gift-sets` | Gift collections with add to cart |
| **Sample packs** | `/sample-packs` | Discovery sample sets with add to cart |
| **Cart** | `/cart` | Review items, change qty, remove, clear cart, go to checkout |
| **Checkout** | `/checkout` | Name, email, phone, Nigerian address (state/LGA), live shipping fee, promo code, Paystack payment; guests welcome; logged-in prefill optional |
| **Order confirmed** | `/order/success` | Order number, items, subtotal, shipping, discount, total paid, shipping address; track / keep shopping; pending state if payment still confirming |
| **Track order** | `/track-order` | Public lookup by order number + email; visual status timeline; no login required |
| **About** | `/about` | Brand story, mission, why Bollybee, shop CTA |
| **Contact** | `/contact` | Contact form; email, phone, Lagos; social links; FAQ / track shortcuts |
| **FAQ** | `/faq` | Ordering, payment methods, delivery, tracking, care, support |
| **Privacy** | `/privacy` | Privacy policy for this site and domain |
| **Terms** | `/terms` | Terms of sale, returns expectations, payment policy |
| **404** | any bad URL | Branded “page evaporated” with shop / home / helpful links |
| **Error** | system failure | Branded recovery: try again, home, contact |

**Always present on public pages:** sticky navigation (Shop, Gift Sets, Sample Packs, About, Contact, account, search, cart), footer (links, contact, socials, legal), floating WhatsApp button.

---

### B. Customer account pages

| Page | URL | What it does |
|------|-----|----------------|
| **Login / Register** | `/account/login` | Sign in or create account; continue as guest messaging |
| **Forgot password** | `/account/forgot-password` | Request branded reset email |
| **Reset password** | `/account/reset-password` | Set a new password from the email link |
| **Orders** | `/account/orders` | Past orders with status and track links |
| **Addresses** | `/account/addresses` | Add / delete / default shipping addresses (state & LGA) |
| **Wishlist** | `/account/wishlist` | Saved products |

Account shell: greeting, Sign out, tabs for Orders / Addresses / Wishlist.

---

### C. Admin portal pages

| Page | URL | What the admin does here |
|------|-----|---------------------------|
| **Admin login** | `/admin/login` | Sign in with an Admin-role account |
| **Dashboard** | `/admin` | Revenue snapshot, orders, products, pending payments, low stock, recent orders, shortcuts |
| **Products list** | `/admin/products` | Browse / search / filter active vs draft; open or create products |
| **New product** | `/admin/products/new` | Create a product from scratch |
| **Edit product** | `/admin/products/[id]` | Edit details, variations (size/price/SKU/stock), scent notes, images, flags (Featured / Bestseller / New / Active) |
| **Orders list** | `/admin/orders` | Search by order # or email; filter payment & fulfilment; open an order |
| **Order detail** | `/admin/orders/[id]` | Items & money breakdown (incl. shipping), customer & address, update fulfilment, admin notes, re-verify payment |
| **Customers** | `/admin/customers` | Registered users; search; role filter; order activity overview |
| **Payments** | `/admin/payments` | Payment records by reference and status; link to order |
| **Shipping** | `/admin/shipping` | Add / edit / activate / delete rates by state (and optional LGA) |
| **Contacts** | `/admin/contacts` | Messages from the contact form; search / status filter |
| **Promo codes** | `/admin/promo-codes` | Create percent or fixed discounts; limits; activate / deactivate |
| **Reviews** | `/admin/reviews` | Pending vs approved; approve or reject |
| **Newsletter** | `/admin/newsletter` | Subscriber list; search / filter |
| **Analytics** | `/admin/analytics` | Revenue, successful orders, average order value, bestsellers |

---

## 7. The customer journey (how shopping works)

### Discover

Homepage hero and trust messages lead into featured products, categories, fragrance families, bestsellers, new arrivals, gift teasers, brand story, testimonials, and newsletter signup. Shop, Gift Sets, Sample Packs, and Search cover discovery.

### Choose

Product pages: photos, volumes, stock, Add to Cart / Buy Now, wishlist (signed in), scent pyramid, related products, moderated reviews.

### Cart & checkout

Cart persists on the device. Checkout supports guests and accounts; state + LGA set shipping live; promo codes optional; Paystack completes payment. Confirmation page and email show **items + subtotal + shipping + discount + total**.

### After purchase

Track by order number + email. Status emails as fulfilment moves. WhatsApp float for questions. Contact form and Circle newsletter for ongoing relationship.

---

## 8. Brand experience & polish

Soft luxury palette and typography; filigree dividers (site + emails); trust marquee; WhatsApp float; branded 404 / error / empty states; mobile-tuned shop filters, product CTAs, and confirmation layout; social share preview; favicon; privacy & terms for this domain; honest totals including shipping.

---

## 9. Emails

| Email | When |
|-------|------|
| Welcome | New account |
| Password reset | Reset requested |
| Order confirmation | Payment succeeds (with shipping in the breakdown) |
| Order status update | Fulfilment status changes |
| Contact acknowledgement | Contact form submitted |
| Newsletter welcome | Joins the Bollybee Circle |
| Abandoned cart | Started checkout, did not pay (~1 hour later) |
| New order (business) | Paid order placed |
| Low stock (business) | Scheduled check when stock is low |

---

## 10. How to use the admin portal (day-to-day)

**Daily:** Dashboard → Orders (update statuses) → Contacts.  
**Weekly:** Stock, reviews, analytics, shipping rates, promos.  
**New scent:** Products → New → variations → notes → photos → Active → optional Featured/New → place a test order yourself.

Suggested fulfilment path: Payment confirmed → Processing → Packed → Shipped → Out for delivery → Delivered.

---

## 11. Smart behaviours

- Stock drops only after successful payment  
- Abandoned-cart reminders  
- Editable state/LGA shipping rates  
- Promo rules enforced  
- Reviews moderated before public  
- Guest order tracking  
- Shipping visible in confirmation page and email  
- WhatsApp one tap away  
- Admin & API kept out of search indexing  

---

## 12. Expertise this work demonstrates

End-to-end Nigerian retail (guest checkout, location shipping, Paystack, phone + WhatsApp); clear shopper vs operations split; honest money and stock behaviour; full customer lifecycle emails; brand consistency from homepage to email to 404; mobile care; SEO foundations (titles, sitemap, robots, share preview, product data); an admin suite non-developers can run.

---

## 13. Closing

Bollybee Fragrance Lab has a production-ready boutique: every major public and account page, a full admin portal, branded communication, WhatsApp access, and SEO groundwork. Remaining items are mostly **go-live operations** (live payments, email-from-domain, Search Console, real photography) — not missing storefront capability.

---

### Quick reference

| Need | Go here |
|------|---------|
| Sell | Storefront `/` |
| Run the business | `/admin/login` |
| Customer account | `/account/login` |
| Timed demo script | `DEMO.md` |
| This document | `WORK_REPORT.md` |

*Fill in the exact admin email/password in your private password manager — do not publish credentials in shared chats or public repos.*
