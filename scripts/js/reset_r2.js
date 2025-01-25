/**
 * @file Script which wipes out everything in R2.
 */
import fs from "fs";
import { S3Client, HeadBucketCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import process from "process";
/**
 * These are not all secrets per se (some are more like configs). But they do contain secrets, so I want to be
 * careful with my naming.
 */
const secrets = JSON.parse(fs.readFileSync("./secrets.json").toString());
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
    await deleteAllR2Objects(r2Client);
    return 0; // success
}
/**
 * Checks whether the R2 bucket exists.
 * @param r2Client The R2 client.
 */
async function checkBucketExists(r2Client) {
    try {
        const command = new HeadBucketCommand({ Bucket: secrets.bucket_name });
        await r2Client.send(command);
        return console.log(`Found bucket ${secrets.bucket_name}`);
    }
    catch (error) {
        console.log(`Error fetching bucket: ${error}`);
        process.exit(1);
    }
}
/**
 * Deletes all objects in R2.
 * @param r2Client The R2 client.
 */
async function deleteAllR2Objects(r2Client) {
    try {
        const listObjectsCommand = new ListObjectsV2Command({
            Bucket: secrets.bucket_name,
        });
        while (true) {
            const response = await r2Client.send(listObjectsCommand);
            if (!response.Contents || response.Contents.length === 0)
                break;
            for (const object of response.Contents) {
                const deleteObjectCommand = new DeleteObjectCommand({
                    Bucket: secrets.bucket_name,
                    Key: object.Key,
                });
                await r2Client.send(deleteObjectCommand);
                console.log(`Deleted object ${object.Key}`);
            }
        }
    }
    catch (error) {
        console.log(`Error deleting objects: ${error}`);
        process.exit(1);
    }
}
process.exit(await main());
