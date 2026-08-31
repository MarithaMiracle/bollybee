/** Supabase nested selects may infer object or single-element array depending on relation metadata. */
export function relationName(value: unknown): string {
  if (!value) return "Unknown";
  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name ?? "Unknown";
  }
  return (value as { name?: string }).name ?? "Unknown";
}
