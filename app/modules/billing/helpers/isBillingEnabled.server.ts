export default function isBillingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true";
}
