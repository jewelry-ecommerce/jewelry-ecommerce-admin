import type { CuratedSet } from "@/apis/set/set.interface";

/**
 * Curated set fixtures.
 *
 * Each item is a slot (`setItemId`) with a list of SKUs the customer may pick. The slot identity is
 * stable and never derived from the chosen SKU — this is what keeps cart and order lines correct
 * when two slots happen to offer the same product.
 */


export const CURATED_SETS: CuratedSet[] = [];

export const findSetBySlug = (slug: string): CuratedSet | undefined => CURATED_SETS.find((entry) => entry.slug === slug);

export const findSetById = (id: string): CuratedSet | undefined => CURATED_SETS.find((entry) => entry.id === id);
