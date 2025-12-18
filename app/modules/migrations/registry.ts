import { readdir } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { MigrationFile } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let migrationsCache: MigrationFile[] | null = null

export async function getAllMigrations(): Promise<MigrationFile[]> {
  if (migrationsCache) {
    return migrationsCache
  }

  const migrationsDir = resolve(__dirname, '../../migrations')
  const files = await readdir(migrationsDir)
  const migrationFiles = files.filter(file => file.endsWith('.ts'))

  const migrations: MigrationFile[] = []

  for (const file of migrationFiles) {
    const filePath = resolve(migrationsDir, file)
    const module = await import(/* @vite-ignore */ filePath)
    migrations.push(module.default)
  }

  migrations.sort((a, b) => a.id.localeCompare(b.id))

  migrationsCache = migrations
  return migrations
}

export function clearMigrationsCache() {
  migrationsCache = null
}
