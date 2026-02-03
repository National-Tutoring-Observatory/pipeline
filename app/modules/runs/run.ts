import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import runSchema from "~/lib/schemas/run.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import createRunAnnotations from "~/modules/projects/services/createRunAnnotations.server";
import buildRunSessions from "./helpers/buildRunSessions.server";
import type { CreateRunProps, Run } from "./runs.types";
import buildRunSnapshot from "./services/buildRunSnapshot.server";

const RunModel = mongoose.model("Run", runSchema);

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
    });
    return this.toRun(doc);
  }

  static async start(run: Run): Promise<void> {
    await createRunAnnotations(run);
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
}
