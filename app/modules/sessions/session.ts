import mongoose from 'mongoose';
import type { FindOptions } from '~/modules/common/types';
import sessionSchema from '~/modules/documents/schemas/session.schema';
import type { Session } from './sessions.types';

const SessionModel = mongoose.model('Session', sessionSchema);

export class SessionService {
  private static toSession(doc: any): Session {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Session[]> {
    const match = options?.match || {};
    let query = SessionModel.find(match);

    if (options?.populate?.length) {
      query = query.populate(options.populate);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      query = query.skip(options.pagination.skip).limit(options.pagination.limit);
    }

    const docs = await query;
    return docs.map(doc => this.toSession(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return SessionModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<Session | null> {
    if (!id) return null;
    const doc = await SessionModel.findById(id);
    return doc ? this.toSession(doc) : null;
  }

  static async findOne(match: Record<string, any>): Promise<Session | null> {
    const doc = await SessionModel.findOne(match);
    return doc ? this.toSession(doc) : null;
  }

  static async create(data: Partial<Session>): Promise<Session> {
    const doc = await SessionModel.create(data);
    return this.toSession(doc);
  }

  static async updateById(id: string, updates: Partial<Session>): Promise<Session | null> {
    const doc = await SessionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toSession(doc) : null;
  }

  static async deleteById(id: string): Promise<Session | null> {
    const doc = await SessionModel.findByIdAndDelete(id);
    return doc ? this.toSession(doc) : null;
  }

  static async findByProject(projectId: string): Promise<Session[]> {
    return this.find({ match: { project: projectId } });
  }

  static async deleteByProject(projectId: string): Promise<number> {
    const result = await SessionModel.deleteMany({ project: projectId });
    return result.deletedCount || 0;
  }
}
