/**
 * @file Types for the various scripts.
 */

/**
 * =====================================================================================================================
 * Generic types
 * =====================================================================================================================
 */

export type ImageRow<T> = T[];

export type ImageSeries<T> = {
  title: string; // Title of the image series
  uuid: string; // UUID of the image series
  rows: ImageRow<T>[]; // Rows of images in the series
};

export type Gallery<T> = ImageSeries<T>[];

/**
 * =====================================================================================================================
 * Internal configuration types - used internally while generating the website manifest.
 * =====================================================================================================================
 */

export type BaseImage = {
  path: string; // Path to image, on disk
  fileName: string; // Name of the image file (i.e. path minus preceding dirs)
  altText: string; // Alt text for the image
  objectKey: string; // Object key for the image in R2
};

export type ThumbImage = BaseImage & {
  thumbPath: string; // Path to thumbnail image, on disk
  thumbFileName: string; // Name of the thumbnail image file (i.e. path minus preceding dirs)
  thumbObjectKey: string; // Object key for the image's thumbnail in R2
};

export type UploadedImage = ThumbImage & {
  r2Url: string; // URL to image
  thumbR2URL: string; // URL to the image thumbnail
};

/**
 * =====================================================================================================================
 * External types - used for the website's manifest.
 * =====================================================================================================================
 */

export type WebImage = {
  alt: string; // Alt text for the image
  key: string; // key to full-size image in R2
  thumbKey: string; // key to thumbnail image in R2
  width: number; // Width of the image
  height: number; // Height of the image
};

// This is the type of the final manifest for the website.
export type Manifest = Gallery<WebImage>;
