-- Stock/demo images stored as URLs in Supabase (replace via admin uploads later)
-- Run after 002_seed.sql
-- Photo IDs verified via Unsplash search API (images return HTTP 200)

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin manage site content" ON site_content FOR ALL USING (is_admin());

-- Hero: run `npm run db:hero` after migrations to upload public/brand/BollyBee_hero_image.png
-- (brand mauve shopping bag — matches site palette; stored in product-images/site/)

INSERT INTO site_content (key, image_url, alt_text) VALUES
  (
    'about',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200&q=80&auto=format&fit=crop',
    'Bollybee fragrance craftsmanship'
  )
ON CONFLICT (key) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  alt_text = EXCLUDED.alt_text,
  updated_at = NOW();

-- Category placeholder images (replace via admin / SQL when real photography is ready)
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'perfumes';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1615160460366-2c9a41771b51?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'eau-de-parfum';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'body-mists';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1605463967516-b73a52062ab0?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'gift-sets';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1718466044521-d38654f3ba0a?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'sample-packs';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'unisex';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1617839400561-d55457a29da2?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'mens-fragrance';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1595456578656-5b0378a9a954?w=600&q=80&auto=format&fit=crop'
WHERE slug = 'womens-fragrance';
