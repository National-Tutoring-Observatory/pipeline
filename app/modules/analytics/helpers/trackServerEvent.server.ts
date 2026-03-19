import sendGA4Event from "./sendGA4Event.server";

export default function trackServerEvent({
  name,
  userId,
  params,
}: {
  name: string;
  userId: string;
  params?: Record<string, string | number>;
}) {
  sendGA4Event({ clientId: userId, name, params }).catch(() => {});
}
