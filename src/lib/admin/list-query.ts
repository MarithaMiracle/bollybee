/** Escape `%` and `_` for safe ilike patterns */
export function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

export function adminListParams(
  params: Record<string, string | undefined>,
  keys: string[]
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  if (params.q) out.q = params.q;
  for (const key of keys) {
    if (params[key]) out[key] = params[key];
  }
  return out;
}
