export default function getMonthYearString(
  date: Date | string | null | undefined,
): string {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
