/** Formats prices consistently in Zambian Kwacha. */
export function formatZMW(value: number): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}
