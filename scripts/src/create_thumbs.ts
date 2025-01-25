/**
 * @file Second script in a 'pipeline' of processing scripts to turn a directory-based
 * arrangement of images into a configuration for the website. This scripts creates
 * thumbnail images for each image.
 *
 * Outputs an updated configuration file with thumbnail paths that is used by the next script, upload_to_r2.ts.
 */
import fs from "fs";
import {Jimp} from "jimp";
import process from "process";

/** Main function - creates thumbnail images from full size images. */
async function main() {
    const config: Gallery<BaseImage> = JSON.parse(fs.readFileSync("intermediate/r2_config.json").toString());
    for (const series of config) {
        for (const row of series.rows) {
            for (const image of row) {
                await createThumb(image);
            }
        }
    }
    // Now, config is a Gallery<ThumbImage>, as createThumb added the thumbnail paths in-place
    fs.writeFileSync("./intermediate/r2_config_thumb.json", JSON.stringify(config, null, 4));
    return 0; // success
}

/**
 * Creates a thumbnail for an image.
 * @param image Image to create a thumbnail for.
 */
async function createThumb(image: BaseImage) {
    const thumbName = `${image.path.replace(/\.png$/, " thumbnail")}`;

    try {
        // Skip creating thumbnail if it's already there
        await Jimp.read(`${thumbName}.jpg`); // throws if file does not exist
        console.log(`Found thumbnail for image ${image.path}`);
    } catch (ignore) {
        const png = await Jimp.read(image.path);
        png.scaleToFit({w: 1920, h: 1920});
        await png.write(`${thumbName}.jpg`); // Jimp requires an extension, so we need to specify the path this way else TS complains
        console.log(`Created thumbnail ${thumbName}.jpg for image ${image.path}`);
    }
    (image as ThumbImage).thumbPath = `${thumbName}.jpg`;
}

process.exit(await main());