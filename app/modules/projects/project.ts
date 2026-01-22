import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import projectSchema from "~/lib/schemas/project.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import type { Project } from "./projects.types";

const ProjectModel = mongoose.model("Project", projectSchema);

export class ProjectService {
  private static toProject(doc: any): Project {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Project[]> {
    const match = options?.match || {};
    let query = ProjectModel.find(match);

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
    return docs.map((doc) => this.toProject(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return ProjectModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<Project | null> {
    if (!id) return null;
    const doc = await ProjectModel.findById(id);
    return doc ? this.toProject(doc) : null;
  }

  static async create(data: Partial<Project>): Promise<Project> {
    const doc = await ProjectModel.create(data);
    return this.toProject(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<Project>,
  ): Promise<Project | null> {
    const doc = await ProjectModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toProject(doc) : null;
  }

  static async deleteById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findByIdAndDelete(id);
    return doc ? this.toProject(doc) : null;
  }

  static async findOne(match: Record<string, any>): Promise<Project | null> {
    const docs = await this.find({ match });
    return docs[0] || null;
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: Project[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);

    const results = await this.find({
      match,
      sort,
      pagination,
      populate: ["team"],
    });

    const count = await this.count(match);

    return {
      data: results,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
  }
}
