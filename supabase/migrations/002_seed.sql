-- Bollybee Seed Data (Development)
-- ⚠️  RUN FIRST: supabase/migrations/001_schema.sql
-- Products are demo/seed content — upload real photography via admin

-- Categories
INSERT INTO categories (name, slug, description, active) VALUES
  ('Perfumes', 'perfumes', 'Signature Bollybee fragrances', TRUE),
  ('Eau de Parfum', 'eau-de-parfum', 'Long-lasting eau de parfum', TRUE),
  ('Body Mists', 'body-mists', 'Light, refreshing body mists', TRUE),
  ('Gift Sets', 'gift-sets', 'Curated fragrance gift collections', TRUE),
  ('Sample Packs', 'sample-packs', 'Discovery sets to find your signature scent', TRUE),
  ('Unisex', 'unisex', 'Fragrances for everyone', TRUE),
  ('Men''s Fragrance', 'mens-fragrance', 'Bold scents for him', TRUE),
  ('Women''s Fragrance', 'womens-fragrance', 'Elegant scents for her', TRUE);

-- Nigerian States (36 + FCT)
INSERT INTO states (name, code) VALUES
  ('Abia', 'AB'), ('Adamawa', 'AD'), ('Akwa Ibom', 'AK'), ('Anambra', 'AN'),
  ('Bauchi', 'BA'), ('Bayelsa', 'BY'), ('Benue', 'BE'), ('Borno', 'BO'),
  ('Cross River', 'CR'), ('Delta', 'DE'), ('Ebonyi', 'EB'), ('Edo', 'ED'),
  ('Ekiti', 'EK'), ('Enugu', 'EN'), ('FCT Abuja', 'FC'), ('Gombe', 'GO'),
  ('Imo', 'IM'), ('Jigawa', 'JI'), ('Kaduna', 'KD'), ('Kano', 'KN'),
  ('Katsina', 'KT'), ('Kebbi', 'KE'), ('Kogi', 'KO'), ('Kwara', 'KW'),
  ('Lagos', 'LA'), ('Nasarawa', 'NA'), ('Niger', 'NI'), ('Ogun', 'OG'),
  ('Ondo', 'ON'), ('Osun', 'OS'), ('Oyo', 'OY'), ('Plateau', 'PL'),
  ('Rivers', 'RI'), ('Sokoto', 'SO'), ('Taraba', 'TA'), ('Yobe', 'YO'),
  ('Zamfara', 'ZA');

-- LGAs for Lagos, FCT, Rivers (sample — expand via admin)
INSERT INTO lgas (state_id, name)
SELECT s.id, lga.name FROM states s
CROSS JOIN (VALUES
  ('Lagos', 'Ikeja'), ('Lagos', 'Lekki'), ('Lagos', 'Surulere'),
  ('Lagos', 'Yaba'), ('Lagos', 'Victoria Island'), ('Lagos', 'Ajah'),
  ('FCT Abuja', 'Garki'), ('FCT Abuja', 'Wuse'), ('FCT Abuja', 'Maitama'),
  ('FCT Abuja', 'Gwarinpa'), ('Rivers', 'Port Harcourt'), ('Rivers', 'Obio-Akpor')
) AS lga(state_name, name)
WHERE s.name = lga.state_name;

-- Default shipping rates (NGN kobo — stored as naira integers per spec)
INSERT INTO shipping_rates (state_id, lga_id, price, active)
SELECT s.id, NULL,
  CASE
    WHEN s.code = 'LA' THEN 2500
    WHEN s.code = 'FC' THEN 3000
    WHEN s.code IN ('RI', 'OG', 'OY', 'ON', 'OS', 'EK', 'ED', 'DE') THEN 3500
    ELSE 4500
  END,
  TRUE
FROM states s;

-- LGA-specific rates for Lagos
INSERT INTO shipping_rates (state_id, lga_id, price, active)
SELECT s.id, l.id, 2000, TRUE
FROM states s JOIN lgas l ON l.state_id = s.id
WHERE s.code = 'LA' AND l.name IN ('Lekki', 'Victoria Island', 'Ajah');

