/**
 * @file Third script in a 'pipeline' of processing scripts to turn a directory-based
 * arrangement of images into a configuration for the website. This scripts reads in
 * the config from the last script and uploades the appropriate images to R2 if they
 * are not already there.
 *
 * Outputs an updated configuration file with R2 links that is used by the next script, convert_to_web_config.ts.
 */

import fs from "fs";
import {S3Client, HeadBucketCommand, HeadObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import process from "process";

/**
 * These are not all secrets per se (some are more like configs). But they do contain secrets, so I want to be
 * careful with my naming.
 */
const secrets: any = JSON.parse(fs.readFileSync("./secrets.json").toString());

/** Main function - uploads images and updates the configuration file for the next step. */
async function main() {
    const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${secrets.account_id}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: secrets.access_key_id,
            secretAccessKey: secrets.secret_access_key,
        },
    });

    await checkBucketExists(r2Client);
    const config: Gallery<ThumbImage> = JSON.parse(fs.readFileSync("intermediate/r2_config_thumb.json").toString());
    for (const series of config) {
        for (const row of series.rows) {
            for (const image of row) {
                await resolveImages( r2Client, image);
            }
        }
    }
    // Now, config is a Gallery<UploadedImage>, as resolveImage added the URLs in-place
    fs.writeFileSync("./intermediate/r2_config_uploaded.json", JSON.stringify(config, null, 4));

    return 0; // success
}

/**
 * Checks whether the R2 bucket exists.
 * @param r2Client The R2 client.
 */
async function checkBucketExists(r2Client: S3Client) {
    try {
        const command = new HeadBucketCommand({Bucket: secrets.bucket_name});
        await r2Client.send(command);
        return console.log(`Found bucket ${secrets.bucket_name}`);
    } catch (error) {
        console.log(`Error fetching bucket: ${error}`);
        process.exit(1);
    }
}

/**
 * Resolves images (thumbnail and full-size) in R2 for an image in the config file. Adds the image's URL to the config
 * image. This may involve uploading images to R2 if they do not already exist there.
 *
 * @param r2Client The R2 client.
 * @param image The image to resolve images for.
 */
async function resolveImages(r2Client: S3Client, image: ThumbImage) {
    if (!await existsInR2(r2Client, image.objectKey)) {
        await uploadToR2(r2Client, image.path, image.objectKey);
    }
    if (!await existsInR2(r2Client, image.thumbObjectKey)) {
        await uploadToR2(r2Client, image.thumbPath, image.thumbObjectKey);
    }
    (image as UploadedImage).r2Url = `https://${secrets.r2_public_url}/${image.objectKey}`;
    (image as UploadedImage).thumbR2URL = `https://${secrets.r2_public_url}/${image.thumbObjectKey}`;
}

/**
 * Checks whether an object already exists in R2.
 *
 * @param r2Client The R2 client.
 * @param objectKey The key for the object.
 * @return Whether that image exists in R2.
 */
async function existsInR2(r2Client: S3Client, objectKey: string): Promise<boolean> {
    try {
        const command = new HeadObjectCommand({
            Bucket: secrets.bucket_name,
            Key: objectKey,
        });
        await r2Client.send(command);
        console.log(`Exists in R2: ${objectKey}`);
        return true;
    } catch (error) {
        if (error.$metadata.httpStatusCode === 404) {
            console.log(`Does not exist in R2: ${objectKey}`);
            return false;
        } else {
            throw error;
        }
    }
}

/**
 * Uploads an object to R2.
 * @param r2Client The R2 client.
 * @param path Path of the file that will be the object.
 * @param objectKey The key for the object.
 */
async function uploadToR2(r2Client: S3Client, path: string, objectKey: string) {
    const command = new PutObjectCommand({
        Bucket: secrets.bucket_name,
        Key: objectKey,
        Body: fs.readFileSync(path),
        ContentType: "image/png",
    });
    console.log(`Uploading to R2: ${objectKey}`);
    await r2Client.send(command);
}

process.exit(await main());