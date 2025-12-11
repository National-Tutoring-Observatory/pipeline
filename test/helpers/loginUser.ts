import sessionStorage from '../../sessionStorage.js'

export default async function loginUser(userId: string): Promise<string> {
  const session = await sessionStorage.getSession()
  session.set('user', { _id: userId })
  const setCookie = await sessionStorage.commitSession(session)
  const cookieHeader = setCookie.split(';')[0]
  return cookieHeader
}
