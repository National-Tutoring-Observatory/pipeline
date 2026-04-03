import isBillingEnabled from "./isBillingEnabled.server";

export default function getInitialCreditsAmount(): number {
  return isBillingEnabled() ? 10 : 20;
}
