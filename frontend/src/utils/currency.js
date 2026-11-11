export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_DELIVERY_FEE = 29;
export const EXPRESS_DELIVERY_FEE = 49;

/**
 * Formats a numeric amount in Indian Rupees (₹) using the en-IN grouping convention.
 * Omits ".00" for whole rupee amounts and keeps two decimal places when paise exist.
 */
export function formatINR(amount) {
  const numeric = Number(amount);
  const value = Number.isFinite(numeric) ? numeric : 0;
  const hasFraction = Math.abs(value - Math.round(value)) >= 0.005;

  return `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)}`;
}
