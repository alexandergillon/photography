/** Types for various scripts and configuration files. */

type BaseImage = {
    path: string,           // path to image, from /scripts
    alt_text: string,       // alt text for the image
    objectName: string,     // object name for the image in R2
};

type UploadedImage = BaseImage & {
    r2Url: string,          //
}

type ImageRow<T extends BaseImage> = T[];

type ImageSeries<T extends BaseImage> = {
    name: string,           // name of the image series
    rows: ImageRow<T>[],    // image rows
};

type Gallery<T extends BaseImage> = ImageSeries<T>[];

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