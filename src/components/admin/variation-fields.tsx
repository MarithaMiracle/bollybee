"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductVariation } from "@/types";

type VariationFieldValues = Partial<
  Pick<
    ProductVariation,
    "name" | "volume_ml" | "price" | "compare_at_price" | "sku" | "stock_quantity" | "active"
  >
>;

interface VariationFieldsProps {
  idPrefix: string;
  defaults?: VariationFieldValues;
  disabled?: boolean;
  showActive?: boolean;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
    </div>
  );
}

/** Shared labelled inputs for add + edit variation forms. */
export function VariationFields({
  idPrefix,
  defaults,
  disabled,
  showActive = false,
}: VariationFieldsProps) {
  return (
    <>
      <Field
        id={`${idPrefix}-name`}
        label="Display name"
        hint="Shown to shoppers on the product page (e.g. 50ml or 100ml)."
      >
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="e.g. 50ml"
          required
          disabled={disabled}
        />
      </Field>

      <Field
        id={`${idPrefix}-volume`}
        label="Volume (ml)"
        hint="Bottle size in millilitres. Only one variation per volume on a product."
      >
        <Input
          id={`${idPrefix}-volume`}
          name="volumeMl"
          type="number"
          min={1}
          defaultValue={defaults?.volume_ml}
          placeholder="e.g. 50"
          required
          disabled={disabled}
        />
      </Field>

      <Field
        id={`${idPrefix}-price`}
        label="Selling price (₦)"
        hint="What the customer pays. Enter whole naira only (no commas or kobo)."
      >
        <Input
          id={`${idPrefix}-price`}
          name="price"
          type="number"
          min={0}
          defaultValue={defaults?.price}
          placeholder="e.g. 25000"
          required
          disabled={disabled}
        />
      </Field>

      <Field
        id={`${idPrefix}-compare`}
        label="Compare-at price (₦)"
        hint="Optional. Higher “was” price shown with a strikethrough for discounts."
      >
        <Input
          id={`${idPrefix}-compare`}
          name="compareAtPrice"
          type="number"
          min={0}
          defaultValue={defaults?.compare_at_price ?? undefined}
          placeholder="Optional"
          disabled={disabled}
        />
      </Field>

      <Field
        id={`${idPrefix}-sku`}
        label="SKU"
        hint="Internal stock code. Must be unique across the whole catalogue."
      >
        <Input
          id={`${idPrefix}-sku`}
          name="sku"
          defaultValue={defaults?.sku}
          placeholder="e.g. BB-ROSE-50"
          required
          disabled={disabled}
        />
      </Field>

      <Field
        id={`${idPrefix}-stock`}
        label="Stock quantity"
        hint="How many units are available to sell right now."
      >
        <Input
          id={`${idPrefix}-stock`}
          name="stockQuantity"
          type="number"
          min={0}
          defaultValue={defaults?.stock_quantity}
          placeholder="e.g. 20"
          required
          disabled={disabled}
        />
      </Field>

      {showActive ? (
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            disabled={disabled}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Active on storefront</span>
            <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
              Uncheck to hide this size from shoppers without deleting it.
            </span>
          </span>
        </label>
      ) : null}
    </>
  );
}
