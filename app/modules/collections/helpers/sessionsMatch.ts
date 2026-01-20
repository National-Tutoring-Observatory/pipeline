export function sessionsMatch(sessions1: string[], sessions2: string[]): boolean {
  if (sessions1.length !== sessions2.length) {
    return false;
  }
  const sorted1 = [...sessions1].sort();
  const sorted2 = [...sessions2].sort();
  return sorted1.every((id, index) => id === sorted2[index]);
}
