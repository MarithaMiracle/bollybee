import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingLga: z.string().min(1, "LGA is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingAddress: z.string().min(5, "Address is required"),
  shippingLandmark: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  customerNotes: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variationId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const cartSchema = z.array(cartItemSchema).min(1, "Cart is empty");

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  email: z.string().email("Valid email is required"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  brand: z.string().default("Bollybee"),
  categoryId: z.string().uuid().optional().nullable(),
  fragranceFamily: z.string().optional().nullable(),
  gender: z.enum(["UNISEX", "MEN", "WOMEN"]).default("UNISEX"),
  featured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const variationSchema = z.object({
  name: z.string().min(1),
  volumeMl: z.number().int().positive(),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  sku: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  active: z.boolean().default(true),
});

export type VariationInput = z.infer<typeof variationSchema>;
