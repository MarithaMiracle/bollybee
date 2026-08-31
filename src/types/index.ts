export type UserRole = "CUSTOMER" | "ADMIN";
export type NoteType = "TOP" | "HEART" | "BASE";
export type FragranceFamily =
  | "FLORAL" | "WOODY" | "ORIENTAL" | "FRESH" | "CITRUS"
  | "FRUITY" | "GOURMAND" | "AQUATIC" | "MUSKY";
export type ProductGender = "UNISEX" | "MEN" | "WOMEN";
export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED";
export type FulfillmentStatus =
  | "PENDING" | "PAYMENT_CONFIRMED" | "PROCESSING" | "PACKED"
  | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  brand: string;
  category_id: string | null;
  fragrance_family: FragranceFamily | null;
  gender: ProductGender;
  featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  active: boolean;
  created_at: string;
  category?: Category | null;
  variations?: ProductVariation[];
  images?: ProductImage[];
  scent_notes?: ScentNote[];
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  volume_ml: number;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock_quantity: number;
  active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variation_id: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface ScentNote {
  id: string;
  product_id: string;
  note_type: NoteType;
  name: string;
  sort_order: number;
}

export interface State {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface Lga {
  id: string;
  state_id: string;
  name: string;
  active: boolean;
}

export interface ShippingRate {
  id: string;
  state_id: string;
  lga_id: string | null;
  price: number;
  active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  currency: string;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  shipping_state: string;
  shipping_lga: string;
  shipping_city: string;
  shipping_address: string;
  shipping_landmark: string | null;
  shipping_postal_code: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variation_id: string | null;
  product_name: string;
  variation_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  reference: string;
  provider_transaction_id: string | null;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
}

export interface GiftSet {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
}

export interface CartItem {
  productId: string;
  variationId: string;
  quantity: number;
  productName?: string;
  variationName?: string;
  price?: number;
  imageUrl?: string | null;
  slug?: string;
  isGiftSet?: boolean;
}

export interface ValidatedCartItem extends CartItem {
  productName: string;
  variationName: string;
  price: number;
  sku: string;
  stock: number;
  slug: string;
  imageUrl: string | null;
  isGiftSet?: boolean;
}

export interface CartValidationResult {
  items: ValidatedCartItem[];
  subtotal: number;
  errors: string[];
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
}
