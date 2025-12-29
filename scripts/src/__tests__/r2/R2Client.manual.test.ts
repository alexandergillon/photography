// Don't want these tests running automatically, as they hit actual R2.
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import fs from "fs"
import path from 'path'
import { randomUUID } from 'crypto'
import { R2Client } from '@/r2/R2Client'
import { Manifest } from '@/types/config'
import { objectKey } from '@/r2/utils'

const BIRD_PATH = path.join(__dirname, "..", "__bird__.png")
const TIMEOUT_MILLISECONDS = 120000

beforeAll(() => {
  vi.mock("config", () => ({ 
    default: {
      "bucketName": "alexandergillon-photography-test",
      "manifestKey": "manifest.json"
    }
  }))
})

afterAll(() => {
  const r2Client = setupR2Client()
  r2Client.deleteAll()
  vi.resetAllMocks()
})

function setupR2Client() {
  return R2Client.fromSecrets(process.env.R2_SECRETS_PATH!)
}

beforeEach(async () => {
  const r2Client = setupR2Client()
  await r2Client.deleteAll()
})

// We want to test this first, as it's used for test setup
test("Test delete all", async () => {
  const r2Client = setupR2Client()
  expect(await r2Client.upload("delete-all-1", "test/delete-all-1.txt", "text/plain")).toBe(true)
  expect(await r2Client.getString("test/delete-all-1.txt")).toBe("delete-all-1")
  expect(await r2Client.upload("delete-all-2", "test/delete-all-2.txt", "text/plain")).toBe(true)
  expect(await r2Client.getString("test/delete-all-2.txt")).toBe("delete-all-2")
  expect(await r2Client.upload("delete-all-3", "test/delete-all-3.txt", "text/plain")).toBe(true)
  expect(await r2Client.getString("test/delete-all-3.txt")).toBe("delete-all-3")
  expect(await r2Client.deleteAll()).toBe(true)
  expect(await r2Client.getString("test/delete-all-1.txt")).toBe(undefined)
  expect(await r2Client.getString("test/delete-all-2.txt")).toBe(undefined)
  expect(await r2Client.getString("test/delete-all-3.txt")).toBe(undefined)
}, TIMEOUT_MILLISECONDS)

test("Test ensure bucket exists", async () => {
  const r2Client = setupR2Client()
  await r2Client.ensureBucketExists()
  expect(true).toBe(true)
}, TIMEOUT_MILLISECONDS)

test("Test upload and gets", async () => {
  const r2Client = setupR2Client()

  expect(await r2Client.upload("upload-and-get-1", "test/upload-and-get-1.txt", "text/plain")).toBe(true)
  expect(await r2Client.getString("test/upload-and-get-1.txt")).toBe("upload-and-get-1")

  const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])
  expect(await r2Client.upload(buffer, "test/upload-and-get-2", "application/octet-stream")).toBe(true)
  expect(await r2Client.getByteArray("test/upload-and-get-2")).toEqual(new Uint8Array(buffer))

  expect(await r2Client.upload(JSON.stringify({
    foo: 1,
    bar: 2,
  }), "test/upload-and-get-3.json", "application/json")).toBe(true)
  expect(await r2Client.getJsObject<{ foo: number, bar: number }>("test/upload-and-get-3.json")).toEqual({ foo: 1, bar: 2 })

  expect(await r2Client.uploadFile(BIRD_PATH, "test/upload-and-get-4.png", "image/png")).toBe(true)
  expect(await r2Client.getByteArray("test/upload-and-get-4.png")).toEqual(new Uint8Array(fs.readFileSync(BIRD_PATH)))

  expect(await r2Client.uploadFile("nonexistent-file", "test/upload-and-get-5.png", "image/png")).toBe(false)
}, TIMEOUT_MILLISECONDS)

test("Test getting/deleting manifest", async () => {
  const r2Client = setupR2Client()

  const manifest: Manifest = [
    {
      title: "Series 1",
      rows: [
        [ 
          { src: "test/1.png", thumb: "test/1.jpg", alt: "Image 1", width: 100, height: 100 },
          { src: "test/2.png", thumb: "test/2.jpg", alt: "Image 2", width: 100, height: 100 },
          { src: "test/3.png", thumb: "test/3.jpg", alt: "Image 3", width: 100, height: 100 },
        ],
        [
          { src: "test/4.png", thumb: "test/4.jpg", alt: "Image 4", width: 100, height: 100 },
          { src: "test/5.png", thumb: "test/5.jpg", alt: "Image 5", width: 100, height: 100 },
          { src: "test/6.png", thumb: "test/6.jpg", alt: "Image 6", width: 100, height: 100 },
        ]
      ]
    },
    {
      title: "Series 2",
      rows: [
        [
          { src: "test/7.png", thumb: "test/7.jpg", alt: "Image 7", width: 100, height: 100 },
          { src: "test/8.png", thumb: "test/8.jpg", alt: "Image 8", width: 100, height: 100 },
          { src: "test/9.png", thumb: "test/9.jpg", alt: "Image 9", width: 100, height: 100 },
        ],
        [
          { src: "test/10.png", thumb: "test/10.jpg", alt: "Image 10", width: 100, height: 100 },
          { src: "test/11.png", thumb: "test/11.jpg", alt: "Image 11", width: 100, height: 100 },
        ],
        [
          { src: "test/12.png", thumb: "test/12.jpg", alt: "Image 12", width: 100, height: 100 },
        ],
      ]
    }
  ]

  expect(await r2Client.uploadManifest(manifest)).toBe(true)
  expect(await r2Client.getManifest()).toEqual(manifest)
}, TIMEOUT_MILLISECONDS)

test("Test getting/deleting image series", async () => {
  const r2Client = setupR2Client()
  const seriesUuid = randomUUID()
  const seriesName = "test-get-delete-image-series"

  for (let i = 0; i < 10; i++) {
    expect(await r2Client.uploadFile(BIRD_PATH, objectKey(seriesUuid, seriesName, `${i}.png`), "image/png")).toBe(true)
  }

  const imageSeries = await r2Client.getImageSeries(seriesUuid)
  expect(imageSeries.length).toBe(10)

  function seriesContainsKey(key: string) {
    return imageSeries.some((imageKey) => imageKey === key)
  }
  
  for (let i = 0; i < 10; i++) {
    expect(seriesContainsKey(objectKey(seriesUuid, seriesName, `${i}.png`))).toBe(true)
  }

  expect(await r2Client.deleteImageSeries(seriesUuid)).toBe(true)
  expect(await r2Client.getImageSeries(seriesUuid)).toEqual([])
}, TIMEOUT_MILLISECONDS)

test("Test delete", async () => {
  const r2Client = setupR2Client()

  expect(await r2Client.upload("upload-and-get-1", "test/upload-and-get-1.txt", "text/plain")).toBe(true)
  expect(await r2Client.getString("test/upload-and-get-1.txt")).toBe("upload-and-get-1")

  expect(await r2Client.delete("test/upload-and-get-1.txt")).toBe(true)
  expect(await r2Client.getString("test/upload-and-get-1.txt")).toBe(undefined)
}, TIMEOUT_MILLISECONDS)