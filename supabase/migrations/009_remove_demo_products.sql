-- Remove original mock/demo catalogue items (safe if already gone)
DELETE FROM products
WHERE slug IN (
  'velvet-amber',
  'golden-oud',
  'midnight-bloom',
  'vanilla-noir',
  'citrus-muse',
  'royal-musk',
  'sandalwood-reserve',
  'rose-elan'
);

DELETE FROM gift_sets
WHERE slug IN (
  'signature-trio',
  'discovery-collection',
  'floral-discovery-pack',
  'oriental-discovery-pack'
);
