/**
 * @file This file handles adding a new image series to the site, when the series is to be the most recent series. I.e. the simple case.
 */

import { R2Client } from "@/r2/R2Client"
import { randomUUID } from "crypto"
import { imageSeriesBaseConfig, imageSeriesWebConfig } from "@/utils/image-config"
import type { Manifest } from "@/types/config"
import { imageSeriesThumbs } from "@/utils/thumbnails"

export async function addImageSeries(dir: string, secretsPath: string): Promise<void> {
  const r2Client = R2Client.fromSecrets(secretsPath)
  r2Client.ensureBucketExists()

  const seriesUuid = randomUUID()
  const baseConfig = imageSeriesBaseConfig(dir, seriesUuid)
  const thumbConfig = await imageSeriesThumbs(dir, seriesUuid, baseConfig)

  if (!await r2Client.uploadImageSeries(thumbConfig)) {
    console.error("Failed to upload image series")
    return
  }
  if (process.env.PHOTOGRAPHY_VERBOSE) console.log(`Image series ${thumbConfig.title} (${seriesUuid}) uploaded successfully`)

  let manifest: Manifest = []
  if (await r2Client.manifestExists()) {
    const r2Manifest = await r2Client.getManifest();
    if (r2Manifest) {
      manifest = r2Manifest
    } else {
      console.error(`
        Failed to get manifest after uploading image series - MANIFEST IS OUT OF SYNC.
        You may want to delete series ${seriesUuid}.
      `);
      return;
    }
  }

  const webConfig = await imageSeriesWebConfig(thumbConfig)
  const newManifest = [webConfig].concat(manifest)
  if (!await r2Client.uploadManifest(newManifest)) {
    console.error(`
      Failed to upload manifest after uploading image series - MANIFEST IS OUT OF SYNC.
      You may want to delete series ${seriesUuid}.
    `);
    return;
  }

  if (process.env.PHOTOGRAPHY_VERBOSE) console.log(`Finished adding image series ${thumbConfig.title} (${seriesUuid})`);
}