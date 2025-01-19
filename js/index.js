/**
 * @file Main code for laying out the gallery. Loads all images and arranges them on the page.
 */
/** The gallery div, for adding image series to. */
const galleryDiv = document.getElementById("gallery");
/** Loads in all image series and arranges them on the page. */
fetch("./config.json")
    .then(response => response.json())
    .then((json) => loadAllImages(json))
    .then(gallery => gallery.forEach(imageSeries => addImageSeries(imageSeries)));
/**
 * Loads all images in the gallery. Images are attached to the gallery in-place.
 * @param gallery The gallery configuration.
 * @return That gallery, with all images created as HTML images, with all images loaded (or errored, etc.).
 */
async function loadAllImages(gallery) {
    const imageLoadPromises = [];
    for (const imageSeries of gallery) {
        for (const row of imageSeries.rows) {
            for (const image of row) {
                const htmlImage = document.createElement("img");
                imageLoadPromises.push(new Promise(resolve => {
                    htmlImage.addEventListener("load", () => resolve());
                    htmlImage.addEventListener("error", () => resolve());
                }));
                htmlImage.classList.add("imageSeriesImage");
                htmlImage.alt = image.alt;
                htmlImage.src = image.src;
                image.image = htmlImage;
            }
        }
    }
    await Promise.all(imageLoadPromises);
    return gallery;
}
/**
 * Adds an image series to the gallery.
 * @param imageSeries The image series to add.
 */
function addImageSeries(imageSeries) {
    const seriesDiv = document.createElement("div");
    seriesDiv.classList.add("imageSeries");
    galleryDiv.appendChild(seriesDiv);
    const title = document.createElement("h2");
    title.textContent = imageSeries.title;
    seriesDiv.appendChild(title);
    const rowsDiv = document.createElement("div");
    rowsDiv.classList.add("imageSeriesRows");
    seriesDiv.appendChild(rowsDiv);
    for (const row of imageSeries.rows) {
        rowsDiv.appendChild(createRow(row));
    }
}
/**
 * Creates a row in an image series.
 *
 * Some explanation for how the layout works. In order to get the images to take up the full width
 * while all being the same height, we allocate the width between images according to their width
 * divided by their height. One way to think of this is that we are transforming each image from
 * being 'width' * 'height' to being 'width / height' * 1 (i.e. all having the same height).
 *
 * We then use a CSS grid to actually achieve the layout (i.e. each row is a grid).
 *
 * @param row The row to create.
 * @return A div containing the row.
 */
function createRow(row) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("imageSeriesRow");
    const aspects = row.map(image => image.image.naturalWidth / image.image.naturalHeight);
    const gridTemplateColumns = aspects.map(aspect => `${aspect}fr`).join(" ");
    rowDiv.style.setProperty("grid-template-columns", gridTemplateColumns);
    // Images are already created and loaded, just need to add them to the row.
    row.forEach(image => rowDiv.appendChild(image.image));
    return rowDiv;
}
export {};
