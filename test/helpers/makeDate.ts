export default function makeDate(year: number, month: number, day = 1): Date {
  return new Date(Date.UTC(year, month - 1, day));
}
