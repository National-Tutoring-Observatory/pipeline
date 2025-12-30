import mongoose from 'mongoose';
import teamSchema from '~/modules/documents/schemas/team.schema';
import type { Team } from './teams.types';

const TeamModel = mongoose.model('Team', teamSchema);

export class TeamService {
  private static toTeam(doc: any): Team {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(filter: Record<string, any> = {}): Promise<Team[]> {
    const docs = await TeamModel.find(filter);
    return docs.map((doc) => this.toTeam(doc));
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
    });
    return doc ? this.toTeam(doc) : null;
  }

  static async deleteById(id: string): Promise<void> {
    await TeamModel.findByIdAndDelete(id);
  }
}
