export function sessionsMatch(sessions1: string[], sessions2: string[]): boolean {
  if (sessions1.length !== sessions2.length) return false;
  const set = new Set(sessions1);
  return sessions2.every(id => set.has(id));
}
