import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function fragranceFamilyLabel(family: string): string {
  return family.charAt(0) + family.slice(1).toLowerCase();
}

export const FRAGRANCE_FAMILIES = [
  "FLORAL",
  "WOODY",
  "ORIENTAL",
  "FRESH",
  "CITRUS",
  "FRUITY",
  "GOURMAND",
  "AQUATIC",
  "MUSKY",
] as const;

export const FULFILLMENT_STEPS = [
  { key: "PENDING", label: "Order placed" },
  { key: "PAYMENT_CONFIRMED", label: "Payment confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const;
