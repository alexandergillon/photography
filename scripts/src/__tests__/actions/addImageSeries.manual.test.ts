import { beforeAll, afterAll, beforeEach, afterEach, expect, test, vi } from "vitest";
import path from "path";
import os from "os";
import fs from "fs";
import { randomUUID } from "crypto";
import { addImageSeries } from "@/actions/addImageSeries";
import { R2Client } from "@/r2/R2Client";
import { assertBytesEqual } from "@/__tests__/__utils__";

const BIRD_PATH = path.join(__dirname, "..", "__bird__.png");
const CAR_PATH = path.join(__dirname, "..", "__car__.png");

const dimensions = {
  bird: {
    width: 1620,
    height: 1080,
  },
  car: {
    width: 1080,
    height: 1350,
  },
};

const TIMEOUT_MILLISECONDS = 300000;

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

function setup(imageName: string, imagePath: string) {
  const tempDir = path.join(os.tmpdir(), `image-config-test-${randomUUID()}`);
  fs.mkdirSync(tempDir);

  fs.writeFileSync(path.join(tempDir, "title.txt"), "My Images");

  fs.copyFileSync(imagePath, path.join(tempDir, `A1-${imageName}.png`));
  fs.copyFileSync(imagePath, path.join(tempDir, `A2-${imageName}.png`));
  fs.copyFileSync(imagePath, path.join(tempDir, `A3-${imageName}.png`));
  fs.copyFileSync(imagePath, path.join(tempDir, `B1-${imageName}.png`));
  fs.copyFileSync(imagePath, path.join(tempDir, `B2-${imageName}.png`));

  return tempDir;
}

async function validateImageSeries(manifestLength: number, index: number, imageName: string, imagePath: string) {
  const r2Client = setupR2Client();

  const manifest = await r2Client.getManifest();
  expect(manifest).toBeDefined();
  expect(manifest!.length).toBe(manifestLength + 1);

  const series = manifest![index];
  expect(series.title).toBe("My Images");
  expect(series.rows.length).toBe(2);

  const rowA = series.rows[0];
  const rowB = series.rows[1];

  expect(rowA.length).toBe(3);
  expect(rowB.length).toBe(2);

  expect(rowA[0].alt).toBe(imageName);
  expect(rowA[1].alt).toBe(imageName);
  expect(rowA[2].alt).toBe(imageName);
  expect(rowB[0].alt).toBe(imageName);
  expect(rowB[1].alt).toBe(imageName);

  expect(rowA[0].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[0].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[1].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[1].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[2].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[2].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any

  expect(rowB[0].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowB[0].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowB[1].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowB[1].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any

  const imageBytes = new Uint8Array(fs.readFileSync(imagePath));
  assertBytesEqual(
    await r2Client.getByteArray(rowA[0].key),
    imageBytes,
    "png",
    `Add image series test: ${rowA[0].key}`,
  );
  assertBytesEqual(
    await r2Client.getByteArray(rowA[1].key),
    imageBytes,
    "png",
    `Add image series test: ${rowA[1].key}`,
  );
  assertBytesEqual(
    await r2Client.getByteArray(rowA[2].key),
    imageBytes,
    "png",
    `Add image series test: ${rowA[2].key}`,
  );
  assertBytesEqual(
    await r2Client.getByteArray(rowB[0].key),
    imageBytes,
    "png",
    `Add image series test: ${rowB[0].key}`,
  );
  assertBytesEqual(
    await r2Client.getByteArray(rowB[1].key),
    imageBytes,
    "png",
    `Add image series test: ${rowB[1].key}`,
  );

  const a1ThumbData = await r2Client.getByteArray(rowA[0].thumbKey);
  expect(a1ThumbData).toBeDefined();
  expect(a1ThumbData?.length).toBeGreaterThan(0);

  const a2ThumbData = await r2Client.getByteArray(rowA[1].thumbKey);
  expect(a2ThumbData).toBeDefined();
  expect(a2ThumbData?.length).toBeGreaterThan(0);

  const a3ThumbData = await r2Client.getByteArray(rowA[2].thumbKey);
  expect(a3ThumbData).toBeDefined();
  expect(a3ThumbData?.length).toBeGreaterThan(0);

  const b1ThumbData = await r2Client.getByteArray(rowB[0].thumbKey);
  expect(b1ThumbData).toBeDefined();
  expect(b1ThumbData?.length).toBeGreaterThan(0);

  const b2ThumbData = await r2Client.getByteArray(rowB[1].thumbKey);
  expect(b2ThumbData).toBeDefined();
  expect(b2ThumbData?.length).toBeGreaterThan(0);
}

test(
  "Adding image series works correctly when no manifest exists",
  async () => {
    const tempDir = setup("bird", BIRD_PATH);
    await addImageSeries(tempDir, process.env.R2_SECRETS_PATH!);
    await validateImageSeries(0, 0, "bird", BIRD_PATH);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Adding image series works correctly when manifest exists",
  async () => {
    let tempDir = setup("bird", BIRD_PATH);
    await addImageSeries(tempDir, process.env.R2_SECRETS_PATH!);
    await validateImageSeries(0, 0, "bird", BIRD_PATH);

    tempDir = setup("car", CAR_PATH);
    await addImageSeries(tempDir, process.env.R2_SECRETS_PATH!);
    await validateImageSeries(1, 0, "car", CAR_PATH);
    await validateImageSeries(1, 1, "bird", BIRD_PATH);
  },
  TIMEOUT_MILLISECONDS,
);
