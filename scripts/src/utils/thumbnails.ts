/**
 * @file Functionality for creating thumbnails for images.
 */

import fs from "fs";
import { Jimp } from "jimp";
import type { BaseImage, ImageSeries, ImageRow, ThumbImage } from "@/types/config";
import { objectKey } from "@/r2/utils";

/**
 * Creates thumbnails for an image series.
 *
 * @param dir Directory to create the thumbnails in.
 * @param seriesUuid UUID of the image series.
 * @param series Image series.
 * @returns The image series with thumbnail info.
 */
export async function imageSeriesThumbs(
  dir: string,
  seriesUuid: string,
  series: ImageSeries<BaseImage>,
): Promise<ImageSeries<ThumbImage>> {
  const thumbRows: ImageRow<ThumbImage>[] = [];

  for (const row of series.rows) {
    const thumbRow: ThumbImage[] = [];

    for (const image of row) {
      const thumbInfo = await createThumb(dir, image);
      thumbRow.push({
        ...image,
        ...thumbInfo,
        thumbObjectKey: objectKey(seriesUuid, series.title, thumbInfo.thumbFileName),
      });
    }

    thumbRows.push(thumbRow);
  }

  const thumbSeries: ImageSeries<ThumbImage> = {
    title: series.title,
    uuid: series.uuid,
    rows: thumbRows,
  };

  return thumbSeries;
}

/**
 * Creates a thumbnail for an image.
 *
 * The weirdness with the noExt versions is because the call to png.write() needs to have the file extension written out
 * like that for TypeScript to accept it. We could override typechecking (as we know thumbPath ends in .jpg), but eh.
 *
 * @param dir Directory to create the thumbnail in.
 * @param image Image to create a thumbnail for.
 * @returns The path to the thumbnail and the name of the thumbnail file.
 */
async function createThumb(dir: string, image: BaseImage): Promise<{ thumbPath: string; thumbFileName: string }> {
  const thumbNameNoExt = image.fileName.replace(/\.png$/, "-thumb");
  const thumbName = `${thumbNameNoExt}.jpg`;
  const thumbPathNoExt = `${dir}/${thumbNameNoExt}`;
  const thumbPath = `${dir}/${thumbName}`;

  if (fs.existsSync(thumbPath)) {
    if (process.env.PHOTO_VERBOSE) console.log(`Found thumbnail ${thumbName} for image ${image.path}`);
  } else {
    const png = await Jimp.read(image.path);
    png.scaleToFit({ w: 1920, h: 1920 });
    await png.write(`${thumbPathNoExt}.jpg`); // See function comment
    if (process.env.PHOTO_VERBOSE) console.log(`Created thumbnail ${thumbName} for image ${image.path}`);
  }

  return {
    thumbPath: thumbPath,
    thumbFileName: thumbName,
  };
}
