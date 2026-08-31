-- Bollybee Perfume — Complete Database Schema
-- Run in Supabase SQL Editor or via supabase db push

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE note_type AS ENUM ('TOP', 'HEART', 'BASE');
CREATE TYPE fragrance_family AS ENUM (
  'FLORAL', 'WOODY', 'ORIENTAL', 'FRESH', 'CITRUS',
  'FRUITY', 'GOURMAND', 'AQUATIC', 'MUSKY'
);
CREATE TYPE product_gender AS ENUM ('UNISEX', 'MEN', 'WOMEN');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');
CREATE TYPE fulfillment_status AS ENUM (
  'PENDING', 'PAYMENT_CONFIRMED', 'PROCESSING', 'PACKED',
  'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
);
CREATE TYPE payment_record_status AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE contact_status AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE newsletter_status AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED');

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  brand TEXT NOT NULL DEFAULT 'Bollybee',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  fragrance_family fragrance_family,
  gender product_gender DEFAULT 'UNISEX',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_family ON products(fragrance_family);

-- Product Variations
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  volume_ml INTEGER NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  compare_at_price INTEGER CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  sku TEXT NOT NULL UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, volume_ml)
);

CREATE INDEX idx_variations_product ON product_variations(product_id);
CREATE INDEX idx_variations_sku ON product_variations(sku);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_images_product ON product_images(product_id);
CREATE INDEX idx_images_variation ON product_images(variation_id);

-- Scent Notes
CREATE TABLE scent_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  note_type note_type NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_scent_notes_product ON scent_notes(product_id);

-- Nigerian States
CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- LGAs
CREATE TABLE lgas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(state_id, name)
);

CREATE INDEX idx_lgas_state ON lgas(state_id);

-- Shipping Rates
CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  lga_id UUID REFERENCES lgas(id) ON DELETE CASCADE,
  price INTEGER NOT NULL CHECK (price >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipping_state ON shipping_rates(state_id);
CREATE INDEX idx_shipping_lga ON shipping_rates(lga_id);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping_fee INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'PENDING',
  shipping_state TEXT NOT NULL,
  shipping_lga TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_landmark TEXT,
  shipping_postal_code TEXT,
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_payment ON orders(payment_status);

-- Order Items (snapshots)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variation_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'PAYSTACK',
  reference TEXT NOT NULL UNIQUE,
  provider_transaction_id TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  status payment_record_status NOT NULL DEFAULT 'PENDING',
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(reference);

-- Contact Submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_status NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Newsletter
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  status newsletter_status NOT NULL DEFAULT 'SUBSCRIBED',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gift Sets
CREATE TABLE gift_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gift_set_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_set_id UUID NOT NULL REFERENCES gift_sets(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER variations_updated_at BEFORE UPDATE ON product_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shipping_rates_updated_at BEFORE UPDATE ON shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER gift_sets_updated_at BEFORE UPDATE ON gift_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  seq TEXT;
BEGIN
  seq := LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN 'BB-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || seq;
END;
$$ LANGUAGE plpgsql;

-- Admin check helper
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Safe inventory deduction (idempotent via payment status check)
CREATE OR REPLACE FUNCTION deduct_inventory_for_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT variation_id, quantity FROM order_items
    WHERE order_id = p_order_id AND variation_id IS NOT NULL
  LOOP
    UPDATE product_variations
    SET stock_quantity = stock_quantity - item.quantity
    WHERE id = item.variation_id
      AND stock_quantity >= item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for variation %', item.variation_id;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE scent_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgas ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_set_items ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active variations" ON product_variations FOR SELECT
  USING (active = TRUE AND EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.active = TRUE));
CREATE POLICY "Public read product images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public read scent notes" ON scent_notes FOR SELECT USING (TRUE);
CREATE POLICY "Public read active states" ON states FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active lgas" ON lgas FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active shipping rates" ON shipping_rates FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active gift sets" ON gift_sets FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read gift set items" ON gift_set_items FOR SELECT USING (TRUE);

-- Profile policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admin update profiles" ON profiles FOR UPDATE USING (is_admin());

-- Order policies
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admin all orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Admin all order items" ON order_items FOR ALL USING (is_admin());

-- Contact insert (public)
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage contacts" ON contact_submissions FOR ALL USING (is_admin());

-- Newsletter insert (public)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage newsletter" ON newsletter_subscribers FOR ALL USING (is_admin());

-- Admin full access on catalogue management
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (is_admin());
CREATE POLICY "Admin manage products" ON products FOR ALL USING (is_admin());
CREATE POLICY "Admin manage variations" ON product_variations FOR ALL USING (is_admin());
CREATE POLICY "Admin manage images" ON product_images FOR ALL USING (is_admin());
CREATE POLICY "Admin manage scent notes" ON scent_notes FOR ALL USING (is_admin());
CREATE POLICY "Admin manage states" ON states FOR ALL USING (is_admin());
CREATE POLICY "Admin manage lgas" ON lgas FOR ALL USING (is_admin());
CREATE POLICY "Admin manage shipping" ON shipping_rates FOR ALL USING (is_admin());
CREATE POLICY "Admin manage payments" ON payments FOR ALL USING (is_admin());
CREATE POLICY "Admin manage gift sets" ON gift_sets FOR ALL USING (is_admin());
CREATE POLICY "Admin manage gift set items" ON gift_set_items FOR ALL USING (is_admin());

-- Storage bucket (run separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
