/**
 * @file Contains utilities for interacting with R2.
 */

/**
 * Generates an object key for an image in R2.
 * @param seriesUuid UUID of the image series that the image belongs to.
 * @param seriesName Name of the image series that the image belongs to.
 * @param imageName Name of the image.
 * @returns The object key for the image.
 */
export function objectKey(seriesUuid: string, seriesName: string, imageName: string): string {
  return `${seriesUuid}_${sanitize(seriesName)}/${sanitize(imageName)}`;
}

/**
 * Parses an object key into its components.
 * @param objectKey The object key to parse.
 * @returns An object containing the series UUID, series name, and image name.
 */
export function parseObjectKey(objectKey: string): {
  seriesUuid: string;
  seriesName: string;
  imageName: string;
} {
  const match = objectKey.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_([a-z0-9-.]+)\/([a-z0-9-.]+)$/i,
  );
  if (!match) throw new Error(`Invalid object key: ${objectKey}`);

  return {
    seriesUuid: match[1],
    seriesName: match[2],
    imageName: match[3],
  };
}

/**
 * Removes special characters from a string, replacing them with a hyphen (and collapsing them).
 * @param s The string to sanitize.
 * @returns The sanitized string.
 */
function sanitize(s: string): string {
  return s.replaceAll(/[^A-Za-z0-9.]+/g, "-");
}
