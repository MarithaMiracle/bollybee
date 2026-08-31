export const SHOP_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 25;
export const ACCOUNT_ORDERS_PAGE_SIZE = 10;

export function parsePage(value?: string | null): number {
  const page = parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function pageRange(page: number, limit: number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

export function totalPages(total: number, limit: number): number {
  if (total <= 0) return 1;
  return Math.ceil(total / limit);
}

export function buildPageHref(
  basePath: string,
  page: number,
  params?: Record<string, string | undefined | null>
): string {
  const search = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
