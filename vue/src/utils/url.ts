/**
 * @file URL utilities.
 */

/**
 * Generates a URL for an image series UUID.
 * @param uuid UUID.
 * @returns URL to that image series.
 */
export function uuidUrl(uuid: string): string {
  return `${window.location.origin}#${uuid}`;
}

/**
 * Fetches a UUID from the URL, if present.
 * @returns UUID if present, null otherewise.
 */
export function urlUuid(): string | null {
  const hash = window.location.hash;
  if (!hash) return null;

  const uuid = hash.substring(1);
  return uuid || null;
}
