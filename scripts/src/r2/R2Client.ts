/**
 * @file Contains a client class for interacting with R2, with various utilities attached.
 */

import config from "config"
import fs from "fs"
import { S3Client, HeadBucketCommand, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3"
import type { Manifest, ThumbImage, ImageSeries } from "@/types/config"

/**
 * Client class for interacting with R2.
 */
export class R2Client {
  /** Core R2 client. */
  private r2Client: S3Client

  /**
   * Creates a new R2 client.
   * @param accountId R2 account ID.
   * @param accessKeyId R2 access key ID.
   * @param secretAccessKey R2 secret access key.
   */
  constructor(accountId: string, accessKeyId: string, secretAccessKey: string) {
    this.r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
      },
    })
  }

  /**
   * Creates a new R2 client from a secrets file.
   * @param secretsPath Path to secrets file.
   * @returns R2 client.
   */
  static fromSecrets(secretsPath: string): R2Client {
    const secrets: { accountId: string, accessKeyId: string, secretAccessKey: string } = JSON.parse(fs.readFileSync(secretsPath).toString());
    
    if (!secrets.accountId || !secrets.accessKeyId || !secrets.secretAccessKey) {
      throw new Error("Secrets file is missing required fields")
    }

    return new R2Client(secrets.accountId, secrets.accessKeyId, secrets.secretAccessKey)
  }

  /**
   * Checks whether the R2 bucket, as specified in the config, exists. If it doesn't, exits.
   */
  async ensureBucketExists(): Promise<void> {
    try {
      console.log(`Checking for bucket ${config.bucketName}`)
      const command = new HeadBucketCommand({ Bucket: config.bucketName })
      await this.r2Client.send(command)
      console.log(`Found bucket ${config.bucketName}`)
    } catch (error) {
      console.error(`Error fetching bucket: ${error}`)
      process.exit(1)
    }
  }

  /**
   * Fetches an object from R2.
   * @param objectKey Object key.
   * @returns The object, or undefined if it doesn't exist / an error occurred.
   */
  private async get(objectKey: string) {
    console.log(`Fetching ${objectKey} from R2`)
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
      })
      const response = await this.r2Client.send(getObjectCommand)

      if (response.Body) {
        return response.Body
      } else {
        console.error(`Error fetching ${objectKey} from R2: body is empty`)
        return undefined
      }
    } catch (error) {
      console.error(`Error fetching ${objectKey} from R2: ${error}`)
      return undefined
    }
  }

  /**
   * Fetches an object from R2, as a string.
   * @param objectKey Object key.
   * @returns The string, or undefined if it doesn't exist / an error occurred.
   */
  async getString(objectKey: string): Promise<string | undefined> {
    const response = await this.get(objectKey)
    if (response) return response.transformToString()
    return undefined
  }

  /**
   * Fetches an object from R2, as a byte array.
   * @param objectKey Object key.
   * @returns The byte array, or undefined if it doesn't exist / an error occurred.
   */
  async getByteArray(objectKey: string): Promise<Uint8Array | undefined> {
    const response = await this.get(objectKey)
    if (response) return response.transformToByteArray()
    return undefined
  }

  /**
   * Fetches an object from R2, parsed as a JSON object.
   * @param objectKey Object key.
   * @returns The JSON object, or undefined if it doesn't exist / an error occurred.
   */
  async getJsObject<T>(objectKey: string): Promise<T | undefined> {
    const response = await this.get(objectKey)
    if (response) return JSON.parse(await response.transformToString())
    return undefined
  }

  /**
   * Fetches the manifest from R2.
   * @returns The manifest, or undefined if it doesn't exist / an error occurred.
   */
  async getManifest(): Promise<Manifest | undefined> {
    return this.getJsObject<Manifest>(config.manifestKey)
  }

  /**
   * Fetches all object keys for an image series, up to 1000.
   * @param seriesUuid UUID of the image series.
   * @returns All keys for the image series.
   */
  async getImageSeries(seriesUuid: string): Promise<Array<string>> {
    try {
      const listObjectsCommand = new ListObjectsV2Command({ Bucket: config.bucketName, Prefix: seriesUuid })
      const response = await this.r2Client.send(listObjectsCommand)
      if (!response.Contents) return []

      if (response.Contents.length >= 1000) {
        console.warn(`Found ${response.Contents.length} objects for ${seriesUuid}, which is at/over the Cloudflare limit. Results may be truncated.`)
      }

      return response.Contents.map(object => object.Key).filter(key => {
        if (key === undefined) console.error(`Found undefined key when listing ${seriesUuid}`)
        return key !== undefined
      })
    } catch (error) {
      throw new Error(`Error fetching ${seriesUuid} from R2: ${error}`)
    }
  }

  /**
   * Uploads a blob to R2.
   * @param blob Blob to upload.
   * @param objectKey Object key for the blob in R2.
   * @param contentType Content type of the blob.
   * @returns True if the upload was successful, false otherwise.
   */
  async upload(blob: any, objectKey: string, contentType: string): Promise<boolean> {
    try {
      const command = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
        Body: blob,
        ContentType: contentType,
      })
      await this.r2Client.send(command)
      return true
    } catch (error) {
      console.error(`Error uploading ${objectKey} to R2: ${error}`)
      return false
    }
  }

  /**
   * Uploads a file to R2.
   * @param path Path to the file on disk.
   * @param objectKey Object key for the file in R2.
   * @param contentType Content type of the file.
   * @returns True if the upload was successful, false otherwise.
   */
  async uploadFile(path: string, objectKey: string, contentType: string): Promise<boolean> {
    console.log(`Uploading ${objectKey} to R2 (${path})`)
    if (!fs.existsSync(path)) {
      console.error(`File ${path} does not exist`)
      return false
    }
    return this.upload(fs.readFileSync(path), objectKey, contentType)
  }

  /**
   * Uploads the manifest to R2.
   * @param manifest The manifest to upload.
   * @returns True if the upload was successful, false otherwise.
   */
  async uploadManifest(manifest: Manifest): Promise<boolean> {
    console.log(`Uploading ${config.manifestKey} to R2`)
    return this.upload(JSON.stringify(manifest), config.manifestKey, "application/json")
  }

  /**
   * Uploads all images and thumbnails in an image series to R2. Does not update the manifest.
   * @param imageSeries Image series.
   * @returns True if all uploads were successful, false otherwise.
   */
  async uploadImageSeries(imageSeries: ImageSeries<ThumbImage>): Promise<boolean> {
    console.log(`Uploading image series ${imageSeries.title} to R2`);

    let success = true
    for (const row of imageSeries.rows) {
      for (const image of row) {
        const uploaded = await this.uploadFile(image.path, image.objectKey, "image/png")
        if (!uploaded) success = false
        const thumbUploaded = await this.uploadFile(image.thumbPath, image.thumbObjectKey, "image/jpeg")
        if (!thumbUploaded) success = false
      }
    }
    return success;
  }

  /**
   * Deletes an object from R2.
   * @param key Key for the object in R2.
   * @returns True if the deletion was successful, false otherwise.
   */
  async delete(key: string): Promise<boolean> {
    try {
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
      await this.r2Client.send(deleteObjectCommand)
      console.log(`Deleted object ${key}`)
      return true
    } catch (error) {
      console.error(`Error deleting ${key} from R2: ${error}`)
      return false
    }
  }

  /**
   * Deletes an image series from R2.
   * @param seriesUuid UUID of the image series.
   * @returns True if the deletion was successful, false otherwise.
   */
  async deleteImageSeries(seriesUuid: string): Promise<boolean> {
    try {
      let success = true
      for (const key of await this.getImageSeries(seriesUuid)) {
        const deleted = await this.delete(key)
        if (!deleted) success = false
      }
      return success
    } catch (error) {
      console.error(`Error deleting ${seriesUuid} from R2: ${error}`)
      return false
    }
  }

  /**
   * Deletes all objects in R2. USE WITH EXTREME CAUTION.
   */
  async deleteAll(): Promise<boolean> {
    let success = true
    try {
      const listObjectsCommand = new ListObjectsV2Command({ Bucket: config.bucketName })

      // ListObjectsV2Command only returns up to 1000 objects, so we need to keep calling it until it returns nothing
      while (true) {
        const response = await this.r2Client.send(listObjectsCommand)
        if (!response.Contents || response.Contents.length === 0) break

        for (const object of response.Contents) {
          if (object.Key === undefined) {
            console.error(`Found undefined key when listing ${config.bucketName}`)
            success = false
            continue
          }
          const deleted = await this.delete(object.Key)
          success &&= deleted
        }
      }
    } catch (error) {
      console.error(`Error deleting objects: ${error}`)
      success = false
    }
    return success
  }
}