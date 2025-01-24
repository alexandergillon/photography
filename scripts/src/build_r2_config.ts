/**
 * @file First script in a 'pipeline' of processing scripts to turn a directory-based
 * arrangement of images into a configuration for the website. This scripts reads in
 * the directories / images and sorts them into rows, assigning R2 object names to each
 * image.
 *
 * Outputs a configuration file that is used by the next script, upload_to_r2.ts.
 *
 * Example input:
 *  /input
 *      /01 Chicago
 *          A1 street.png
 *          A2 boats.png
 *          A3 buildings.png
 *          name.txt - contains 'Chicago'
 *      /02 Starved Rock
 *          A1 flag.png
 *          A2 bridge.png
 *          B1 clearing.png
 *          B2 trees.png
 *          B3 river.png
 *          name.txt - contains 'Starved Rock State Park'
 *
 * Example output:
 * [
 *     {
 *         "name": "Chicago",
 *         "rows": [
 *             [
 *                 {
 *                     "path": "input/01 Chicago/A1 chicago street.png",
 *                     "alt_text": "chicago street",
 *                     "objectName": "0-Chicago/A1_chicago_street.png"
 *                 },
 *                 {
 *                     "path": "input/01 Chicago/A2 two boats.png",
 *                     "alt_text": "two boats",
 *                     "objectName": "0-Chicago/A2_two_boats.png"
 *                 },
 *                 {
 *                     "path": "input/01 Chicago/A3 group of chicago buildings.png",
 *                     "alt_text": "group of chicago buildings",
 *                     "objectName": "0-Chicago/A3_group_of_chicago_buildings.png"
 *                 }
 *             ]
 *         ]
 *     },
 *     {
 *         "name": "Starved Rock State Park",
 *         "rows": [
 *             [
 *                 {
 *                     "path": "input/02 Starved Rock/A1 canyon with flag.png",
 *                     "alt_text": "canyon with flag",
 *                     "objectName": "1-Starved_Rock_State_Park/A1_canyon_with_flag.png"
 *                 },
 *                 {
 *                     "path": "input/02 Starved Rock/A2 bridge.png",
 *                     "alt_text": "bridge",
 *                     "objectName": "1-Starved_Rock_State_Park/A2_bridge.png"
 *                 }
 *             ],
 *             [
 *                 {
 *                     "path": "input/02 Starved Rock/B1 clearing.png",
 *                     "alt_text": "clearing",
 *                     "objectName": "1-Starved_Rock_State_Park/B1_clearing.png"
 *                 },
 *                 {
 *                     "path": "input/02 Starved Rock/B2 trees.png",
 *                     "alt_text": "trees",
 *                     "objectName": "1-Starved_Rock_State_Park/B2_trees.png"
 *                 },
 *                 {
 *                     "path": "input/02 Starved Rock/B3 trees across river.png",
 *                     "alt_text": "trees across river",
 *                     "objectName": "1-Starved_Rock_State_Park/B3_trees_across_river.png"
 *                 }
 *             ]
 *         ]
 *     }
 * ]
 *
 */

import fs from "fs";
import * as process from "process";

/** Main function - compiles the configuration file for the next step. */
function main(): number {
    const r2_config: Gallery<BaseImage> = [];

    fs.readdirSync("./input", {withFileTypes: true})
        .filter(dirEntry => !dirEntry.isFile())                     // For each directory in the input directory
        .map(dirEntry => dirEntry.name)                             // Get its name
        .sort((dir1, dir2) => dir1.localeCompare(dir2))             // Sorted lexicographically
        .forEach((dir, index) => {                                  // And turn it into a config image series
            r2_config.push(directory_to_r2_config(index, `input/${dir}`));
        });

    validateConfig(r2_config);
    fs.writeFileSync("./intermediate/r2_config.json", JSON.stringify(r2_config, null, 4));
    return 0; // success
}

/**
 * Turns a directory, which represents an image series, into an R2 config image series.
 * See file header for more information.
 * @param index The index of this directory among the directories.
 * @param directory Path to the directory to turn into an R2 config image series.
 * @return The R2 config image series for that directory.
 */
function directory_to_r2_config(index: number, directory: string): ImageSeries<BaseImage> {
    const namePath = `${directory}/name.txt`;
    if (!fs.existsSync(namePath)) throw new Error(`Could not find name.txt for ${directory}`);
    const seriesName = fs.readFileSync(namePath).toString();

    // Gets all pngs in the directory
    const images = fs.readdirSync(directory, {withFileTypes: true})
        .filter(dirEntry => dirEntry.isFile())
        .map(dirEntry => dirEntry.name)
        .filter(file => file.endsWith(".png"))
    const rows = Object.groupBy(images, row); // And splits them by row

    const configRows: ImageRow<BaseImage>[] = [];
    for (const rowName of Object.keys(rows).sort()) { // .sort() so that rows are in the right order
        const row = rows[rowName];
        const configRow = row.map(image => {
            return {
                path: `${directory}/${image}`,
                alt_text: altText(image),
                // Index ensures uniqueness between series with the same name
                objectName: `${index}-${sanitize(seriesName)}/${sanitize(image)}`,
            }
        });
        configRows.push(configRow);
    }

    return {
        title: seriesName,
        rows: configRows
    };
}

/** Removes most special characters from a string. */
function sanitize(s: string): string {
    return s.replaceAll(/[^A-Za-z0-9_.]/g, "_");
}

/**
 * Gets the row from an image name. Images names are of the form A1 ..., A2 ..., B1 ..., etc., where the letter denotes
 * the row and the number orders within the row. Note: these identifiers (A1, B2, etc.) can only have ONE letter and
 * ONE number at the moment.
 * @param name The name of the image.
 * @return The row that that image is in (e.g. A1 street.png -> A, B2 tree.png -> B).
 */
function row(name: string): string {
    const match = name.match(/^([A-Z])[0-9] .+\.png$/);
    if (!match) throw new Error(`Image name ${name} does not match the required format (e.g. A1 Lake)`);
    return match[1];
}

/**
 * Gets the alt text from an image name. This is the part of the name which is not the row identifier.
 * @param name The name of an image.
 * @return The alt text for that image (e.g. A1 street.png => street).
 */
function altText(name: string): string {
    const match = name.match(/^[A-Z][0-9] (.+)\.png$/); // limit 26 rows
    if (!match) throw new Error(`Image name ${name} does not match the required format (e.g. A1 Lake)`);
    return match[1];
}

/**
 * Validates the generated configuration. Throws an exception on failure.
 * @param config Config to generate.
 */
function validateConfig(config: Gallery<BaseImage>) {
    // Checks that all object names are unique and satisfy R2 naming requirements.
    const seenObjects: Set<string> = new Set();
    for (const series of config) {
        for (const row of series.rows) {
            for (const object of row) {
                validateObjectName(object.objectName);
                if (seenObjects.has(object.objectName)) throw new Error(`Object name ${object.objectName} is not unique`);
                seenObjects.add(object.objectName);
            }
        }
    }
}

/**
 * Validates than an object name only contains 'safe characters', which is a bit arbitrary but loosely based on the S3
 * naming requirements: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
 * @param objectName Object name to validate.
 */
function validateObjectName(objectName: string) {
    if (objectName.length > 1024) throw new Error(`Object name ${objectName} is longer than 1024 characters (${objectName.length} characters)`);
    if (!objectName.match(/^[a-zA-Z0-9/_.-]+$/)) throw new Error(`Object name ${objectName} contains disallowed characters`);
}

process.exit(main());