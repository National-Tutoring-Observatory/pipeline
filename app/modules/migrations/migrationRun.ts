import mongoose from 'mongoose'
import migrationSchema from '~/modules/documents/schemas/migration.schema'
import type { Migration, MigrationResult, MigrationStatus } from './types'
import type { FindOptions } from '~/modules/common/types'

const MigrationModel = mongoose.models.Migration || mongoose.model('Migration', migrationSchema)

export class MigrationRunService {
  private static toMigrationRun(doc: any): Migration {
    return doc.toJSON({ flattenObjectIds: true })
  }

  static async find(options?: FindOptions): Promise<Migration[]> {
    const match = options?.match || {}
    let query = MigrationModel.find(match)

    if (options?.populate?.length) {
      query = query.populate(options.populate)
    }

    if (options?.sort) {
      query = query.sort(options.sort)
    }

    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit)
    }

    const docs = await query.exec()
    return docs.map(doc => this.toMigrationRun(doc))
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return MigrationModel.countDocuments(match)
  }

  static async findById(id: string | undefined): Promise<Migration | null> {
    if (!id) return null
    const doc = await MigrationModel.findById(id)
    return doc ? this.toMigrationRun(doc) : null
  }

  static async create(data: {
    migrationId: string
    direction: MigrationDirection
    triggeredBy: string
    jobId: string
  }): Promise<Migration> {
    const doc = await MigrationModel.create({
      ...data,
      status: 'running' as MigrationStatus,
      startedAt: new Date()
    })
    return this.toMigrationRun(doc)
  }

  static async updateById(id: string, updates: Partial<Migration>): Promise<Migration | null> {
    const doc = await MigrationModel.findByIdAndUpdate(id, updates, { new: true }).exec()
    return doc ? this.toMigrationRun(doc) : null
  }

  static async deleteById(id: string): Promise<Migration | null> {
    const doc = await MigrationModel.findByIdAndDelete(id).exec()
    return doc ? this.toMigrationRun(doc) : null
  }

  static async allWithRunStatus() {
    const runsData = await MigrationModel.aggregate([
      { $sort: { startedAt: -1 } },
      {
        $group: {
          _id: '$migrationId',
          lastRun: { $first: '$$ROOT' },
          statuses: { $push: '$status' }
        }
      },
      {
        $project: {
          migrationId: '$_id',
          lastRun: 1,
          statuses: 1,
          status: {
            $cond: [
              { $in: ['running', '$statuses'] },
              'running',
              {
                $cond: [{ $in: ['completed', '$statuses'] }, 'completed', 'pending']
              }
            ]
          }
        }
      }
    ])

    // Serialize run data for safe passing between layers
    return runsData.map(r => ({
      migrationId: r.migrationId,
      status: r.status,
      lastRun: r.lastRun ? JSON.parse(JSON.stringify(r.lastRun)) : null
    }))
  }
}
