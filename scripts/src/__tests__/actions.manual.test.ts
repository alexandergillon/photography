import { beforeAll, afterAll, beforeEach, afterEach, expect, test, vi } from "vitest";
import path from "path";
import os from "os";
import fs from "fs";
import { randomUUID } from "crypto";
import { addImageSeries, updateImageSeries } from "@/actions";
import { R2Client } from "@/r2/R2Client";
import { assertBytesEqual } from "@/__tests__/__utils__";

const BIRD_PATH = path.join(__dirname, "__images__", "bird.png");
const CAR_PATH = path.join(__dirname, "__images__", "car.png");
const ISLAND_PATH = path.join(__dirname, "__images__", "island.png");
const TRAIN_PATH = path.join(__dirname, "__images__", "train.png");
const HALLWAY_PATH = path.join(__dirname, "__images__", "hallway.png");

const dimensions = {
  bird: {
    width: 1620,
    height: 1080,
  },
  car: {
    width: 1080,
    height: 1350,
  },
  island: {
    width: 1080,
    height: 1080,
  },
  train: {
    width: 1080,
    height: 1080,
  },
  hallway: {
    width: 1080,
    height: 1620,
  }
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
  fs.copyFileSync(imagePath, path.join(tempDir, `B1-${imageName}.png`));

  return tempDir;
}

async function validateImageSeries(manifestLength: number, index: number, seriesUuid: string, imageName: string, imagePath: string) {
  const r2Client = setupR2Client();

  const manifest = await r2Client.getManifest();
  expect(manifest).toBeDefined();
  expect(manifest!.length).toBe(manifestLength);

  const series = manifest![index];
  expect(series.title).toBe("My Images");
  expect(series.uuid).toBe(seriesUuid);
  expect(series.rows.length).toBe(2);

  const rowA = series.rows[0];
  const rowB = series.rows[1];

  expect(rowA.length).toBe(2);
  expect(rowB.length).toBe(1);

  expect(rowA[0].alt).toBe(imageName);
  expect(rowA[1].alt).toBe(imageName);
  expect(rowB[0].alt).toBe(imageName);

  expect(rowA[0].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[0].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[1].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowA[1].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any
  
  expect(rowB[0].width).toBe((dimensions as any)[imageName].width); // eslint-disable-line @typescript-eslint/no-explicit-any
  expect(rowB[0].height).toBe((dimensions as any)[imageName].height); // eslint-disable-line @typescript-eslint/no-explicit-any
  
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
    await r2Client.getByteArray(rowB[0].key),
    imageBytes,
    "png",
    `Add image series test: ${rowB[0].key}`,
  );
  
  const a1ThumbData = await r2Client.getByteArray(rowA[0].thumbKey);
  expect(a1ThumbData).toBeDefined();
  expect(a1ThumbData?.length).toBeGreaterThan(0);

  const a2ThumbData = await r2Client.getByteArray(rowA[1].thumbKey);
  expect(a2ThumbData).toBeDefined();
  expect(a2ThumbData?.length).toBeGreaterThan(0);

  const b1ThumbData = await r2Client.getByteArray(rowB[0].thumbKey);
  expect(b1ThumbData).toBeDefined();
  expect(b1ThumbData?.length).toBeGreaterThan(0);
}

test(
  "Adding image series - without and with existing manifest",
  async () => {
    // no existing manifest 
    let tempDir = setup("bird", BIRD_PATH);
    const series1Uuid = randomUUID();
    await addImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series1Uuid);
    await validateImageSeries(1, 0, series1Uuid, "bird", BIRD_PATH);

    // manifest exists now
    tempDir = setup("car", CAR_PATH);
    const series2Uuid = randomUUID();
    await addImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series2Uuid);
    await validateImageSeries(2, 0, series2Uuid, "car", CAR_PATH);
    await validateImageSeries(2, 1, series1Uuid, "bird", BIRD_PATH);
  },
  TIMEOUT_MILLISECONDS,
);

test(
  "Various inserts + updates",
  async () => {
    let tempDir = setup("bird", BIRD_PATH);
    const series1Uuid = randomUUID();
    await addImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series1Uuid);
    await validateImageSeries(1, 0, series1Uuid, "bird", BIRD_PATH);
    // series1 (bird)

    tempDir = setup("car", CAR_PATH);
    const series2Uuid = randomUUID();
    await addImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series2Uuid);
    await validateImageSeries(2, 0, series2Uuid, "car", CAR_PATH);
    await validateImageSeries(2, 1, series1Uuid, "bird", BIRD_PATH);
    // series2 (car), series1 (bird)

    tempDir = setup("island", ISLAND_PATH);
    const series3Uuid = randomUUID();
    await addImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series3Uuid, series2Uuid);
    await validateImageSeries(3, 0, series2Uuid, "car", CAR_PATH);
    await validateImageSeries(3, 1, series3Uuid, "island", ISLAND_PATH);
    await validateImageSeries(3, 2, series1Uuid, "bird", BIRD_PATH);
    // series2 (car), series3 (island), series1 (bird)

    tempDir = setup("train", TRAIN_PATH)
    const series4Uuid = randomUUID();
    await addImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series4Uuid, series1Uuid);
    await validateImageSeries(4, 0, series2Uuid, "car", CAR_PATH);
    await validateImageSeries(4, 1, series3Uuid, "island", ISLAND_PATH);
    await validateImageSeries(4, 2, series1Uuid, "bird", BIRD_PATH);
    await validateImageSeries(4, 3, series4Uuid, "train", TRAIN_PATH);
    // series2 (car), series3 (island), series1 (bird), series4 (train)

    tempDir = setup("hallway", HALLWAY_PATH)
    await updateImageSeries(process.env.R2_SECRETS_PATH!, tempDir, series3Uuid);
    await validateImageSeries(4, 0, series2Uuid, "car", CAR_PATH);
    await validateImageSeries(4, 1, series3Uuid, "hallway", HALLWAY_PATH);
    await validateImageSeries(4, 2, series1Uuid, "bird", BIRD_PATH);
    await validateImageSeries(4, 3, series4Uuid, "train", TRAIN_PATH);
    // series2 (car), series3 (hallway), series1 (bird), series4 (train)

  },
  TIMEOUT_MILLISECONDS,
);