/**
 * @file Various utilities for handling image configuration.
 */

import fs from "fs"
import { BaseImage, ImageRow, ImageSeries } from "@/types/config"
import { objectKey } from "@/r2/utils"

/**
 * Parses a directory of images into an image series configuration.
 * @param dir Directory of the image series.
 * @param seriesUuid A UUID for the image series.
 * @returns The image series configuration.
 */
export function imageSeriesBaseConfig(dir: string, seriesUuid: string): ImageSeries<BaseImage> {
  const titlePath = `${dir}/title.txt`
  if (!fs.existsSync(titlePath)) throw new Error(`Could not find title.txt for image series in '${dir}'`)
  const title = fs.readFileSync(titlePath).toString()

  // Gets all pngs in the directory, and partitions them by row
  const pngs = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirEntry => dirEntry.isFile())
    .map(file => file.name)
    .filter(fileName => fileName.endsWith(".png"))
  const rows = Object.groupBy(pngs, rowOf)

  // For each row, generate an ImageRow
  const configRows: ImageRow<BaseImage>[] = []
    for (const rowName of Object.keys(rows).sort()) {
      const row = rows[rowName]
      const configRow = row!.map(imageName => {
        return {
          path: `${dir}/${imageName}`,
          fileName: imageName,
          altText: altTextOf(imageName),
          objectKey: objectKey(seriesUuid, title, imageName),
        }
      })
      configRows.push(configRow)
    }

  return {
    title: title,
    rows: configRows,
  }
}

/**
 * Gets the row from an image name. Images names are of the form A1-name.png, A2-name.png, B1-name.png, etc., where the letter denotes
 * the row and the number orders within the row. Only one letter is supported (i.e. max 26 rows).
 * @param name The name of the image.
 * @return The row that that image is in (e.g. A1-street.png -> A, B2-tree.png -> B).
 */
function rowOf(name: string): string {
  const match = name.match(/^([A-Z])[0-9]+-.+\.png$/)
  if (!match) throw new Error(`Image name ${name} does not match the required format (e.g. A1-lake.png)`)
  return match[1]
}

/**
 * Gets the alt text from an image name. This is the part of the name which is not the row identifier.
 * @param name The name of an image.
 * @return The alt text for that image (e.g. A1-street.png => street).
 */
function altTextOf(name: string): string {
    const match = name.match(/^[A-Z][0-9]+-(.+)\.png$/);
    if (!match) throw new Error(`Image name ${name} does not match the required format (e.g. A1-lake.png)`)
    return match[1];
}
