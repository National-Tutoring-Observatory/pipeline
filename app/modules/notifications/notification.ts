import createGeneralJob from "~/modules/queues/helpers/createGeneralJob";

export class NotificationService {
  static async notifyCreditsExhausted(teamId: string): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    await createGeneralJob(
      "NOTIFY_CREDITS_EXHAUSTED",
      { teamId },
      { jobId: `notify-credits-exhausted-${teamId}`, attempts: 3 },
    );
  }

  static async deliver(text: string): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }
  }
}
