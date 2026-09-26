const priceFormatter = new Intl.NumberFormat('fa-IR');

export function formatPrice(price: number) {
  return `${priceFormatter.format(Math.max(0, Math.round(price)))} تومان`;
}
