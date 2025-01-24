/**
 * @file Second script in a 'pipeline' of processing scripts to turn a directory-based
 * arrangement of images into a configuration for the website. This scripts reads in
 * the config from the last script and uploades the appropriate images to R2 if they
 * are not already there.
 *
 * Outputs an updated configuration file with R2 links that is used by the next script.
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
    const config: Gallery<BaseImage> = JSON.parse(fs.readFileSync("intermediate/r2_config.json").toString());
    for (const series of config) {
        for (const row of series.rows) {
            for (const image of row) {
                await resolveImage( r2Client, image);
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
 * Resolves the image in R2 for an image in the config file. Adds the image's URL to the config image. This may
 * involve uploading the image to R2 if it does not already exist there.
 *
 * @param r2Client The R2 client.
 * @param image The image to resolve.
 */
async function resolveImage(r2Client: S3Client, image: BaseImage) {
    if (!await existsInR2(r2Client, image)) {
        await uploadToR2(r2Client, image);
    }
    (image as UploadedImage).r2Url = `https://${secrets.r2_public_url}/${image.objectName}`;
}

/**
 * Checks whether an image already exists in R2.
 *
 * @param r2Client The R2 client.
 * @param image The image to check.
 * @return Whether that image exists in R2.
 */
async function existsInR2(r2Client: S3Client, image: BaseImage): Promise<boolean> {
    try {
        const command = new HeadObjectCommand({
            Bucket: secrets.bucket_name,
            Key: image.objectName,
        });
        await r2Client.send(command);
        console.log(`Exists in R2: ${image.objectName}`);
        return true;
    } catch (error) {
        if (error.$metadata.httpStatusCode === 404) {
            console.log(`Does not exist in R2: ${image.objectName}`);
            return false;
        } else {
            throw error;
        }
    }
}

/**
 * Uploads an image to R2.
 * @param r2Client The R2 client.
 * @param image The image to upload.
 */
async function uploadToR2(r2Client: S3Client, image: BaseImage) {
    const command = new PutObjectCommand({
        Bucket: secrets.bucket_name,
        Key: image.objectName,
        Body: fs.readFileSync(image.path),
        ContentType: "image/png",
    });
    console.log(`Uploading to R2: ${image.objectName}`);
    await r2Client.send(command);
}

process.exit(await main());