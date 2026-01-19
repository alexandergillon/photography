/**
 * @file An intersection observe for image series. This is a composable so they can all re-use the same observer,
 * for performance.
 *
 * On initial page load, all image series that are on screen fade in, with a delay between each series (to create
 * a "cascading" effect). Afterwards, image series fade in as you scroll down the page.
 *
 * Applies the "visible" class when the image series should fade in. Requires the --animation-delay-initial-load CSS
 * variable to be set on the image series.
 *
 * All image series should be registered as soon as they are mounted to the DOM.
 */

const observerOptions = { threshold: 0.5 };

/** Class to handle the intersection observer for image series. */
class ImageSeriesIntersectionObserver {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(this.observerCallback.bind(this), observerOptions);
  }

  // Core logic for when to fade in an image series
  private observerCallback(entries: IntersectionObserverEntry[]) {
    for (const { entry, imageSeries } of entries.map(e => ({ entry: e, imageSeries: e.target as HTMLDivElement }))) {
      if (!imageSeries.dataset.animationInitialProcessed) {
        // This is the first time we have seen this image series, which means this is the page load (as the observer fires
        // the callback immediately after observe(), and we observe() on page load). If the image series is visible, begin
        // the fade-in, but with an animation delay based on the series index (creating a cascading effect).

        imageSeries.dataset.animationInitialProcessed = "true"; // mark the series as processed, so we don't do this again
        if (entry.isIntersecting) {
          // Image series is visible on page load
          const animationDelay = window.getComputedStyle(imageSeries).getPropertyValue("--animation-delay-initial-load").trim();
          imageSeries.style.animationDelay = `calc(${animationDelay} * ${imageSeries.dataset.animationIndex})`;
          this.show(imageSeries);
        }
      } else {
        // Image series was already processed on page load, but wasn't visible (else we would have unobserved it).
        // Hence it must have been scrolled past, so we should fade it in.

        if (entry.isIntersecting) { // Should never be false at this point, but doesn't hurt to check.
          this.show(imageSeries);
        }
      }
    }
  }

  /**
   * Register an image series with the observer. If it is visible in the initial page load, it will fade in in a cascading manner.
   * Otherwise, it will fade it when scrolled to.
   * @param element The image series HTML element.
   * @param index The index of the image series (among all image series).
   */
  public register(element: HTMLDivElement | undefined, index: number) {
    if (!element) {
      console.error("ImageSeriesIntersectionObserver: element is undefined. Image series may not display correctly.");
    } else {
      element.dataset.animationIndex = index.toString();
      this.observer.observe(element);
    }
  }

  /**
   * Manually force an image series to be shown.
   * @param element The image series div (same as passed to register()).
   */
  public show(element: HTMLDivElement) {
    element.classList.add("visible");
    this.observer.unobserve(element);
  }
}

// Singleton, to share the same observer across all image series for performance
const observer = new ImageSeriesIntersectionObserver();

/**
 * @returns The image series intersection observer.
 */
export function useIntersectionObserver(): ImageSeriesIntersectionObserver {
  return observer;
}
