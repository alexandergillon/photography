import { expect, test } from "vitest";
import os from "os";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { imageSeriesBaseConfig } from "@/utils/image-config";
import { imageSeriesThumbs } from "@/utils/thumbnails";
import { objectKey } from "@/r2/utils";

const BIRD_PATH = path.join(__dirname, "..", "__images__", "bird.png");

function setup() {
  const tempDir = path.join(os.tmpdir(), `thumbnails-test-${randomUUID()}`);
  fs.mkdirSync(tempDir);

  fs.writeFileSync(path.join(tempDir, "title.txt"), "My Images");
  fs.copyFileSync(BIRD_PATH, path.join(tempDir, "A1-bird.png"));

  return tempDir;
}

test("Image series thumbnails are correct", async () => {
  const tempDir = setup();
  const seriesUuid = randomUUID();
  const config = imageSeriesBaseConfig(tempDir, seriesUuid);
  const thumbConfig = await imageSeriesThumbs(tempDir, seriesUuid, config);

  expect(thumbConfig.title).toBe("My Images");
  expect(thumbConfig.uuid).toBe(seriesUuid);
  expect(thumbConfig.rows.length).toBe(1);
  expect(thumbConfig.rows[0].length).toBe(1);

  const imageConfig = thumbConfig.rows[0][0];

  expect(imageConfig.path).toBe(`${tempDir}/A1-bird.png`);
  expect(imageConfig.fileName).toBe("A1-bird.png");
  expect(imageConfig.objectKey).toBe(objectKey(seriesUuid, "My Images", "A1-bird.png"));
  expect(imageConfig.altText).toBe("bird");

  expect(imageConfig.thumbPath).toBe(`${tempDir}/A1-bird-thumb.jpg`);
  expect(imageConfig.thumbFileName).toBe("A1-bird-thumb.jpg");
  expect(imageConfig.thumbObjectKey).toBe(objectKey(seriesUuid, "My Images", "A1-bird-thumb.jpg"));

  expect(fs.existsSync(imageConfig.thumbPath)).toBe(true);
  expect(fs.statSync(imageConfig.thumbPath).size).toBeGreaterThan(0);
});

test("Already-existing thumbnail does not cause problems", async () => {
  const tempDir = setup();
  const seriesUuid = randomUUID();
  const config = imageSeriesBaseConfig(tempDir, seriesUuid);
  const thumbConfig = await imageSeriesThumbs(tempDir, seriesUuid, config);
  const thumbConfig2 = await imageSeriesThumbs(tempDir, seriesUuid, config);

  expect(thumbConfig).toEqual(thumbConfig2);
});
