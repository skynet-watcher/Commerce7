/** Parse JSON or `application/x-www-form-urlencoded` bodies (Commerce7 Install URL may use either). */
export function parseTypedPayload(raw: string): unknown | null {
  const t = raw.trim();
  if (!t) {
    return null;
  }
  try {
    return JSON.parse(t) as unknown;
  } catch {
    const params = new URLSearchParams(t);
    if ([...params.keys()].length === 0) {
      return null;
    }
    return Object.fromEntries(params.entries());
  }
}
