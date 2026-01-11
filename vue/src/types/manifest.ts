/**
 * @file Types for the gallery configuration, stored in R2.
 */

export type Image = {
  alt: string; // Alt text for the image
  key: string; // key to full-size image in R2
  thumbKey: string; // key to thumbnail image in R2
  width: number; // Width of the image
  height: number; // Height of the image
};

export type ImageRow = Image[];

export type ImageSeries = {
  title: string; // Title of the image series
  uuid: string; // UUID of the image series
  rows: ImageRow[]; // Rows of images in the series
};

// This is the overall type of manifest.json, which specifies the gallery layout.
export type Manifest = ImageSeries[];