-- Demo Products
DO $$
DECLARE
  cat_edp UUID;
  cat_unisex UUID;
  cat_women UUID;
  cat_men UUID;
  p_id UUID;
BEGIN
  SELECT id INTO cat_edp FROM categories WHERE slug = 'eau-de-parfum';
  SELECT id INTO cat_unisex FROM categories WHERE slug = 'unisex';
  SELECT id INTO cat_women FROM categories WHERE slug = 'womens-fragrance';
  SELECT id INTO cat_men FROM categories WHERE slug = 'mens-fragrance';

  -- Velvet Amber
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, featured, is_bestseller, is_new, active)
  VALUES ('Velvet Amber', 'velvet-amber',
    'A warm embrace of golden amber and soft vanilla. Velvet Amber wraps you in sophistication — perfect for evening wear and intimate moments.',
    'Warm amber and vanilla luxury',
    cat_edp, 'ORIENTAL', 'UNISEX', TRUE, TRUE, FALSE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, compare_at_price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 18500, 22000, 'BB-VA-30', 50),
    (p_id, '50ml', 50, 28500, 32000, 'BB-VA-50', 40),
    (p_id, '100ml', 100, 45000, 52000, 'BB-VA-100', 25);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Bergamot', 1), (p_id, 'TOP', 'Pink Pepper', 2),
    (p_id, 'HEART', 'Rose', 1), (p_id, 'HEART', 'Jasmine', 2),
    (p_id, 'BASE', 'Amber', 1), (p_id, 'BASE', 'Vanilla', 2), (p_id, 'BASE', 'Musk', 3);

  -- Golden Oud
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, featured, is_bestseller, active)
  VALUES ('Golden Oud', 'golden-oud',
    'Precious oud meets golden saffron in this opulent composition. A statement fragrance for those who command attention.',
    'Opulent oud and saffron',
    cat_men, 'WOODY', 'MEN', TRUE, TRUE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, compare_at_price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 22000, NULL, 'BB-GO-30', 35),
    (p_id, '50ml', 50, 35000, 40000, 'BB-GO-50', 30),
    (p_id, '100ml', 100, 55000, NULL, 'BB-GO-100', 15);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Saffron', 1), (p_id, 'TOP', 'Cardamom', 2),
    (p_id, 'HEART', 'Oud', 1), (p_id, 'HEART', 'Rose', 2),
    (p_id, 'BASE', 'Sandalwood', 1), (p_id, 'BASE', 'Amber', 2);

  -- Midnight Bloom
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, featured, is_new, active)
  VALUES ('Midnight Bloom', 'midnight-bloom',
    'Dark florals unfold under moonlight. Tuberose and jasmine create an intoxicating nocturnal bouquet.',
    'Nocturnal floral elegance',
    cat_women, 'FLORAL', 'WOMEN', TRUE, TRUE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 17500, 'BB-MB-30', 45),
    (p_id, '50ml', 50, 27000, 'BB-MB-50', 38),
    (p_id, '100ml', 100, 42000, 'BB-MB-100', 20);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Blackcurrant', 1), (p_id, 'HEART', 'Tuberose', 1), (p_id, 'HEART', 'Jasmine', 2),
    (p_id, 'BASE', 'Patchouli', 1), (p_id, 'BASE', 'Vanilla', 2);

  -- Vanilla Noir
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, is_bestseller, active)
  VALUES ('Vanilla Noir', 'vanilla-noir',
    'Deep, smoky vanilla with a gourmand twist. Comforting yet mysterious.',
    'Smoky gourmand vanilla',
    cat_unisex, 'GOURMAND', 'UNISEX', TRUE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 16000, 'BB-VN-30', 55),
    (p_id, '50ml', 50, 25000, 'BB-VN-50', 42),
    (p_id, '100ml', 100, 39000, 'BB-VN-100', 28);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Caramel', 1), (p_id, 'HEART', 'Tonka Bean', 1),
    (p_id, 'BASE', 'Vanilla', 1), (p_id, 'BASE', 'Sandalwood', 2);

  -- Citrus Muse
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, is_new, active)
  VALUES ('Citrus Muse', 'citrus-muse',
    'Bright, uplifting citrus with a Mediterranean soul. Your daily dose of sunshine.',
    'Bright Mediterranean citrus',
    cat_unisex, 'CITRUS', 'UNISEX', TRUE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 15000, 'BB-CM-30', 60),
    (p_id, '50ml', 50, 23000, 'BB-CM-50', 50),
    (p_id, '100ml', 100, 36000, 'BB-CM-100', 30);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Lemon', 1), (p_id, 'TOP', 'Bergamot', 2), (p_id, 'TOP', 'Grapefruit', 3),
    (p_id, 'HEART', 'Neroli', 1), (p_id, 'BASE', 'White Musk', 1);

  -- Royal Musk
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, active)
  VALUES ('Royal Musk', 'royal-musk',
    'Clean, skin-like musk with regal depth. Effortlessly elegant for any occasion.',
    'Clean skin-like musk',
    cat_unisex, 'MUSKY', 'UNISEX', TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 17000, 'BB-RM-30', 48),
    (p_id, '50ml', 50, 26000, 'BB-RM-50', 36),
    (p_id, '100ml', 100, 40000, 'BB-RM-100', 22);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Aldehydes', 1), (p_id, 'HEART', 'Iris', 1),
    (p_id, 'BASE', 'Musk', 1), (p_id, 'BASE', 'Cashmere Wood', 2);

  -- Sandalwood Reserve
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, featured, active)
  VALUES ('Sandalwood Reserve', 'sandalwood-reserve',
    'Aged sandalwood at its finest. Creamy, warm, and impossibly smooth.',
    'Creamy aged sandalwood',
    cat_men, 'WOODY', 'MEN', TRUE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 19500, 'BB-SR-30', 40),
    (p_id, '50ml', 50, 30000, 'BB-SR-50', 32),
    (p_id, '100ml', 100, 47000, 'BB-SR-100', 18);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Violet Leaf', 1), (p_id, 'HEART', 'Cedar', 1),
    (p_id, 'BASE', 'Sandalwood', 1), (p_id, 'BASE', 'Vetiver', 2);

  -- Rose Élan
  INSERT INTO products (name, slug, description, short_description, category_id, fragrance_family, gender, is_bestseller, active)
  VALUES ('Rose Élan', 'rose-elan',
    'Modern rose reimagined. Fresh petals meet soft powder in timeless femininity.',
    'Modern powdery rose',
    cat_women, 'FLORAL', 'WOMEN', TRUE, TRUE)
  RETURNING id INTO p_id;
  INSERT INTO product_variations (product_id, name, volume_ml, price, compare_at_price, sku, stock_quantity) VALUES
    (p_id, '30ml', 30, 18000, 21000, 'BB-RE-30', 52),
    (p_id, '50ml', 50, 27500, NULL, 'BB-RE-50', 44),
    (p_id, '100ml', 100, 43000, 48000, 'BB-RE-100', 26);
  INSERT INTO scent_notes (product_id, note_type, name, sort_order) VALUES
    (p_id, 'TOP', 'Lychee', 1), (p_id, 'TOP', 'Peony', 2),
    (p_id, 'HEART', 'Rose', 1), (p_id, 'HEART', 'Magnolia', 2),
    (p_id, 'BASE', 'Musk', 1), (p_id, 'BASE', 'Cedar', 2);
END $$;

-- Gift Sets
INSERT INTO gift_sets (name, slug, description, price, active) VALUES
  ('The Signature Trio', 'signature-trio', 'Three 30ml Bollybee favourites: Velvet Amber, Midnight Bloom, and Citrus Muse.', 48000, TRUE),
  ('Discovery Collection', 'discovery-collection', 'Five 10ml sample vials to explore the Bollybee universe.', 25000, TRUE);

-- Sample Packs category product (linked via gift_sets for simplicity)
INSERT INTO gift_sets (name, slug, description, price, active) VALUES
  ('Floral Discovery Pack', 'floral-discovery-pack', 'Sample 10ml vials: Midnight Bloom, Rose Élan. Find your floral signature.', 12000, TRUE),
  ('Oriental Discovery Pack', 'oriental-discovery-pack', 'Sample 10ml vials: Velvet Amber, Golden Oud. Warmth and depth.', 14000, TRUE);
