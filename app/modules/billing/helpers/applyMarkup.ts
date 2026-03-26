import Decimal from "decimal.js";

export default function applyMarkup<T extends { totalCost: number }>(
  items: T[],
  markupRate: number,
): T[] {
  return items.map((item) => ({
    ...item,
    totalCost: new Decimal(item.totalCost).times(markupRate).toNumber(),
  }));
}
