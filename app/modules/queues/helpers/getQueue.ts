import { QUEUES } from "./createQueue"

export default (name: string) => {
  return QUEUES[name];
}