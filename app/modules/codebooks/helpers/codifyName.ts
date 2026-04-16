export default function codifyName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9&\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toUpperCase())
    .join("_");
}
