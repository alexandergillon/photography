"use strict";
const galleryDiv = document.getElementById("gallery");
function addGalleryItem(galleryItem) {
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
fetch("./config.json")
    .then(response => response.json())
    .then((json) => json.forEach(galleryItem => addGalleryItem(galleryItem)));
