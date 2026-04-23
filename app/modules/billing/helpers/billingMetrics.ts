import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("billing");

export const creditsAppliedCounter = meter.createCounter(
  "billing.credits_applied",
  { description: "Total USD credits applied to team balances", unit: "usd" },
);

export const debitsAppliedCounter = meter.createCounter(
  "billing.debits_applied",
  { description: "Total USD debits charged to team balances", unit: "usd" },
);

export const idempotentSkipsCounter = meter.createCounter(
  "billing.idempotent_skips",
  {
    description:
      "Ledger writes skipped due to duplicate idempotency key (retries)",
  },
);

export const insufficientBalanceCounter = meter.createCounter(
  "billing.insufficient_balance",
  { description: "LLM requests rejected due to insufficient team balance" },
);

export const balanceGauge = meter.createGauge("billing.balance.current", {
  description: "Team available balance after a ledger write",
  unit: "usd",
});
