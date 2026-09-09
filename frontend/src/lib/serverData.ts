import {
  dbGetPublishedCakes,
  dbGetCakeBySlug,
  dbGetCategories,
  dbGetReviews,
} from "./db";
import { Cake, Category, Review } from "./types";

export async function getPublishedCakes(params?: {
  categoryId?: string;
  flavour?: string;
  search?: string;
  placement?: string;
}): Promise<Cake[]> {
  try {
    const cakes = await dbGetPublishedCakes(params);
    if (cakes && cakes.length > 0) return cakes;
  } catch (err) {
    console.warn("serverData: Supabase dbGetPublishedCakes failed, attempting local fallback:", err);
  }
  try {
    let url = "http://localhost:8000/api/cakes?status=published";
    if (params?.placement) url += `&placement=${encodeURIComponent(params.placement)}`;
    if (params?.categoryId) url += `&category_id=${encodeURIComponent(params.categoryId)}`;
    if (params?.flavour) url += `&flavour=${encodeURIComponent(params.flavour)}`;
    if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return [];
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  try {
    const cake = await dbGetCakeBySlug(slug);
    if (cake) return cake;
  } catch (err) {
    console.warn(`serverData: Failed to get cake by slug ${slug}:`, err);
  }
  try {
    const res = await fetch(`http://localhost:8000/api/cakes/${slug}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function getCategories(all: boolean = false): Promise<Category[]> {
  try {
    const cats = await dbGetCategories(all);
    if (cats && cats.length > 0) return cats;
  } catch (err) {
    console.warn("serverData: Failed to get categories from Supabase, attempting local fallback:", err);
  }
  try {
    const res = await fetch("http://localhost:8000/api/categories", { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    return await dbGetReviews("approved");
  } catch (err) {
    console.error("serverData: Failed to get approved reviews:", err);
    return [];
  }
}
