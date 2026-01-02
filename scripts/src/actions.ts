/**
 * @file This file handles the core actions, like adding and updating image series.
 */

import { R2Client } from "@/r2/R2Client";
import { imageSeriesBaseConfig, imageSeriesWebConfig } from "@/utils/image-config";
import type { Manifest, ImageSeries, WebImage } from "@/types/config";
import { imageSeriesThumbs } from "@/utils/thumbnails";

/**
 * Adds a new image series to the site.
 * @param secretsPath Path to the secrets file.
 * @param dir Directory containing the image series.
 * @param seriesUuid UUID of the new series.
 * @param afterSeriesUuid UUID of a series to insert after (optional). Defaults to inserting as the most recent.
 */
export async function addImageSeries(secretsPath: string, dir: string, seriesUuid: string, afterSeriesUuid?: string) {
  const r2Client = R2Client.fromSecrets(secretsPath);
  r2Client.ensureBucketExists();

  const baseConfig = imageSeriesBaseConfig(dir, seriesUuid);
  const thumbConfig = await imageSeriesThumbs(dir, seriesUuid, baseConfig);

  if (!(await r2Client.uploadImageSeries(thumbConfig))) {
    console.error("Failed to upload image series");
    return;
  }
  if (process.env.PHOTOGRAPHY_VERBOSE)
    console.log(`Image series ${thumbConfig.title} (${seriesUuid}) uploaded successfully`);

  const webConfig = await imageSeriesWebConfig(thumbConfig);
  const newManifest = await makeNewManifest(seriesUuid, r2Client, webConfig, afterSeriesUuid);

  if (!newManifest) return; // Error message handled in makeNewManifest
  if (!(await r2Client.uploadManifest(newManifest))) {
    console.error(`
      Failed to upload manifest after uploading image series - MANIFEST IS OUT OF SYNC.
      You may want to delete series ${seriesUuid}.
    `);
    return;
  }

  if (process.env.PHOTOGRAPHY_VERBOSE) console.log(`Finished adding image series ${thumbConfig.title} (${seriesUuid})`);
  return seriesUuid;
}

/**
 * Updates an existing image series.
 * @param secretsPath Path to the secrets file.
 * @param dir Directory containing the image series.
 * @param seriesUuid UUID of the series to update.
 */
export async function updateImageSeries(secretsPath: string, dir: string, seriesUuid: string) {
  const r2Client = R2Client.fromSecrets(secretsPath);
  r2Client.ensureBucketExists();

  const result = await deleteImageSeries(secretsPath, seriesUuid);
  if (!result.success) return; // deleteImageSeries prints error

  if (result.previous) {
    await addImageSeries(secretsPath, dir, seriesUuid, result.previous);
  } else {
    await addImageSeries(secretsPath, dir, seriesUuid);
  }
}

/**
 * Deletes an existing image series.
 * @param secretsPath Path to the secrets file.
 * @param seriesUuid UUID of the series to delete.
 * @returns A result indicating success/failure, and the UUID of the previous series (if any).
 */
export async function deleteImageSeries(
  secretsPath: string,
  seriesUuid: string,
): Promise<{ success: boolean; previous?: string | undefined }> {
  const r2Client = R2Client.fromSecrets(secretsPath);
  r2Client.ensureBucketExists();

  const manifest = await r2Client.getManifest();
  if (!manifest) {
    console.error("Failed to get manifest");
    return { success: false };
  }

  const seriesIndex = manifest.findIndex((series) => series.uuid === seriesUuid);
  const previousSeries = seriesIndex == 0 ? undefined : manifest[seriesIndex - 1].uuid;
  if (seriesIndex === -1) {
    console.error(`Series ${seriesUuid} not found in manifest`);
    return { success: false };
  }

  const manifestWithoutSeries = manifest.slice(0, seriesIndex).concat(manifest.slice(seriesIndex + 1));
  if (!(await r2Client.deleteImageSeries(seriesUuid))) {
    console.error(`Failed to delete image series ${seriesUuid}`);
    return { success: false };
  }
  if (!(await r2Client.uploadManifest(manifestWithoutSeries))) {
    console.error(`
      Failed to upload manifest after deleting image series - MANIFEST IS OUT OF SYNC.
      You may need to fix the manifest manually.
    `);
    return { success: false };
  }

  return { success: true, previous: previousSeries };
}

/**
 * Fetches the manifest and returns a new copy with a new series inserted.
 * @param seriesUuid New series UUID.
 * @param r2Client R2 client.
 * @param webConfig New series web config.
 * @param afterSeriesUuid UUID of a series to insert after (optional). Defaults to inserting as the most recent.
 * @returns New manifest, or undefined if an error occurred.
 */
async function makeNewManifest(
  seriesUuid: string,
  r2Client: R2Client,
  webConfig: ImageSeries<WebImage>,
  afterSeriesUuid?: string,
): Promise<Manifest | undefined> {
  let manifest: Manifest = [];

  if (await r2Client.manifestExists()) {
    const r2Manifest = await r2Client.getManifest();
    if (r2Manifest) {
      manifest = r2Manifest;
    } else {
      console.error(`
        Failed to get manifest after uploading image series - MANIFEST IS OUT OF SYNC.
        You may want to delete series ${seriesUuid}.
      `);
      return;
    }
  }

  if (afterSeriesUuid) {
    const previousSeriesIndex = manifest.findIndex((series) => series.uuid === afterSeriesUuid);
    return manifest
      .slice(0, previousSeriesIndex + 1)
      .concat(webConfig)
      .concat(manifest.slice(previousSeriesIndex + 1));
  } else {
    return [webConfig].concat(manifest);
  }
}
