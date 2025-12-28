/**
 * @file Contains a client class for interacting with R2, with various utilities attached.
 */

import config from "config"
import fs from "fs"
import { S3Client, HeadBucketCommand, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { Manifest } from "@/types/config"

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
   * Checks whether the R2 bucket, as specified in the config, exists. If it doesn't, exits.
   */
  async ensureBucketExists(): Promise<void> {
    try {
      console.log(`Checking for bucket ${config.bucketName}`)
      const command = new HeadBucketCommand({ Bucket: config.bucketName })
      await this.r2Client.send(command)
      console.log(`Found bucket ${config.bucketName}`)
    } catch (error) {
      console.log(`Error fetching bucket: ${error}`)
      process.exit(1)
    }
  }

  /**
   * Fetches the manifest from R2.
   * @returns The manifest, or undefined if it doesn't exist / an error occurred.
   */
  async getManifest(): Promise<Manifest | undefined> {
    try {
      console.log(`Fetching ${config.manifestKey} from R2`)
      const command = new GetObjectCommand({
        Bucket: config.bucketName,
        Key: config.manifestKey,
      })
      const response = await this.r2Client.send(command)

      if (response.Body) {
        return JSON.parse(await response.Body.transformToString())
      } else {
        console.log(`Error fetching ${config.manifestKey} from R2: body is empty`)
        return undefined
      }
    } catch (error) {
      console.log(`Error fetching ${config.manifestKey} from R2: ${error}`)
      return undefined
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
      console.log(`Error uploading ${objectKey} to R2: ${error}`)
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
   * Deletes all objects in R2. USE WITH EXTREME CAUTION.
   */
  async deleteAll(): Promise<boolean> {
    try {
      const listObjectsCommand = new ListObjectsV2Command({ Bucket: config.bucketName })

      // ListObjectsV2Command only returns up to 1000 objects, so we need to keep calling it until it returns nothing
      while (true) {
        const response = await this.r2Client.send(listObjectsCommand)
        if (!response.Contents || response.Contents.length === 0) break

        for (const object of response.Contents) {
          const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: config.bucketName,
            Key: object.Key,
          })
          await this.r2Client.send(deleteObjectCommand)
          console.log(`Deleted object ${object.Key}`)
        }
      }
    } catch (error) {
      console.log(`Error deleting objects: ${error}`)
      return false
    }
    return true
  }
}