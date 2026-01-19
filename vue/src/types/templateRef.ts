/**
 * @file Types for the template refs of various components.
 */

export type ImageSeriesType = {
  show: () => void, // show the image series (header only, does NOT open)
  close: () => void, // close the image series
  scrollAndOpen: () => void // scroll to the image series, and open it
} | null;
