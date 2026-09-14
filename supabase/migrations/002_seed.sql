-- Bollybee Seed Data (Development)
-- ⚠️  RUN FIRST: supabase/migrations/001_schema.sql
-- Products are demo/seed content — upload real photography via admin

-- Categories
INSERT INTO categories (name, slug, description, active) VALUES
  ('Perfumes', 'perfumes', 'Signature Bollybee fragrances', TRUE),
  ('Eau de Parfum', 'eau-de-parfum', 'Long-lasting eau de parfum', TRUE),
  ('Body Mists', 'body-mists', 'Light, refreshing body mists', TRUE),
  ('Body Spray', 'body-spray', 'Refreshing body sprays for everyday wear', TRUE),
  ('Body Spray for Kids', 'body-spray-for-kids', 'Gentle body sprays formulated for children', TRUE),
  ('Roll-On', 'roll-on', 'Convenient roll-on fragrances', TRUE),
  ('Air Freshener', 'air-freshener', 'Home and space air fresheners', TRUE),
  ('After Shave', 'after-shave', 'Aftershave and grooming scents', TRUE),
  ('Extrait de Parfum', 'extrait-de-parfum', 'High-concentration extrait de parfum', TRUE),
  ('Ou de la Flamme', 'ou-de-la-flamme', 'Ou de la Flamme collection', TRUE),
  ('Kids', 'kids', 'Fragrances and sprays for kids', TRUE),
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

-- Catalogue products are added via the admin portal (no demo products seeded).

