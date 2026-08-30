export function formatCurrency(value = 0, currency) {
  const symbol =
    typeof currency === "object" ? currency.symbol : currency || "₵";

  return `${symbol} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
