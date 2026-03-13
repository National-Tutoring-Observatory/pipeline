const ENDPOINT = "https://www.google-analytics.com/mp/collect";

export default async function sendGA4Event({
  clientId,
  name,
  params,
}: {
  clientId: string;
  name: string;
  params?: Record<string, string | number>;
}) {
  const measurementId = process.env.GOOGLE_ANALYTICS_ID;
  const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;

  if (!measurementId || !apiSecret) return;

  await fetch(
    `${ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name, params }],
      }),
    },
  );
}
