import type { BillingData, TagSpend } from "../llmBilling.types";

function getBaseUrl(): string {
  const baseUrl = process.env.AI_GATEWAY_BASE_URL;
  if (!baseUrl) throw new Error("AI_GATEWAY_BASE_URL is not configured");
  return baseUrl.replace(/\/v1\/?$/, "").replace(/\/+$/, "");
}

function getApiKey(): string {
  const key =
    process.env.AI_GATEWAY_MANAGEMENT_KEY || process.env.AI_GATEWAY_KEY;
  if (!key) throw new Error("AI_GATEWAY_MANAGEMENT_KEY is not configured");
  return key;
}

export async function getSpendByTag(teamId: string): Promise<TagSpend | null> {
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();

  const response = await fetch(`${baseUrl}/spend/tags`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LiteLLM /spend/tags returned ${response.status}: ${text}`);
  }

  const data = await response.json();
  const entries = Array.isArray(data) ? data : [];

  const match = entries.find(
    (entry: Record<string, unknown>) => entry.individual_request_tag === teamId,
  );

  if (!match) return null;

  return {
    tag: match.individual_request_tag as string,
    logCount: (match.log_count as number) || 0,
    totalSpend: (match.total_spend as number) || 0,
  };
}

export async function getTeamBillingData(teamId: string): Promise<BillingData> {
  try {
    const tagSpend = await getSpendByTag(teamId);
    return { tagSpend, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch billing data from LiteLLM";
    return { tagSpend: null, error: message };
  }
}
