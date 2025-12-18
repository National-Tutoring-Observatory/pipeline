#!/usr/bin/env node

import dayjs from 'dayjs'
import { mkdir, writeFile } from 'fs/promises'
import kebabCase from 'lodash/kebabCase.js'
import startCase from 'lodash/startCase.js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function generateTimestamp() {
  return dayjs().format('YYYYMMDDHHmmss')
}

const migrationTemplate = (id, name, description) => `import type { Db } from 'mongodb'
import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

export default {
  id: '${id}',
  name: '${name}',
  description: '${description}',

  async up(db) {

    // TODO: Implement migration logic here

    return {
      success: true,
      message: 'Migration completed successfully',
      stats: { migrated: 0, failed: 0 }
    }
  }
} satisfies MigrationFile
`

async function generateMigration() {
  const args = process.argv.slice(2)
  const rawName = args.join(' ')

  if (!rawName) {
    console.error('❌ Error: Migration name is required')
    console.log('\nUsage: yarn migration:generate <migration-name>')
    console.log('Example: yarn migration:generate Add User Email Verification')
    process.exit(1)
  }

  const timestamp = generateTimestamp()
  const kebabName = kebabCase(rawName)
  const displayName = startCase(rawName)
  const id = `${timestamp}-${kebabName}`
  const filename = `${id}.ts`

  const migrationsDir = join(__dirname, '../app/migrations')
  const filepath = join(migrationsDir, filename)

  try {
    await mkdir(migrationsDir, { recursive: true })
    await writeFile(filepath, migrationTemplate(id, displayName, rawName))

    console.log('✅ Migration created successfully!')
    console.log(`\nFile: app/migrations/${filename}`)
    console.log(`ID: ${id}`)
    console.log(`Name: ${displayName}`)
    console.log('\n📝 Next steps:')
    console.log('1. Open the migration file and implement the up() function')
    console.log('2. Optionally implement the down() function for rollback')
    console.log('3. The migration will automatically appear in the admin UI')
  } catch (error) {
    console.error('❌ Error creating migration:', error)
    process.exit(1)
  }
}

generateMigration()
