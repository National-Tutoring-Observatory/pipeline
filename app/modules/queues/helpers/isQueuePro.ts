// Returns true if the queue instance is a QueuePro with group methods

export default function isQueuePro(queue: unknown): boolean {
  return typeof (queue as Record<string, unknown>)?.getGroups === "function";
}
