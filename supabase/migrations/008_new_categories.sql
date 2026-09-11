-- New storefront categories (safe to re-run)
INSERT INTO categories (name, slug, description, active) VALUES
  ('Body Spray', 'body-spray', 'Refreshing body sprays for everyday wear', TRUE),
  ('Body Spray for Kids', 'body-spray-for-kids', 'Gentle body sprays formulated for children', TRUE),
  ('Roll-On', 'roll-on', 'Convenient roll-on fragrances', TRUE),
  ('Air Freshener', 'air-freshener', 'Home and space air fresheners', TRUE),
  ('After Shave', 'after-shave', 'Aftershave and grooming scents', TRUE),
  ('Extrait de Parfum', 'extrait-de-parfum', 'High-concentration extrait de parfum', TRUE),
  ('Ou de la Flamme', 'ou-de-la-flamme', 'Ou de la Flamme collection', TRUE),
  ('Kids', 'kids', 'Fragrances and sprays for kids', TRUE)
ON CONFLICT (slug) DO NOTHING;
