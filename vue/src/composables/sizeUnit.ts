/**
 * @file Composable for size units.
 *
 * Sometimes, we want to use our CSS size units in JS. However, just accessing them with getComputedStyle()
 * returns the bare calc text, and not a pixel value. This composable keeps track of the current pixel
 * values for the three size units via the SizeUnit.vue component.
 */
import { ref } from "vue";

const sizeUnitNarrow = ref("0px");
const sizeUnit = ref("0px");
const sizeUnitWide = ref("0px");

// Not the strictest use of a composable, but this is a convenient place to put this...
function multiply(value: string, multiplier: number): string {
  return `${Number(value.replace("px", "")) * multiplier}px`;
}

export function useSizeUnit() {
  return { sizeUnitNarrow, sizeUnit, sizeUnitWide, multiply };
}
