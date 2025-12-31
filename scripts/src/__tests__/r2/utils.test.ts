import { expect, test } from "vitest";
import { objectKey, parseObjectKey } from "@/r2/utils";

const uuid = "bbfb361e-88f8-4e1c-bf0a-8d813323eb52";

// Object key generation tests

test("Standard object key generation is correct", () => {
  expect(objectKey(uuid, "series", "image")).toBe(`${uuid}_series/image`);
});

test("Object key generation with special characters is correct", () => {
  expect(objectKey(uuid, "series:with!special@characters", "image[with]special#characters")).toBe(
    `${uuid}_series-with-special-characters/image-with-special-characters`,
  );
});

test("Object key generation special character collapsing works", () => {
  expect(objectKey(uuid, "series:::with!!!special@@@characters", "image[[[with]]]special###characters")).toBe(
    `${uuid}_series-with-special-characters/image-with-special-characters`,
  );
});

// Object key parsing tests

test("Object key parsing works", () => {
  expect(parseObjectKey(`${uuid}_series/image`)).toEqual({
    seriesUuid: uuid,
    seriesName: "series",
    imageName: "image",
  });
});

test("Object key parsing special character collapsing works", () => {
  expect(
    parseObjectKey(objectKey(uuid, "series:::with!!!special@@@characters", "image[[[with]]]special###characters")),
  ).toEqual({
    seriesUuid: uuid,
    seriesName: "series-with-special-characters",
    imageName: "image-with-special-characters",
  });
});

test("Object key parsing with invalid object key throws error", () => {
  expect(() => parseObjectKey("invalid-object-key")).toThrow();
});
