/**
 * @file Main code for laying out the gallery. Loads all images and arranges them on the page.
 */

import type {Gallery, LoadedGallery, LoadedImage, LoadedImageSeries} from "types";
import PhotoSwipeLightbox from "./lib/photoswipe-lightbox.js";
import PhotoSwipe from "./lib/photoswipe.js";

/** The gallery div, for adding image series to. */
const galleryDiv = document.getElementById("gallery")!;
/** From OverlayScrollbars, set in js/lib/medium-zoom.js. */
declare const OverlayScrollbarsGlobal: any;
/** From OverlayScrollbars, set in js/lib/overlayscrollbars.js. */
const { OverlayScrollbars, ClickScrollPlugin } = OverlayScrollbarsGlobal;

/** Loads in all image series and arranges them on the page. */
initializeScrollbar();
addResizeListener();
fadeInBody();
fetch("config.json")
    .then(response => response.json())
    .then((json: Gallery) => loadAllImages(json))
    .then(gallery => displayGallery(gallery));

/**
 * Loads all images in the gallery. Images are attached to the gallery in-place.
 * @param gallery The gallery configuration.
 * @return That gallery, with all images created as HTML images. Each image series has a promise which resolves when
 * that image series is loaded.
 */
function loadAllImages(gallery: Gallery): LoadedGallery {
    const loadedGallery: LoadedGallery = [];

    for (const imageSeries of gallery) {
        const imageLoadPromises: Promise<void>[] = [];
        const loadedRows = [];
        for (const row of imageSeries.rows) {
            const loadedRow = [];
            for (const image of row) {
                const htmlImage = document.createElement("img");
                imageLoadPromises.push(new Promise(resolve => {
                        htmlImage.addEventListener("load", () => resolve());
                        htmlImage.addEventListener("error", () => resolve());
                    }
                ));

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
            isLoaded: Promise.all(imageLoadPromises),
        });
    }

    return loadedGallery;
}

/**
 * Displays the gallery on the page, image series by image series, as they load.
 * @param gallery The gallery.
 */
async function displayGallery(gallery: LoadedGallery) {
    const intersectionObserver = createIntersectionObserver();
    for (const [i, imageSeries] of gallery.entries()) {
        await imageSeries.isLoaded;
        addImageSeries(imageSeries, i, intersectionObserver);
    }
}

/**
 * Creates an interaction observer set up to play fade-in animations for image series.
 * @return The interaction observer.
 */
function createIntersectionObserver() {
    let intersectionObserver: IntersectionObserver;
    intersectionObserver = new IntersectionObserver(entries => {
        // interaction observer fires when registered - isIntersecting is make sure we only add the animation when
        // we fire at the 0.1 threshold value
        for (const imageSeries of entries.filter(entry => entry.isIntersecting).map(entry => entry.target as HTMLDivElement)) {
            imageSeries.classList.add("imageSeriesLoadAnimation");
            intersectionObserver.unobserve(imageSeries);
        }
    }, { threshold: 0.1 });
    return intersectionObserver;
}

/**
 * Adds an image series to the gallery.
 * @param imageSeries The image series to add.
 * @param i The index of the image series. Needed to generate unique identifiers.
 * @param interactionObserver The interaction observer, for image series fade-in animations.
 */
function addImageSeries(imageSeries: LoadedImageSeries, i: number, interactionObserver: IntersectionObserver) {
    const seriesDiv = document.createElement("div");
    seriesDiv.classList.add("imageSeries");
    galleryDiv.appendChild(seriesDiv);

    const rowsDiv = document.createElement("div");
    rowsDiv.classList.add("imageSeriesRows", "expanded");
    rowsDiv.style.setProperty("--transition-time", `${0.5 + 0.25 * imageSeries.rows.length}s`);

    const titleDiv = createTitle(imageSeries, i, rowsDiv);
    seriesDiv.appendChild(titleDiv);
    seriesDiv.appendChild(rowsDiv);

    for (const row of imageSeries.rows) {
        rowsDiv.appendChild(createRow(row));
    }

    rowsDiv.style.setProperty("--max-height", `${rowsDiv.scrollHeight}px`); // needs to happen after images are added to be correct
    interactionObserver.observe(seriesDiv);

    const lightbox = new PhotoSwipeLightbox({
        // core setup
        gallery: rowsDiv,
        children: 'a',
        pswpModule: PhotoSwipe,
        // disable UI elements
        counter: false,
        zoom: false,
        close: false,
        // modify UX behavior
        wheelToZoom: true,
        loop: false,
        imageClickAction: "close",
        // styling
        mainClass: "pswpCustom mainFont",
        bgOpacity: 1,
    });
    lightbox.init();
}

