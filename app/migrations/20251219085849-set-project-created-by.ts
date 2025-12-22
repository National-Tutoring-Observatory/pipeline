import type { Db } from 'mongodb'
import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

export default {
  id: '20251219085849-set-project-created-by',
  name: 'Set Project CreatedBy',
  description: 'Sets createdBy field for all projects that lack it. Assigns the first team admin as the creator.',

  async up(db: Db): Promise<MigrationResult> {
    const projectsCollection = db.collection('projects')
    const teamsCollection = db.collection('teams')

    const projectsWithoutCreatedBy = await projectsCollection
      .find({
        createdBy: { $exists: false }
      })
      .toArray()

    if (projectsWithoutCreatedBy.length === 0) {
      return {
        success: true,
        message: 'No projects found without createdBy',
        stats: { migrated: 0, failed: 0 }
      }
    }

    let migrated = 0
    let failed = 0

    for (const project of projectsWithoutCreatedBy) {
      try {
        // Find the team and get the first admin
        const team = await teamsCollection.findOne({ _id: project.team })

        if (!team) {
          console.warn(`Team not found for project ${project._id}`)
          failed++
          continue
        }

        // Find the first admin in the team
        const usersCollection = db.collection('users')
        let creator = await usersCollection.findOne({
          teams: {
            $elemMatch: {
              team: project.team,
              role: 'ADMIN'
            }
          }
        })

        // Fallback: if no team admin found, use the first SUPER_ADMIN
        if (!creator) {
          creator = await usersCollection.findOne({
            role: 'SUPER_ADMIN'
          })

          if (!creator) {
            console.warn(`No admin or super admin found for project ${project._id}`)
            failed++
            continue
          }
        }

        // Update the project with createdBy
        await projectsCollection.updateOne(
          { _id: project._id },
          { $set: { createdBy: creator._id } }
        )

        migrated++
      } catch (error) {
        console.error(`Failed to migrate project ${project._id}:`, error)
        failed++
      }
    }

    return {
      success: failed === 0,
      message: `Migrated ${migrated} projects with createdBy`,
      stats: { migrated, failed }
    }
  },

  async down(db: Db): Promise<MigrationResult> {
    const projectsCollection = db.collection('projects')

    // Remove createdBy field that was added in this migration
    const result = await projectsCollection.updateMany(
      {},
      { $unset: { createdBy: '' } }
    )

    return {
      success: true,
      message: `Removed createdBy from ${result.modifiedCount} projects`,
      stats: { removed: result.modifiedCount, failed: 0 }
    }
  }
} as MigrationFile
