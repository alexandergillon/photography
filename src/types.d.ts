/**
 * @file Type definitions for image galleries.
 *
 * The main gallery is made up of a number of image series, which are made up of
 * rows of images. All images on a row are displayed with equal height and are
 * arranged to take up the full width of the page body.
 *
 * Each base type from the configuration file has a 'loaded' counterpart. The
 * idea for these is that they have their HTML image element already loaded.
 * We need to know the sizes of images in order to lay them out correctly, so
 * we load all images first, then lay them out. I.e. we turn a Gallery into a
 * Loaded Gallery, and wait for all HTML images to load before proceeding.
 */

/** An image in the configuration file. */
export type Image = {
    alt: string;    // alt text
    src: string;    // image source
}

/** A row of images - all displayed with equal height. */
export type ImageRow = Image[];

/** An image series - a title, with a number of image rows. */
export type ImageSeries = {
    title: string;
    rows: ImageRow[];
}

/** The overall gallery - config.json has this 'type'. */
export type Gallery = ImageSeries[];

/** Loaded equivalent of an Image. */
export type LoadedImage = {
    alt: string;
    src: string;
    image: HTMLImageElement;
}

/** Loaded equivalent of an ImageRow. */
export type LoadedImageRow = LoadedImage[];

/** Loaded equivalent of an ImageSeries. */
export type LoadedImageSeries = {
    title: string;
    rows: LoadedImageRow[];
}

/** Loaded equivalent of a Gallery. */
export type LoadedGallery = LoadedImageSeries[];