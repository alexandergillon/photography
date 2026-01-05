# R2 Script

This directory contains a Node script for interacting with R2. This is the primary way to update the website.

The script is written for Node in TypeScript with ESM, and bundled to a single file with Rollup. This isn't a very common way of doing things, but I like ESM and also having a single
file as a final product.

The script's entry point in TypeScript is in `src/main.ts`. The finished script (built with `npm run build`) can be found at `dist/photo.js` and can be run with `node dist/photo.js` (or directly on Unix if marked executable).

# Usage

Using the script is best explained with some examples:

- `photo.js --secrets /path/to/secrets.json --add /path/to/image/directory`: add a new image series as the most recent series (i.e. at the top of the gallery)
- `photo.js --secrets /path/to/secrets.json --add-after /path/to/image/directory UUID`: add a new image series, after the series specified by UUID
- `photo.js --secrets /path/to/secrets.json --update /path/to/image/directory UUID`: update (replace) an existing image series specified by UUID
- `photo.js --secrets /path/to/secrets.json --delete UUID`: delete the image series specified by UUID
- `photo.js --secrets /path/to/secrets.json --delete-all`: delete all image series

See below for structure of directories and the secrets file. Multiple adds/updates/deletes are supported (e.g. `--add dir1 dir2 dir3`).

## Image Series Directories

To use the script to add/update an image series, you need to arrange a directory structure as follows:

```
/dir
  title.txt           # contains "Landscapes"
  A1-lake.png
  A2-mountain.png
  A3-forest.png
  B1-desert.png
  B2-ocean.png
  C1-tundra.png
```

`title.txt` is just a string in a plain text file, and represents the title of the image series.

Images are laid out in the series based on their filenames. The letter is the row (starting at A) and the number is the column (starting at 1). 

For example, the above directory is an image series with title "Landscapes" and 3 rows. The first row has 3 images (lake, mountain, forest), the second row has 2 images (desert, ocean), and the third row has 1 image (tundra).

Alt text is taken from the filename. So the first image has alt text "lake", the second "mountain", and so on.

## Secrets

To access R2, you need certain secrets. These can be passed to the scripts with the `PHOTO_SECRETS_PATH` environment variable, or the `--secrets` command line option. This should be a path to a JSON file that looks like this:

```
{
  "accountId": "...",
  "accessKeyId": "...",
  "secretAccessKey": "..."
}
```

The values come from R2.