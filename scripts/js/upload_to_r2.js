import fs from "fs";
import { S3Client, HeadBucketCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import process from "process";
const secrets = JSON.parse(fs.readFileSync("./secrets.json").toString());
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
    const config = JSON.parse(fs.readFileSync("intermediate/r2_config.json").toString());
    for (const series of config) {
        for (const row of series.rows) {
            for (const image of row) {
                await resolveImage(r2Client, image);
            }
        }
    }
    // Now, config is a Gallery<UploadedImage>, as resolveImage added the URLs in-place
    fs.writeFileSync("./intermediate/r2_config_uploaded.json", JSON.stringify(config, null, 4));
    return 0; // success
}
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
async function resolveImage(r2Client, image) {
    if (!await existsInR2(r2Client, image)) {
        await uploadToR2(r2Client, image);
    }
    image.r2Url = `${secrets.r2_public_url}/${image.objectName}`;
}
async function existsInR2(r2Client, image) {
    try {
        const command = new HeadObjectCommand({
            Bucket: secrets.bucket_name,
            Key: image.objectName,
        });
        await r2Client.send(command);
        console.log(`Exists in R2: ${image.objectName}`);
        return true;
    }
    catch (error) {
        if (error.$metadata.httpStatusCode === 404) {
            console.log(`Does not exist in R2: ${image.objectName}`);
            return false;
        }
        else {
            throw error;
        }
    }
}
async function uploadToR2(r2Client, image) {
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
