/**
 * @file Composable for whether we are on a mobile device.
 */
import { useMediaQuery } from "@vueuse/core";
import constants from "@/utils/constants";

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${constants.MOBILE_WIDTH})`);
}
