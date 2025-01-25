/** Types for various scripts and configuration files. */

type BaseImage = {
    path: string,               // path to image, from /scripts
    alt_text: string,           // alt text for the image
    objectName: string,         // object name for the image in R2
    thumbObjectName: string,    // object name for the image's thumbnail in R2
};

type ThumbImage = BaseImage & {
    thumbPath: string,          // path to thumbnail image, from /scripts
}

type UploadedImage = ThumbImage & {
    r2Url: string,              // URL to image
    thumbR2URL: string,         // URL to the image thumbnail
}

type WebConfigImage = {
    alt: string;                // alt text for the image
    src: string;                // URL to image
}

type ImageRow<T> = T[];

type ImageSeries<T> = {
    title: string,              // name of the image series
    rows: ImageRow<T>[],        // image rows
};

type Gallery<T> = ImageSeries<T>[];

/** TS doesn't know about Object.groupBy(). This is a workaround from here: https://stackoverflow.com/a/77724124. */

interface ObjectConstructor {
    /**
     * Groups members of an iterable according to the return value of the passed callback.
     * @param items An iterable.
     * @param keySelector A callback which will be invoked for each item in items.
     */
    groupBy<K extends PropertyKey, T>(
        items: Iterable<T>,
        keySelector: (item: T, index: number) => K,
    ): Partial<Record<K, T[]>>;
}

interface MapConstructor {
    /**
     * Groups members of an iterable according to the return value of the passed callback.
     * @param items An iterable.
     * @param keySelector A callback which will be invoked for each item in items.
     */
    groupBy<K, T>(
        items: Iterable<T>,
        keySelector: (item: T, index: number) => K,
    ): Map<K, T[]>;
}