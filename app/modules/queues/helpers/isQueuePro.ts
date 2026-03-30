// Returns true if the queue instance is a QueuePro with group methods
 
export default function isQueuePro(queue: any): boolean {
  return typeof queue?.getGroups === "function";
}
