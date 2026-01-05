import { redirect, useSubmit } from 'react-router'
import getSessionUser from '~/modules/authentication/helpers/getSessionUser'
import SystemAdminAuthorization from '~/modules/authorization/systemAdminAuthorization'
import getQueue from '~/modules/queues/helpers/getQueue'
import Migrations from '../components/migrations'
import { MigrationService } from '../migration'
import type { Route } from './+types/migrations.route'
import updateBreadcrumb from '~/modules/app/updateBreadcrumb'
import { useEffect } from 'react'

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request })
  if (!SystemAdminAuthorization.Migrations.canManage(user)) {
    return redirect('/')
  }

  const migrations = await MigrationService.allWithStatus()

  return { migrations }
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getSessionUser({ request })
  if (!user || !SystemAdminAuthorization.Migrations.canManage(user)) {
    throw new Error('Access denied')
  }

  const { intent, payload } = await request.json()

  if (intent === 'RUN_MIGRATION') {
    const { migrationId } = payload

    if (!migrationId) {
      throw new Error('migrationId is required')
    }

    const queue = getQueue('general')
    await queue.add('RUN_MIGRATION', {
      migrationId,
      direction: 'up',
      userId: user._id,
      props: {
        event: 'migration:update',
        task: migrationId
      }
    })

    return { success: true }
  }

  throw new Error('Invalid intent')
}

export default function MigrationsRoute({ loaderData }: Route.ComponentProps) {
  const { migrations } = loaderData
  const submit = useSubmit()

  const onRunMigration = (migrationId: string) => {
    submit(
      JSON.stringify({ intent: 'RUN_MIGRATION', payload: { migrationId } }),
      { method: 'POST', encType: 'application/json' }
    )
  }

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Migrations' }
    ])
  }, []);

  return <Migrations migrations={migrations} onRunMigration={onRunMigration} />
}
