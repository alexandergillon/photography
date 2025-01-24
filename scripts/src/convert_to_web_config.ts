/**
 * @file Third script in a 'pipeline' of processing scripts to turn a directory-based
 * arrangement of images into a configuration for the website. This 'script' (if you
 * can call it that, considering how simple it is) converts the uploaded config into
 * one accepted by the frontend.
 */

import fs from "fs";
import process from "process";

/** Main function - converts the uploaded image config into the format used by the frontend website. */
function main() {
    const config: Gallery<UploadedImage> = JSON.parse(fs.readFileSync("intermediate/r2_config_uploaded.json").toString());
    const webConfig: Gallery<WebConfigImage> = config.map(series => {
        return {
            title: series.title,
            rows: series.rows.map(row => row.map(image => {
                return {
                    alt: image.alt_text,
                    src: image.r2Url,
                }
            }))
        }
    });
    fs.writeFileSync("./output/config.json", JSON.stringify(webConfig, null, 4));
    return 0; // success
}

process.exit(main());