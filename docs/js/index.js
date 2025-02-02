/**
 * @file Main code for laying out the gallery. Loads all images and arranges them on the page.
 */
/** The gallery div, for adding image series to. */
const galleryDiv = document.getElementById("gallery");
/** Loads in all image series and arranges them on the page. */
fetch("./config.json")
    .then(response => response.json())
    .then((json) => loadAllImages(json))
    .then(gallery => gallery.forEach((imageSeries, i) => addImageSeries(imageSeries, i)))
    .then(() => mediumZoom(".imageSeriesImage", { background: window.getComputedStyle(document.body).backgroundColor }))
    .then(() => addResizeListener());
/**
 * Loads all images in the gallery. Images are attached to the gallery in-place.
 * @param gallery The gallery configuration.
 * @return That gallery, with all images created as HTML images, with all images loaded (or errored, etc.).
 */
async function loadAllImages(gallery) {
    const imageLoadPromises = [];
    const loadedGallery = [];
    for (const imageSeries of gallery) {
        const loadedRows = [];
        for (const row of imageSeries.rows) {
            const loadedRow = [];
            for (const image of row) {
                const htmlImage = document.createElement("img");
                imageLoadPromises.push(new Promise(resolve => {
                    htmlImage.addEventListener("load", () => resolve());
                    htmlImage.addEventListener("error", () => resolve());
                }));
                htmlImage.classList.add("imageSeriesImage");
                htmlImage.alt = image.alt;
                htmlImage.src = image.thumb;
                loadedRow.push(htmlImage);
            }
            loadedRows.push(loadedRow);
        }
        loadedGallery.push({
            title: imageSeries.title,
            rows: loadedRows,
        });
    }
    await Promise.all(imageLoadPromises);
    return loadedGallery;
}
/**
 * Adds an image series to the gallery.
 * @param imageSeries The image series to add.
 * @param i The index of the image series. Needed to generate unique identifiers.
 */
function addImageSeries(imageSeries, i) {
    const seriesDiv = document.createElement("div");
    seriesDiv.classList.add("imageSeries");
    galleryDiv.appendChild(seriesDiv);
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("imageSeriesTitleDiv");
    seriesDiv.appendChild(titleDiv);
    const title = document.createElement("h2");
    title.classList.add("mainFontWide", "textColor", "imageSeriesTitle");
    title.textContent = imageSeries.title;
    titleDiv.appendChild(title);
    const rowsDiv = document.createElement("div");
    rowsDiv.classList.add("imageSeriesRows", "expanded");
    rowsDiv.style.setProperty("--transition-time", `${0.5 + 0.25 * imageSeries.rows.length}s`);
    seriesDiv.appendChild(rowsDiv);
    const openCloseButton = document.createElement("input");
    openCloseButton.classList.add("imageSeriesDropdownCheckbox");
    openCloseButton.id = `label${i}`;
    openCloseButton.type = "checkbox";
    openCloseButton.checked = true;
    openCloseButton.addEventListener('change', event => {
        const checked = event.target.checked;
        checked ? rowsDiv.classList.add("expanded") : rowsDiv.classList.remove("expanded");
    });
    titleDiv.appendChild(openCloseButton);
    const label = document.createElement("label");
    label.classList.add("imageSeriesDropdownLabel");
    label.htmlFor = `label${i}`;
    titleDiv.appendChild(label);
    const labelImage = document.createElement("img");
    labelImage.classList.add("imageSeriesDropdownLabelImage");
    labelImage.src = "images/dropdown.svg";
    label.appendChild(labelImage);
    for (const row of imageSeries.rows) {
        rowsDiv.appendChild(createRow(row));
    }
    rowsDiv.style.setProperty("--max-height", `${rowsDiv.scrollHeight}px`); // needs to happen after images are added to be correct
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
    const aspects = row.map(image => image.naturalWidth / image.naturalHeight);
    const gridTemplateColumns = aspects.map(aspect => `${aspect}fr`).join(" ");
    rowDiv.style.setProperty("grid-template-columns", gridTemplateColumns);
    // Images are already created and loaded, just need to add them to the row.
    row.forEach(image => rowDiv.appendChild(image));
    return rowDiv;
}
/**
 * Adds resize listener to the window. This is needed because resizing the window causes the sizes of images to change,
 * hence the size of the divs containing them also needs to change accordingly.
 */
function addResizeListener() {
    window.addEventListener("resize", () => {
        for (const rowsDiv of document.querySelectorAll(".imageSeriesRows")) {
            rowsDiv.style.setProperty("--max-height", `${rowsDiv.scrollHeight}px`);
        }
    });
}
export {};
