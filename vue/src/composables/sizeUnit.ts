/**
 * @file Composable for size units.
 *
 * Sometimes, we want to use our CSS size units in JS. However, just accessing them with getComputedStyle()
 * returns the bare calc text, and not a pixel value. This composable keeps track of the current pixel
 * values for the three size units via the SizeUnit.vue component.
 */
import { ref } from "vue";

const sizeUnitNarrow = ref(0);
const sizeUnit = ref(0);
const sizeUnitWide = ref(0);

export function useSizeUnit() {
  return { sizeUnitNarrow, sizeUnit, sizeUnitWide };
}
