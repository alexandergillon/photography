import { createApp } from "vue";
import { Fancybox } from "@fancyapps/ui";
import App from "@/App.vue";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import "@fancyapps/ui/dist/carousel/carousel.css";
import "@fancyapps/ui/dist/carousel/carousel.dots.css";
import "@/assets/style.css";

createApp(App).mount("#app");

Fancybox.bind("[data-fancybox]", {
  Carousel: {
    Toolbar: {
      display: {
        left: ["counter"],
        right: ["close"],
      },
    },
    Thumbs: false,
  },
  mainClass: "gallery-fancybox",
  mainStyle: {
    "--fancybox-backdrop-bg": "var(--background-color)",

    "--f-toolbar-font": "\"Wasted Vindey\", sans-serif",
    "--f-toolbar-font-size": "calc(1.5 * var(--font-size-large))",

    "--f-toolbar-color": "var(--text-color)",
    "--f-toolbar-text-shadow": "none",
    "--f-button-color": "var(--text-color)",
    "--f-button-bg": "none",
    "--f-arrow-color": "var(--text-color)",
    "--f-arrow-bg": "none",
  },
  wheel: "slide",
  zoomEffect: false,
});
