/** Paystack redirect query params (reference and legacy trxref). */
export type PaystackRedirectParams = {
  reference?: string | string[];
  trxref?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return value?.trim() || undefined;
}

/** Normalize reference from Paystack redirect query string. */
export function resolvePaystackReference(params: PaystackRedirectParams): string | undefined {
  return firstParam(params.reference) ?? firstParam(params.trxref);
}
