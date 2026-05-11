/**
 * Format number to Indonesian Rupiah format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Format balance with −Rp prefix for negative values
 */
export function formatBalance(balance: number): string {
  if (balance < 0) return `−Rp ${formatCurrency(Math.abs(balance))}`;
  return `Rp ${formatCurrency(balance)}`;
}

/**
 * Generate invoice number: INV-YYYYMMDD-XX
 */
export function generateInvoiceNumber(sequence: number): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(sequence).padStart(2, "0");
  return `INV-${dateStr}-${seq}`;
}

/**
 * Generate PO reference: PO-YYMM-XX
 */
export function generatePOReference(sequence: number): string {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const seq = String(sequence).padStart(2, "0");
  return `PO-${yymm}-${seq}`;
}

/**
 * Standard pagination helper
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "15")));
  const skip = (page - 1) * perPage;
  return { page, perPage, skip };
}

/**
 * Build pagination meta response
 */
export function paginationMeta(page: number, perPage: number, total: number) {
  return {
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.ceil(total / perPage),
  };
}
