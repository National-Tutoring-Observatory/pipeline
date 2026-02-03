import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import collectionSchema from "~/lib/schemas/collection.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import type { Run, RunAnnotationType } from "~/modules/runs/runs.types";
import type { Collection, PromptReference } from "./collections.types";
import addRunsToCollectionService from "./services/addRunsToCollection.server";
import createCollectionForRunService from "./services/createCollectionForRun.server";
import createCollectionWithRuns from "./services/createCollectionWithRuns.server";
import createRunsForCollectionService from "./services/createRunsForCollection.server";
import deleteCollectionService from "./services/deleteCollection.server";
import findEligibleCollectionsForRunService from "./services/findEligibleCollectionsForRun.server";
import findEligibleRunsService from "./services/findEligibleRuns.server";
import findMergeableCollectionsService from "./services/findMergeableCollections.server";
import mergeCollectionsService from "./services/mergeCollections.server";

const CollectionModel = mongoose.model("Collection", collectionSchema);

export class CollectionService {
  private static toCollection(doc: any): Collection {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Collection[]> {
    const match = options?.match || {};
    let query = CollectionModel.find(match);

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
    return docs.map((doc) => this.toCollection(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return CollectionModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<Collection | null> {
    if (!id) return null;
    const doc = await CollectionModel.findById(id);
    return doc ? this.toCollection(doc) : null;
  }

  static async findOne(match: Record<string, any>): Promise<Collection | null> {
    const doc = await CollectionModel.findOne(match);
    return doc ? this.toCollection(doc) : null;
  }

  static async create(data: Partial<Collection>): Promise<Collection> {
    const doc = await CollectionModel.create(data);
    return this.toCollection(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<Collection>,
  ): Promise<Collection | null> {
    const doc = await CollectionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toCollection(doc) : null;
  }

  static async deleteById(id: string): Promise<Collection | null> {
    const doc = await CollectionModel.findByIdAndDelete(id);
    return doc ? this.toCollection(doc) : null;
  }

  static async findByProject(projectId: string): Promise<Collection[]> {
    return this.find({ match: { project: projectId } });
  }

  static async deleteByProject(projectId: string): Promise<number> {
    const result = await CollectionModel.deleteMany({ project: projectId });
    return result.deletedCount || 0;
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: Collection[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);

    const results = await this.find({
      match,
      sort,
      pagination,
    });

    const count = await this.count(match);

    return {
      data: results,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
  }

  static async createWithRuns(payload: {
    project: string;
    name: string;
    sessions: string[];
    prompts: PromptReference[];
    models: string[];
    annotationType: RunAnnotationType;
  }): Promise<{ collection: Collection; errors: string[] }> {
    return createCollectionWithRuns(payload);
  }

  static async deleteWithCleanup(
    collectionId: string,
  ): Promise<{ status: string }> {
    return deleteCollectionService({ collectionId });
  }

  static async findEligibleCollectionsForRun(
    runId: string,
    options?: { page?: number; pageSize?: number; search?: string },
  ): Promise<{ data: Collection[]; count: number; totalPages: number }> {
    return findEligibleCollectionsForRunService(runId, options);
  }

  static async createCollectionForRun(
    runId: string,
    name: string,
  ): Promise<Collection> {
    return createCollectionForRunService(runId, name);
  }

  static async findEligibleRunsForCollection(
    collectionId: string,
    options?: { page?: number; pageSize?: number; search?: string },
  ): Promise<{ data: Run[]; count: number; totalPages: number }> {
    return findEligibleRunsService(collectionId, options);
  }

  static async addRunsToCollection(
    collectionId: string,
    runIds: string[],
  ): Promise<{
    collection: Collection;
    added: string[];
    skipped: string[];
    errors: string[];
  }> {
    return addRunsToCollectionService(collectionId, runIds);
  }

  static async findMergeableCollections(
    targetCollectionId: string,
    options?: { page?: number; pageSize?: number; search?: string },
  ): Promise<{ data: Collection[]; count: number; totalPages: number }> {
    return findMergeableCollectionsService(targetCollectionId, options);
  }

  static async mergeCollections(
    targetCollectionId: string,
    sourceCollectionIds: string | string[],
  ): Promise<{ collection: Collection; added: string[]; skipped: string[] }> {
    return mergeCollectionsService(targetCollectionId, sourceCollectionIds);
  }

  static async removeRunFromCollection(
    collectionId: string,
    runId: string,
  ): Promise<Collection | null> {
    const doc = await CollectionModel.findByIdAndUpdate(
      collectionId,
      { $pull: { runs: runId } },
      { new: true },
    );
    return doc ? this.toCollection(doc) : null;
  }

  static async createRunsForCollection(payload: {
    collectionId: string;
    prompts: PromptReference[];
    models: string[];
  }) {
    return createRunsForCollectionService(payload);
  }
}
