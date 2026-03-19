import getQueue from "./getQueue";

export default async (name: string, data: Record<string, any>) => {
  const queue = getQueue("general");
  return queue.add(name, data);
};
