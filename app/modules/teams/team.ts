import mongoose from 'mongoose';
import teamSchema from '~/modules/documents/schemas/team.schema';
import type { Team } from './teams.types';

const TeamModel = mongoose.model('Team', teamSchema);

interface FindOptions {
  match?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  pagination?: { skip: number; limit: number };
  populate?: string[];
}

export class TeamService {
  private static toTeam(doc: any): Team {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Team[]> {
    const match = options?.match || {};
    let query = TeamModel.find(match);

    if (options?.populate?.length) {
      query = query.populate(options.populate);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      query = query.skip(options.pagination.skip).limit(options.pagination.limit);
    }

    const docs = await query.exec();
    return docs.map(doc => this.toTeam(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return TeamModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<Team | null> {
    if (!id) return null;
    const doc = await TeamModel.findById(id);
    return doc ? this.toTeam(doc) : null;
  }

  static async findByName(name: string): Promise<Team | null> {
    const doc = await TeamModel.findOne({ name });
    return doc ? this.toTeam(doc) : null;
  }

  static async create(data: Partial<Team>): Promise<Team> {
    const doc = await TeamModel.create(data);
    return this.toTeam(doc);
  }

  static async updateById(id: string, updates: Partial<Team>): Promise<Team | null> {
    const doc = await TeamModel.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();
    return doc ? this.toTeam(doc) : null;
  }

  static async deleteById(id: string): Promise<Team | null> {
    const doc = await TeamModel.findByIdAndDelete(id).exec();
    return doc ? this.toTeam(doc) : null;
  }
}
