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

-- Product stock images (matched by fragrance profile)
INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
SELECT p.id, v.image_url, v.alt_text, 0
FROM products p
JOIN (VALUES
  ('velvet-amber', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=2000&q=90&auto=format&fit=crop', 'Velvet Amber — warm amber perfume bottle'),
  ('golden-oud', 'https://images.unsplash.com/photo-1772191399367-91ed8d95664b?w=2000&q=90&auto=format&fit=crop', 'Golden Oud — dark woody oud fragrance'),
  ('midnight-bloom', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=2000&q=90&auto=format&fit=crop', 'Midnight Bloom — floral evening perfume'),
  ('vanilla-noir', 'https://images.unsplash.com/photo-1611146264101-358a3b387eee?w=2000&q=90&auto=format&fit=crop', 'Vanilla Noir — gourmand vanilla scent'),
  ('citrus-muse', 'https://images.unsplash.com/photo-1585218334450-afcf929da36e?w=2000&q=90&auto=format&fit=crop', 'Citrus Muse — bright citrus fragrance'),
  ('royal-musk', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=2000&q=90&auto=format&fit=crop', 'Royal Musk — clean musk perfume'),
  ('sandalwood-reserve', 'https://images.unsplash.com/photo-1725138804277-3216924a8f5c?w=2000&q=90&auto=format&fit=crop', 'Sandalwood Reserve — woody sandalwood scent'),
  ('rose-elan', 'https://images.unsplash.com/photo-1595425959632-34f2822322ce?w=2000&q=90&auto=format&fit=crop', 'Rose Élan — elegant rose perfume')
) AS v(slug, image_url, alt_text) ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
);

UPDATE product_images pi SET
  image_url = v.image_url,
  alt_text = v.alt_text
FROM products p
JOIN (VALUES
  ('velvet-amber', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=2000&q=90&auto=format&fit=crop', 'Velvet Amber — warm amber perfume bottle'),
  ('golden-oud', 'https://images.unsplash.com/photo-1772191399367-91ed8d95664b?w=2000&q=90&auto=format&fit=crop', 'Golden Oud — dark woody oud fragrance'),
  ('midnight-bloom', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=2000&q=90&auto=format&fit=crop', 'Midnight Bloom — floral evening perfume'),
  ('vanilla-noir', 'https://images.unsplash.com/photo-1611146264101-358a3b387eee?w=2000&q=90&auto=format&fit=crop', 'Vanilla Noir — gourmand vanilla scent'),
  ('citrus-muse', 'https://images.unsplash.com/photo-1585218334450-afcf929da36e?w=2000&q=90&auto=format&fit=crop', 'Citrus Muse — bright citrus fragrance'),
  ('royal-musk', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=2000&q=90&auto=format&fit=crop', 'Royal Musk — clean musk perfume'),
  ('sandalwood-reserve', 'https://images.unsplash.com/photo-1725138804277-3216924a8f5c?w=2000&q=90&auto=format&fit=crop', 'Sandalwood Reserve — woody sandalwood scent'),
  ('rose-elan', 'https://images.unsplash.com/photo-1595425959632-34f2822322ce?w=2000&q=90&auto=format&fit=crop', 'Rose Élan — elegant rose perfume')
) AS v(slug, image_url, alt_text) ON p.slug = v.slug
WHERE pi.product_id = p.id
  AND pi.image_url LIKE '%images.unsplash.com%';

UPDATE gift_sets SET image_url = 'https://images.unsplash.com/photo-1605463967516-b73a52062ab0?w=2000&q=90&auto=format&fit=crop'
WHERE slug = 'signature-trio';

UPDATE gift_sets SET image_url = 'https://images.unsplash.com/photo-1718466044521-d38654f3ba0a?w=2000&q=90&auto=format&fit=crop'
WHERE slug = 'discovery-collection';

UPDATE gift_sets SET image_url = 'https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=2000&q=90&auto=format&fit=crop'
WHERE slug = 'floral-discovery-pack';

UPDATE gift_sets SET image_url = 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=2000&q=90&auto=format&fit=crop'
WHERE slug = 'oriental-discovery-pack';

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
