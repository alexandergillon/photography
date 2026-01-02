// Don't want these tests running automatically, as they hit actual R2.
import { afterAll, beforeAll, beforeEach, afterEach, expect, test, vi } from "vitest";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { R2Client } from "@/r2/R2Client";
import type { Manifest, ImageSeries, ThumbImage } from "@/types/config";
import { objectKey } from "@/r2/utils";
import { assertBytesEqual } from "@/__tests__/__utils__";

const BIRD_PATH = path.join(__dirname, "..", "__images__", "bird.png");
const CAT_PATH = path.join(__dirname, "..", "__images__", "cat.jpg");

const TIMEOUT_MILLISECONDS = 120000;

beforeAll(() => {
  vi.mock("config", () => ({
    default: {
      bucketName: "alexandergillon-photography-test",
      manifestKey: "manifest.json",
    },
  }));
});

afterAll(() => {
  vi.resetAllMocks();
});

function setupR2Client() {
  return R2Client.fromSecrets(process.env.R2_SECRETS_PATH!);
}

beforeEach(async () => {
  const r2Client = setupR2Client();
  await r2Client.deleteAll();
});

afterEach(async () => {
  const r2Client = setupR2Client();
  await r2Client.deleteAll();
});

// We want to test this first, as it's used for test setup
test(
  "Test delete all",
  async () => {
    const r2Client = setupR2Client();
    expect(await r2Client.upload("delete-all-1", "test/delete-all-1.txt", "text/plain")).toBe(true);
    expect(await r2Client.getString("test/delete-all-1.txt")).toBe("delete-all-1");
    expect(await r2Client.upload("delete-all-2", "test/delete-all-2.txt", "text/plain")).toBe(true);
    expect(await r2Client.getString("test/delete-all-2.txt")).toBe("delete-all-2");
    expect(await r2Client.upload("delete-all-3", "test/delete-all-3.txt", "text/plain")).toBe(true);
    expect(await r2Client.getString("test/delete-all-3.txt")).toBe("delete-all-3");
    expect(await r2Client.deleteAll()).toBe(true);
    expect(await r2Client.getString("test/delete-all-1.txt")).toBe(undefined);
    expect(await r2Client.getString("test/delete-all-2.txt")).toBe(undefined);
    expect(await r2Client.getString("test/delete-all-3.txt")).toBe(undefined);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test ensure bucket exists",
  async () => {
    const r2Client = setupR2Client();
    await r2Client.ensureBucketExists();
    expect(true).toBe(true);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test upload and gets",
  async () => {
    const r2Client = setupR2Client();

    expect(await r2Client.upload("upload-and-get-1", "test/upload-and-get-1.txt", "text/plain")).toBe(true);
    expect(await r2Client.getString("test/upload-and-get-1.txt")).toBe("upload-and-get-1");

    const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
    expect(await r2Client.upload(buffer, "test/upload-and-get-2", "application/octet-stream")).toBe(true);
    expect(await r2Client.getByteArray("test/upload-and-get-2")).toEqual(new Uint8Array(buffer));

    expect(
      await r2Client.upload(
        JSON.stringify({
          foo: 1,
          bar: 2,
        }),
        "test/upload-and-get-3.json",
        "application/json",
      ),
    ).toBe(true);
    expect(await r2Client.getJsObject<{ foo: number; bar: number }>("test/upload-and-get-3.json")).toEqual({
      foo: 1,
      bar: 2,
    });

    expect(await r2Client.uploadFile(BIRD_PATH, "test/upload-and-get-4.png", "image/png")).toBe(true);
    expect(await r2Client.getByteArray("test/upload-and-get-4.png")).toEqual(
      new Uint8Array(fs.readFileSync(BIRD_PATH)),
    );

    expect(await r2Client.uploadFile("nonexistent-file", "test/upload-and-get-5.png", "image/png")).toBe(false);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test getting/deleting manifest",
  async () => {
    const r2Client = setupR2Client();

    const manifest: Manifest = [
      {
        title: "Series 1",
        uuid: "46c9f8c4-4fce-41a2-b20d-c33158ac95e6",
        rows: [
          [
            {
              key: "1.png",
              thumbKey: "1.jpg",
              alt: "Image 1",
              width: 100,
              height: 100,
            },
            {
              key: "2.png",
              thumbKey: "2.jpg",
              alt: "Image 2",
              width: 100,
              height: 100,
            },
            {
              key: "3.png",
              thumbKey: "3.jpg",
              alt: "Image 3",
              width: 100,
              height: 100,
            },
          ],
          [
            {
              key: "4.png",
              thumbKey: "4.jpg",
              alt: "Image 4",
              width: 100,
              height: 100,
            },
            {
              key: "5.png",
              thumbKey: "5.jpg",
              alt: "Image 5",
              width: 100,
              height: 100,
            },
            {
              key: "6.png",
              thumbKey: "6.jpg",
              alt: "Image 6",
              width: 100,
              height: 100,
            },
          ],
        ],
      },
      {
        title: "Series 2",
        uuid: "7e2d1377-90e1-4cec-9e54-598762e8911c",
        rows: [
          [
            {
              key: "7.png",
              thumbKey: "7.jpg",
              alt: "Image 7",
              width: 100,
              height: 100,
            },
            {
              key: "8.png",
              thumbKey: "8.jpg",
              alt: "Image 8",
              width: 100,
              height: 100,
            },
            {
              key: "9.png",
              thumbKey: "9.jpg",
              alt: "Image 9",
              width: 100,
              height: 100,
            },
          ],
          [
            {
              key: "10.png",
              thumbKey: "10.jpg",
              alt: "Image 10",
              width: 100,
              height: 100,
            },
            {
              key: "11.png",
              thumbKey: "11.jpg",
              alt: "Image 11",
              width: 100,
              height: 100,
            },
          ],
          [
            {
              key: "12.png",
              thumbKey: "12.jpg",
              alt: "Image 12",
              width: 100,
              height: 100,
            },
          ],
        ],
      },
    ];

    expect(await r2Client.uploadManifest(manifest)).toBe(true);
    expect(await r2Client.getManifest()).toEqual(manifest);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test manifest exists",
  async () => {
    const r2Client = setupR2Client();
    expect(await r2Client.manifestExists()).toBe(false);

    const manifest: Manifest = [
      {
        title: "Series 1",
        uuid: "46c9f8c4-4fce-41a2-b20d-c33158ac95e6",
        rows: [
          [
            {
              key: "1.png",
              thumbKey: "1.jpg",
              alt: "Image 1",
              width: 100,
              height: 100,
            },
            {
              key: "2.png",
              thumbKey: "2.jpg",
              alt: "Image 2",
              width: 100,
              height: 100,
            },
            {
              key: "3.png",
              thumbKey: "3.jpg",
              alt: "Image 3",
              width: 100,
              height: 100,
            },
          ],
          [
            {
              key: "4.png",
              thumbKey: "4.jpg",
              alt: "Image 4",
              width: 100,
              height: 100,
            },
            {
              key: "5.png",
              thumbKey: "5.jpg",
              alt: "Image 5",
              width: 100,
              height: 100,
            },
            {
              key: "6.png",
              thumbKey: "6.jpg",
              alt: "Image 6",
              width: 100,
              height: 100,
            },
          ],
        ],
      },
      {
        title: "Series 2",
        uuid: "7e2d1377-90e1-4cec-9e54-598762e8911c",
        rows: [
          [
            {
              key: "7.png",
              thumbKey: "7.jpg",
              alt: "Image 7",
              width: 100,
              height: 100,
            },
            {
              key: "8.png",
              thumbKey: "8.jpg",
              alt: "Image 8",
              width: 100,
              height: 100,
            },
            {
              key: "9.png",
              thumbKey: "9.jpg",
              alt: "Image 9",
              width: 100,
              height: 100,
            },
          ],
          [
            {
              key: "10.png",
              thumbKey: "10.jpg",
              alt: "Image 10",
              width: 100,
              height: 100,
            },
            {
              key: "11.png",
              thumbKey: "11.jpg",
              alt: "Image 11",
              width: 100,
              height: 100,
            },
          ],
          [
            {
              key: "12.png",
              thumbKey: "12.jpg",
              alt: "Image 12",
              width: 100,
              height: 100,
            },
          ],
        ],
      },
    ];

    expect(await r2Client.uploadManifest(manifest)).toBe(true);
    expect(await r2Client.manifestExists()).toBe(true);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test getting/deleting image series",
  async () => {
    const r2Client = setupR2Client();
    const seriesUuid = randomUUID();
    const seriesName = "test-get-delete-image-series";

    for (let i = 0; i < 10; i++) {
      expect(await r2Client.uploadFile(BIRD_PATH, objectKey(seriesUuid, seriesName, `${i}.png`), "image/png")).toBe(
        true,
      );
    }

    const imageSeries = await r2Client.getImageSeries(seriesUuid);
    expect(imageSeries.length).toBe(10);

    function seriesContainsKey(key: string) {
      return imageSeries.some((imageKey) => imageKey === key);
    }

    for (let i = 0; i < 10; i++) {
      expect(seriesContainsKey(objectKey(seriesUuid, seriesName, `${i}.png`))).toBe(true);
    }

    expect(await r2Client.deleteImageSeries(seriesUuid)).toBe(true);
    expect(await r2Client.getImageSeries(seriesUuid)).toEqual([]);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test upload image series",
  async () => {
    const r2Client = setupR2Client();
    const seriesUuid = randomUUID();
    const seriesName = "test-upload-image-series";

    const imageSeries: ImageSeries<ThumbImage> = {
      title: "Test Series",
      uuid: seriesUuid,
      rows: [
        [
          {
            objectKey: objectKey(seriesUuid, seriesName, "test-upload-image-series-1.png"),
            thumbObjectKey: objectKey(seriesUuid, seriesName, "test-upload-image-series-1-thumb.jpg"),
            path: BIRD_PATH,
            fileName: "test-upload-image-series-1.png",
            thumbPath: CAT_PATH,
            thumbFileName: "test-upload-image-series-1-thumb.jpg",
            altText: "bird-cat",
          },
          {
            objectKey: objectKey(seriesUuid, seriesName, "test-upload-image-series-2.png"),
            thumbObjectKey: objectKey(seriesUuid, seriesName, "test-upload-image-series-2-thumb.jpg"),
            path: BIRD_PATH,
            fileName: "test-upload-image-series-2.png",
            thumbPath: CAT_PATH,
            thumbFileName: "test-upload-image-series-2-thumb.jpg",
            altText: "bird-cat",
          },
          {
            objectKey: objectKey(seriesUuid, seriesName, "test-upload-image-series-3.png"),
            thumbObjectKey: objectKey(seriesUuid, seriesName, "test-upload-image-series-3-thumb.jpg"),
            path: BIRD_PATH,
            fileName: "test-upload-image-series-3.png",
            thumbPath: CAT_PATH,
            thumbFileName: "test-upload-image-series-3-thumb.jpg",
            altText: "bird-cat",
          },
        ],
      ],
    };

    expect(await r2Client.uploadImageSeries(imageSeries)).toBe(true);

    const birdBytes = new Uint8Array(fs.readFileSync(BIRD_PATH));
    const catBytes = new Uint8Array(fs.readFileSync(CAT_PATH));
    for (const row of imageSeries.rows) {
      for (const img of row) {
        assertBytesEqual(
          await r2Client.getByteArray(img.objectKey),
          birdBytes,
          "png",
          `Image series upload test: ${img.objectKey}`,
        );
        assertBytesEqual(
          await r2Client.getByteArray(img.thumbObjectKey),
          catBytes,
          "jpg",
          `Image series upload test: ${img.thumbObjectKey}`,
        );
      }
    }
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Test delete",
  async () => {
    const r2Client = setupR2Client();

    expect(await r2Client.upload("upload-and-get-1", "test/upload-and-get-1.txt", "text/plain")).toBe(true);
    expect(await r2Client.getString("test/upload-and-get-1.txt")).toBe("upload-and-get-1");

    expect(await r2Client.delete("test/upload-and-get-1.txt")).toBe(true);
    expect(await r2Client.getString("test/upload-and-get-1.txt")).toBe(undefined);
  },
  TIMEOUT_MILLISECONDS,
);