/**
 * Creates the title for an image series.
 * @param imageSeries The image series.
 * @param i The index of the image series. Needed to generate unique identifiers.
 * @param rowsDiv The HTML <div> which will contain the image rows for this div. Needed to set up the dropdown button,
 * which interacts with that <div>.
 */
function createTitle(imageSeries: LoadedImageSeries, i: number, rowsDiv: HTMLDivElement): HTMLDivElement {
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("imageSeriesTitleDiv");

    const openCloseButton = document.createElement("input");
    openCloseButton.classList.add("imageSeriesDropdownCheckbox");
    openCloseButton.id = `label${i}`;
    openCloseButton.type = "checkbox";
    openCloseButton.checked = true;
    openCloseButton.addEventListener('change', event => {
        const checked = (event.target as HTMLInputElement).checked;
        checked ? rowsDiv.classList.add("expanded") : rowsDiv.classList.remove("expanded");
    });
    titleDiv.appendChild(openCloseButton);

    // both title and dropdown button have labels, so that both can be used to open/close dropdown
    const titleLabel = document.createElement("label");
    titleLabel.classList.add("imageSeriesDropdownLabel");
    titleLabel.htmlFor = `label${i}`;
    titleDiv.appendChild(titleLabel);
    const dropdownLabel = titleLabel.cloneNode(true);
    titleDiv.appendChild(dropdownLabel);

    const title = document.createElement("h2");
    title.classList.add("mainFontWide", "textColor", "imageSeriesTitle");
    title.textContent = imageSeries.title;
    titleLabel.appendChild(title);
    const dropdown = document.createElement("img");
    dropdown.classList.add("imageSeriesDropdownLabelImage");
    dropdown.src = "images/dropdown.svg";
    dropdown.alt = `expand/collapse ${imageSeries.title}`;
    dropdownLabel.appendChild(dropdown);

    return titleDiv;
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
function createRow(row : LoadedImage[]): HTMLDivElement {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("imageSeriesRow");

    const aspects = row.map(image => image.naturalWidth / image.naturalHeight);
    const gridTemplateColumns = aspects.map(aspect => `${aspect}fr`).join(" ");
    rowDiv.style.setProperty("grid-template-columns", gridTemplateColumns);

    // Images are already created and loaded, just need to add medium-zoom and add them to the row.
    for (const image of row) {
        // PhotoSwipe requires images to be wrapped in an anchor with these attributes set
        const anchor = document.createElement("a");
        anchor.setAttribute("data-pswp-src", image.src);
        anchor.setAttribute("data-pswp-width", image.naturalWidth.toString());
        anchor.setAttribute("data-pswp-height", image.naturalHeight.toString());
        anchor.appendChild(image);
        rowDiv.appendChild(anchor);
    }
    return rowDiv;
}

/** Initializes the scrollbar. */
function initializeScrollbar() {
    OverlayScrollbars.plugin(ClickScrollPlugin); // needed for clickScroll: true
    OverlayScrollbars(document.body, {
        scrollbars: {
            clickScroll: true,
        },
    });
}

/**
 * Adds resize listener to the window. This is needed because resizing the window causes the sizes of images to change,
 * hence the size of the divs containing them also needs to change accordingly.
 */
function addResizeListener() {
    window.addEventListener("resize", () => {
        for (const rowsDiv of document.querySelectorAll(".imageSeriesRows")) {
            (rowsDiv as HTMLDivElement).style.setProperty("--max-height", `${rowsDiv.scrollHeight}px`);
        }
    });
}

/** Plays a fade-in animation on the document body. */
function fadeInBody() {
    document.body.classList.add("fadeInAnimation");
}