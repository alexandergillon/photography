import { expect, test } from 'vitest'
import os from 'os';
import fs from 'fs';
import path from 'path';
import { imageSeriesBaseConfig } from "@/utils/image-config";
import { randomUUID } from 'crypto';
import { objectKey } from '@/r2/utils';

function setup() {
  const tempDir = path.join(os.tmpdir(), `image-config-test-${randomUUID()}`);
  fs.mkdirSync(tempDir)

  fs.writeFileSync(path.join(tempDir, 'title.txt'), 'My Images')

  fs.writeFileSync(path.join(tempDir, 'A1-street.png'), 'dummy data')
  fs.writeFileSync(path.join(tempDir, 'A2-lake.png'), 'dummy data')
  fs.writeFileSync(path.join(tempDir, 'A3-mountain.png'), 'dummy data')
  fs.writeFileSync(path.join(tempDir, 'B1-beach.png'), 'dummy data')
  fs.writeFileSync(path.join(tempDir, 'B2-desert.png'), 'dummy data')

  return tempDir
}

test('Image series config is correct', () => {
  const tempDir = setup()
  const seriesUuid = randomUUID()
  const config = imageSeriesBaseConfig(tempDir, seriesUuid)

  expect(config.title).toBe('My Images')
  expect(config.rows.length).toBe(2)

  const row0 = config.rows[0]
  const row1 = config.rows[1]

  expect(row0.length).toBe(3)
  expect(row1.length).toBe(2)

  expect(row0[0].path).toBe(`${tempDir}/A1-street.png`)
  expect(row0[1].path).toBe(`${tempDir}/A2-lake.png`)
  expect(row0[2].path).toBe(`${tempDir}/A3-mountain.png`)

  expect(row1[0].path).toBe(`${tempDir}/B1-beach.png`)
  expect(row1[1].path).toBe(`${tempDir}/B2-desert.png`)

  expect(row0[0].fileName).toBe("A1-street.png")
  expect(row0[1].fileName).toBe("A2-lake.png")
  expect(row0[2].fileName).toBe("A3-mountain.png")

  expect(row1[0].fileName).toBe("B1-beach.png")
  expect(row1[1].fileName).toBe("B2-desert.png")

  expect(row0[0].objectKey).toBe(objectKey(seriesUuid, 'My Images', 'A1-street.png'))
  expect(row0[1].objectKey).toBe(objectKey(seriesUuid, 'My Images', 'A2-lake.png'))
  expect(row0[2].objectKey).toBe(objectKey(seriesUuid, 'My Images', 'A3-mountain.png'))

  expect(row1[0].objectKey).toBe(objectKey(seriesUuid, 'My Images', 'B1-beach.png'))
  expect(row1[1].objectKey).toBe(objectKey(seriesUuid, 'My Images', 'B2-desert.png'))

  expect(row0[0].altText).toBe('street')
  expect(row0[1].altText).toBe('lake')
  expect(row0[2].altText).toBe('mountain')

  expect(row1[0].altText).toBe('beach')
  expect(row1[1].altText).toBe('desert')
})