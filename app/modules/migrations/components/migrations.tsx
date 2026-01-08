import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item"
import dayjs from "dayjs"
import { PlayIcon } from "lucide-react"
import React from "react"
import { useRevalidator } from "react-router"
import useHandleSockets from "~/modules/app/hooks/useHandleSockets"

type MigrationWithStatus = {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed'
  lastRun?: {
    startedAt: Date
    completedAt?: Date
    triggeredBy: string
    result?: {
      success: boolean
      message: string
      stats?: Record<string, number>
    }
    error?: string
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  running: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  pending: 'bg-chart-3/10 text-chart-3 border-chart-3/20'
}

export default function Migrations({
  migrations,
  onRunMigration
}: {
  migrations: MigrationWithStatus[]
  onRunMigration: (migrationId: string) => void
}) {
  const revalidator = useRevalidator()

  useHandleSockets({
    event: 'migration:update',
    matches: [{}],
    callback: () => {
      revalidator.revalidate()
    }
  })

  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-2">
        Data Migrations
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage data backfills and transformations
      </p>

      <div className="border rounded-lg">
        <ItemGroup>
          {migrations.map((migration, index) => (
            <React.Fragment key={migration.id}>
              <Item>
                <ItemContent className="gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <ItemTitle>{migration.name}</ItemTitle>
                      <ItemDescription>{migration.description}</ItemDescription>
                      {migration.lastRun && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <div>
                            Last run: {dayjs(migration.lastRun.startedAt).format('MMM D, YYYY h:mm A')}
                          </div>
                          {migration.lastRun.result && (
                            <div className={migration.lastRun.result.success ? 'text-chart-2' : 'text-destructive'}>
                              {migration.lastRun.result.message}
                              {migration.lastRun.result.stats && (
                                <span className="ml-2">
                                  ({Object.entries(migration.lastRun.result.stats).map(([key, value]) => `${key}: ${value}`).join(', ')})
                                </span>
                              )}
                            </div>
                          )}
                          {migration.lastRun.error && (
                            <div className="text-destructive">
                              Error: {migration.lastRun.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={STATUS_COLORS[migration.status]}>
                      {migration.status}
                    </Badge>
                  </div>
                </ItemContent>
                <ItemActions className="gap-2">
                  {migration.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => onRunMigration(migration.id)}
                    >
                      <PlayIcon className="size-4 mr-1" />
                      Run
                    </Button>
                  )}
                  {migration.status === 'running' && (
                    <Button size="sm" disabled>
                      Running...
                    </Button>
                  )}
                </ItemActions>
              </Item>
              {index !== migrations.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
          {migrations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No migrations found. Create a migration file in app/migrations/
            </div>
          )}
        </ItemGroup>
      </div>
    </div>
  )
}
