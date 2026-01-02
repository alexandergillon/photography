/**
 * @file This file handles adding a new image series to the site, when the series is to be the most recent series. I.e. the simple case.
 */

import { R2Client } from "@/r2/R2Client";
import { randomUUID } from "crypto";
import { imageSeriesBaseConfig, imageSeriesWebConfig } from "@/utils/image-config";
import type { Manifest, ImageSeries, WebImage } from "@/types/config";
import { imageSeriesThumbs } from "@/utils/thumbnails";

/**
 * Adds a new image series to the site.
 * @param dir Directory containing the image series.
 * @param secretsPath Path to the secrets file.
 * @param afterSeriesUuid UUID of a series to insert after (optional). Defaults to inserting as the most recent.
 * @returns The UUID of the new series, or undefined if an error occurred.
 */
export async function addImageSeries(dir: string, secretsPath: string, afterSeriesUuid?: string): Promise<string | undefined> {
  const r2Client = R2Client.fromSecrets(secretsPath);
  r2Client.ensureBucketExists();

  const seriesUuid = randomUUID();
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
  return seriesUuid
}

/**
 * Fetches the manifest and returns a new copy with a new series inserted.
 * @param seriesUuid New series UUID.
 * @param r2Client R2 client.
 * @param webConfig New series web config.
 * @param afterSeriesUuid UUID of a series to insert after (optional). Defaults to inserting as the most recent.
 * @returns New manifest, or undefined if an error occurred.
 */
async function makeNewManifest(seriesUuid: string, r2Client: R2Client, webConfig: ImageSeries<WebImage>, afterSeriesUuid?: string): Promise<Manifest | undefined> {
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
    const previousSeriesIndex = manifest.findIndex(series => series.uuid === afterSeriesUuid)
    return manifest.slice(0, previousSeriesIndex + 1).concat(webConfig).concat(manifest.slice(previousSeriesIndex + 1))
  } else {
    return [webConfig].concat(manifest);
  }
}
