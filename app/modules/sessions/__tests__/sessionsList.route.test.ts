import { beforeEach, describe, expect, it } from 'vitest'
import { ProjectService } from '~/modules/projects/project'
import { TeamService } from '~/modules/teams/team'
import { UserService } from '~/modules/users/user'
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB'
import loginUser from '../../../../test/helpers/loginUser'
import { loader } from '../containers/sessionsList.route'
import { SessionService } from '../session'

describe('sessionsList.route loader', () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it('returns the sessions as an array', async () => {
    const team = await TeamService.create({ name: 'team 1' })
    const project = await ProjectService.create({ name: 'project 1', team: team._id })
    const user = await UserService.create({ username: 'test_user', teams: [{ team: team._id, role: 'ADMIN' }] });

    const sessionA = await SessionService.create({ project: project._id, hasConverted: true, name: 's1' })

    const cookieHeader = await loginUser(user._id)

    const res = (await loader({
      request: new Request(`http://localhost/?project=${project._id}`, { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: '',
      context: {}
    }) as any);

    const ids = res.sessions.data.map((d: any) => d._id)
    expect(ids).toContain(sessionA._id)
    expect(res.sessions.data.length).toBe(1);
  })

  it('filters out not converted sessions', async () => {
    const team = await TeamService.create({ name: 'team 1' })
    const project = await ProjectService.create({ name: 'project 1', team: team._id })
    const user = await UserService.create({ username: 'test_user', teams: [{ team: team._id, role: 'ADMIN' }] })
    await SessionService.create({ project: project._id, hasConverted: false, name: 's1' })

    const cookieHeader = await loginUser(user._id)

    const res = (await loader({
      request: new Request(`http://localhost/?project=${project._id}`, { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: '',
      context: {}
    }) as any);

    expect(res.sessions.data.length).toBe(0);
  })

  it('filters out files from other projects', async () => {
    const team = await TeamService.create({ name: 'team 1' })
    const project = await ProjectService.create({ name: 'project 1', team: team._id })
    const project2 = await ProjectService.create({ name: 'project 2', team: team._id })
    const user = await UserService.create({ username: 'test_user', teams: [{ team: team._id, role: 'ADMIN' }] })

    const sessionA = await SessionService.create({ project: project._id, hasConverted: true, name: 's1' })
    const sessionB = await SessionService.create({ project: project2._id, hasConverted: true, name: 's2' })

    const cookieHeader = await loginUser(user._id)

    const res = (await loader({
      request: new Request(`http://localhost/?project=${project._id}`, { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: '',
      context: {}
    }) as any);

    const ids = res.sessions.data.map((d: any) => d._id)
    expect(ids).toContain(sessionA._id)
    expect(ids).not.toContain(sessionB._id)
  })

  it('redirects when no project given', async () => {
    const team = await TeamService.create({ name: 'team 1' })
    const user = await UserService.create({ username: 'test_user', teams: [{ team: team._id, role: 'ADMIN' }] })

    const cookieHeader = await loginUser(user._id)

    const res = (await loader({
      request: new Request(`http://localhost/`, { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: '',
      context: {}
    }) as any);

    expect(res.status).toBe(302)
  })

  it('redirects when not project owner', async () => {
    const team = await TeamService.create({ name: 'team 1' })
    const project = await ProjectService.create({ name: 'project 1', team: team._id })
    const team2 = await TeamService.create({ name: 'team 2' })
    const project2 = await ProjectService.create({ name: 'project 2', team: team2._id })
    const user = await UserService.create({ username: 'test_user', teams: [{ team: team._id, role: 'ADMIN' }] })

    const cookieHeader = await loginUser(user._id)

    const res = (await loader({
      request: new Request(`http://localhost/?project=${project2._id}`, { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: '',
      context: {}
    }) as any);

    expect(res.status).toBe(302)
  })
});
