export default function sanitizeReturnTo(value: unknown): string {
  if (typeof value !== "string") return "/";
  // Block open redirect bypasses — protocol-relative (//) and backslash normalization (/\)
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  )
    return "/";
  return value;
}
