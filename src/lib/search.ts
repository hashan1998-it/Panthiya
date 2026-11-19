export function toContainsPattern(search: string): string {
  const likeEscaped = search.replace(/[\\%_]/g, "\\$&");
  const pattern = `%${likeEscaped}%`;
  return `"${pattern.replace(/[\\"]/g, "\\$&")}"`;
}
