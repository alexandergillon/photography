/** Type for an image in config.json. */
type Image = {
    alt: string;
    source: string;
}

/** Type for a gallery item in config.json. This is a sequence of images with a title. */
type GalleryItem = {
    title: string;
    images: Image[];
}

/** The gallery div, for adding gallery items to. */
const galleryDiv = document.getElementById("gallery")!;

/** Adds a gallery item to the gallery div. */
function addGalleryItem(galleryItem: GalleryItem) {
    const galleryItemDiv = document.createElement("div");
    galleryItemDiv.classList.add("galleryItem");
    galleryDiv.appendChild(galleryItemDiv);

    const galleryItemTitle = document.createElement("h2");
    galleryItemTitle.textContent = galleryItem.title;
    galleryItemDiv.appendChild(galleryItemTitle);

    const galleryImageDiv = document.createElement("div");
    galleryItemDiv.appendChild(galleryImageDiv);

    for (const image of galleryItem.images) {
        const htmlImage = document.createElement("img");
        htmlImage.alt = image.alt;
        htmlImage.src = image.source;
        galleryImageDiv.appendChild(htmlImage);
    }
}

/** Loads in all the gallery items. */
fetch("./config.json")
.then(response => response.json())
.then((json: GalleryItem[]) => json.forEach(galleryItem => addGalleryItem(galleryItem)));

