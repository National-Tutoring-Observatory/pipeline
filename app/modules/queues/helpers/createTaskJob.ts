import map from "lodash/map.js";
import { getFlowProducer } from "./createQueue";
import getQueue from "./getQueue";

interface ChildJob {
  name: string;
  data: any;
  group?: { id: string };
}

export default async ({
  name,
  data,
  children,
}: {
  name: string;
  data: any;
  children: ChildJob[];
}) => {
  const queue = getQueue("tasks");

  if (children && children.length > 0) {
    const flow = {
      name: `${name}:FINISH`,
      queueName: "tasks",
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
      data: {
        ...data,
        props: {
          event: name,
          task: `${name}:FINISH`,
        },
      },
      children: map(children, (child, index) => {
        let delay = Math.floor(11 / 2) * 5000;

        if (index < 10) {
          delay = Math.floor(index / 2) * 5000;
        }

        return {
          name: child.name,
          queueName: "tasks",
          opts: {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 1000,
            },
            delay,
            ...(child.group && { group: child.group }),
          },
          data: {
            ...child.data,
            props: {
              event: name,
              task: child.name,
            },
          },
        };
      }),
    };
    const flowTree = await getFlowProducer().add(flow);
    return flowTree.job;
  }

  const taskJob = await queue.add(
    name,
    {
      ...data,
      props: {
        event: name,
        task: `${name}:FINISH`,
      },
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: {
        age: 72 * 3600, // keep up to 1 hour
        count: 2000, // keep up to 2000 jobs
      },
      removeOnFail: {
        age: 72 * 3600,
        count: 2000,
      },
    },
  );
  return taskJob;
};
