-- Saved addresses, wishlist, reviews, promo codes, abandoned carts

CREATE TABLE saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_lga TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_landmark TEXT,
  shipping_postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_addresses_user ON saved_addresses(user_id);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_approved ON product_reviews(product_id) WHERE approved = TRUE;

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;

CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]',
  reminder_sent_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX idx_abandoned_carts_pending ON abandoned_carts(created_at)
  WHERE reminder_sent_at IS NULL AND recovered_at IS NULL;

-- RLS
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses" ON saved_addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone read approved reviews" ON product_reviews
  FOR SELECT USING (approved = TRUE);

CREATE POLICY "Users insert own reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own reviews" ON product_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manage reviews" ON product_reviews
  FOR ALL USING (is_admin());

CREATE POLICY "Anyone read active promo codes" ON promo_codes
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admin manage promo codes" ON promo_codes
  FOR ALL USING (is_admin());

CREATE POLICY "Service role abandoned carts" ON abandoned_carts
  FOR ALL USING (TRUE);

CREATE POLICY "Users upsert own abandoned cart" ON abandoned_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin read addresses" ON saved_addresses
  FOR SELECT USING (is_admin());

CREATE TRIGGER saved_addresses_updated_at
  BEFORE UPDATE ON saved_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER abandoned_carts_updated_at
  BEFORE UPDATE ON abandoned_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sample promo for testing
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount)
VALUES ('WELCOME10', '10% off your order', 'PERCENT', 10, 5000)
ON CONFLICT (code) DO NOTHING;
