/**
 * @file Utilities for interacting with R2. Done this way so that we can use
 * import.meta.env to point to either actual R2 (in production), or the Vite
 * dev server (in development). The Vite dev server proxies requests to R2.
 *
 * This is needed to avoid CORS issues when developing locally.
 */
import type { Manifest } from "@/types/manifest";

const r2Domain = import.meta.env.VITE_R2_DOMAIN;
const manifestKey = import.meta.env.VITE_MANIFEST_KEY;

export async function getManifest(): Promise<Manifest> {
  const response = await fetch(`${r2Domain}/${manifestKey}`);
  if (!response.ok) throw new Error(`Failed to fetch manifest: ${response.statusText}`);
  return response.json();
}

export function imageUrl(key: string): string {
  return `${r2Domain}/${key}`;
}
