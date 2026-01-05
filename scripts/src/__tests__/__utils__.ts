import { expect } from "vitest";
import path from "path";
import os from "os";
import fs from "fs";
import { randomUUID } from "crypto";

/**
 * Utility for comparing two byte arrays.
 * @param got First byte array
 * @param expected Second byte array
 * @param extension File extension for what the bytes are
 * @param message Message to include in an error
 */
export function assertBytesEqual(
  got: Uint8Array | undefined,
  expected: Uint8Array | undefined,
  extension: string,
  message: string,
): void {
  if (got === undefined && expected === undefined) return;

  if (got === undefined) {
    console.error(`
      While testing: ${message}
      Got undefined, expected ${expected?.length} bytes
    `);
    expect(false).toBe(true);
  }

  if (expected === undefined) {
    console.error(`
      While testing: ${message}
      Got ${got?.length} bytes, expected undefined
    `);
    expect(false).toBe(true);
  }

  if (got?.length != expected?.length) {
    console.error(`
      While testing: ${message}
      Got ${got?.length} bytes, expected ${expected?.length} bytes
    `);
    expect(false).toBe(true);
  }

  for (let i = 0; i < got!.length; i++) {
    if (got![i] !== expected![i]) {
      const tempDir = path.join(os.tmpdir(), `debug-${randomUUID()}`);
      const gotPath = path.join(tempDir, `got.${extension}`);
      const expectedPath = path.join(tempDir, `expected.${extension}`);
      fs.mkdirSync(tempDir);
      fs.writeFileSync(gotPath, got!);
      fs.writeFileSync(expectedPath, expected!);

      console.error(`
        While testing: ${message}

        Got different byte arrays. Arrays have been saved to:
        ${gotPath}
        ${expectedPath}
      `);
      expect(false).toBe(true);
    }
  }
}
