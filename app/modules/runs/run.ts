import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import runSchema from "~/lib/schemas/run.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import buildRunSessions from "./helpers/buildRunSessions.server";
import type { CreateRunProps, Run, RunSession } from "./runs.types";
import aggregateProgressService from "./services/aggregateProgress.server";
import buildRunSnapshot from "./services/buildRunSnapshot.server";
import createRunAnnotations from "./services/createRunAnnotations.server";
import paginateSessionsService from "./services/paginateSessions.server";

const RunModel = mongoose.models.Run || mongoose.model("Run", runSchema);

export class RunService {
  private static toRun(doc: any): Run {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Run[]> {
    const match = options?.match || {};
    let query = RunModel.find(match);

    if (options?.populate?.length) {
      query = query.populate(options.populate);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit);
    }

    const docs = await query;
    return docs.map((doc) => this.toRun(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return RunModel.countDocuments(match);
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: Run[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);
    const data = await this.find({ match, sort, pagination });
    const count = await this.count(match);
    return {
      data,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
  }

  static async findById(id: string | undefined): Promise<Run | null> {
    if (!id) return null;
    const doc = await RunModel.findById(id);
    return doc ? this.toRun(doc) : null;
  }

  static async create(props: CreateRunProps): Promise<Run> {
    const sessions = await buildRunSessions(props.sessions);
    const snapshot = await buildRunSnapshot({
      promptId: props.prompt,
      promptVersionNumber: props.promptVersion,
      modelCode: props.modelCode,
    });

    const doc = await RunModel.create({
      project: props.project,
      name: props.name,
      annotationType: props.annotationType,
      prompt: props.prompt,
      promptVersion: props.promptVersion,
      sessions,
      snapshot,
      isRunning: false,
      isComplete: false,
      shouldRunVerification: !!props.shouldRunVerification,
    });
    return this.toRun(doc);
  }

  static async start(run: Run): Promise<void> {
    await this.updateById(run._id, {
      isRunning: false,
      stoppedAt: null,
      isComplete: false,
      hasErrored: false,
    });
    await createRunAnnotations(run);
  }

  static async stop(runId: string): Promise<Run | null> {
    const doc = await RunModel.findByIdAndUpdate(
      runId,
      {
        $set: {
          stoppedAt: new Date(),
          isRunning: false,
          finishedAt: new Date(),
          "sessions.$[pending].status": "STOPPED",
        },
      },
      {
        arrayFilters: [
          { "pending.status": { $in: ["RUNNING", "NOT_STARTED"] } },
        ],
        new: true,
      },
    );
    return doc ? this.toRun(doc) : null;
  }

  static async updateById(
    id: string,
    updates: Partial<Run>,
  ): Promise<Run | null> {
    const doc = await RunModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toRun(doc) : null;
  }

  static async deleteById(id: string): Promise<Run | null> {
    const doc = await RunModel.findByIdAndDelete(id);
    return doc ? this.toRun(doc) : null;
  }

  static async findOne(match: Record<string, any>): Promise<Run | null> {
    const docs = await this.find({ match });
    return docs[0] || null;
  }

  static aggregateProgress(runIds: string[]) {
    return aggregateProgressService(runIds);
  }

  static paginateSessions(
    sessions: RunSession[],
    props?: {
      searchValue?: string;
      sort?: string;
      page?: string | number;
      pageSize?: number;
      filters?: Record<string, string>;
    },
  ) {
    return paginateSessionsService(sessions, props);
  }
}
