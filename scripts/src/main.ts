/**
 * @file Main executable - argument parsing and dispatch.
 */

import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addImageSeries, updateImageSeries, deleteImageSeries } from "@/actions";
import { randomUUID } from "crypto";

/**
 * Checks if a string is a UUID.
 * @param s String.
 * @returns Whether the string is a UUID.
 */
function isUuid(s: string) {
  return s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
}

const args = await yargs(hideBin(process.argv))
  .options({
    verbose: { type: "boolean", default: false },
    add: { type: "string", array: true },
    addAfter: { type: "string", array: true },
    update: { type: "string", array: true },
    delete: { type: "string", array: true },
    secrets: { type: "string" },
  })
  .alias("verbose", "v")
  .help("help")
  .check((argv) => {
    if (!(argv.add || argv.addAfter || argv.update || argv.delete)) {
      throw new Error("Must specify --add, --add-after, --update, or --delete");
    }
    return true;
  })
  .check((argv) => {
    let count = 0;
    if (argv.add) count++;
    if (argv.addAfter) count++;
    if (argv.update) count++;
    if (argv.delete) count++;
    if (count > 1) {
      throw new Error("Must specify only one of --add, --add-after, --update, or --delete");
    }
    return true;
  })
  .check((argv) => {
    if (argv.update && argv.update.length % 2 !== 0) {
      throw new Error("Must specify an even number of arguments for --update");
    }
    return true;
  })
  .check((argv) => {
    if (argv.add) {
      for (const dir of argv.add) {
        if (!fs.existsSync(dir)) {
          throw new Error(`${dir} does not exist`);
        } else if (!fs.statSync(dir).isDirectory()) {
          throw new Error(`${dir} is not a directory`);
        }
      }
    }
    if (argv.addAfter) {
      for (let i = 0; i < argv.addAfter.length; i += 2) {
        if (!fs.existsSync(argv.addAfter[i])) {
          throw new Error(`${argv.addAfter[i]} does not exist`);
        } else if (!fs.statSync(argv.addAfter[i]).isDirectory()) {
          throw new Error(`${argv.addAfter[i]} is not a directory`);
        }
      }
      for (let i = 1; i < argv.addAfter.length; i += 2) {
        if (!isUuid(argv.addAfter[i])) {
          throw new Error(`${argv.addAfter[i]} does not look like a UUID`);
        }
      }
    }
    if (argv.update) {
      for (let i = 0; i < argv.update.length; i += 2) {
        if (!fs.existsSync(argv.update[i])) {
          throw new Error(`${argv.update[i]} does not exist`);
        } else if (!fs.statSync(argv.update[i]).isDirectory()) {
          throw new Error(`${argv.update[i]} is not a directory`);
        }
      }
      for (let i = 1; i < argv.update.length; i += 2) {
        if (!isUuid(argv.update[i])) {
          throw new Error(`${argv.update[i]} does not look like a UUID`);
        }
      }
    }
    if (argv.delete) {
      for (const uuid of argv.delete) {
        if (!isUuid(uuid)) {
          throw new Error(`${uuid} does not look like a UUID`);
        }
      }
    }
  })
  .check((argv) => {
    if (argv.secrets && !fs.existsSync(argv.secrets)) {
      throw new Error(`${argv.secrets} does not exist`);
    }
    return true;
  })
  .usage(
    "usage: $0 [--secrets <file>] [--add <dir> [dir2 dir3 ...] | [--add-after <dir> <uuid> [dir2 uuid2 ...]] | --update <dir> <uuid> [dir2 uuid2 ...] | --delete <uuid> [uuid2 uuid3 ...]]",
  )
  .parse();

if (args.verbose) {
  process.env.PHOTO_VERBOSE = "1";
}

if (args.secrets) {
  process.env.PHOTO_SECRETS_PATH = args.secrets;
} else {
  if (!process.env.PHOTO_SECRETS_PATH) {
    throw new Error("Must specify --secrets or set PHOTO_SECRETS_PATH environment variable");
  }
}

if (args.add) {
  for (const dir of args.add) {
    await addImageSeries(process.env.PHOTO_SECRETS_PATH, dir, randomUUID());
  }
} else if (args.addAfter) {
  for (let i = 0; i < args.addAfter.length; i += 2) {
    await addImageSeries(process.env.PHOTO_SECRETS_PATH, args.addAfter[i], randomUUID(), args.addAfter[i + 1]);
  }
} else if (args.update) {
  for (let i = 0; i < args.update.length; i += 2) {
    await updateImageSeries(process.env.PHOTO_SECRETS_PATH, args.update[i], args.update[i + 1]);
  }
} else if (args.delete) {
  for (const uuid of args.delete) {
    await deleteImageSeries(process.env.PHOTO_SECRETS_PATH, uuid);
  }
}
