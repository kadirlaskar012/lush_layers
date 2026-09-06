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
    return await dbGetPublishedCakes(params);
  } catch (err) {
    console.error("serverData: Failed to get published cakes:", err);
    return [];
  }
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  try {
    return await dbGetCakeBySlug(slug);
  } catch (err) {
    console.error(`serverData: Failed to get cake by slug ${slug}:`, err);
    return null;
  }
}

export async function getCategories(all: boolean = false): Promise<Category[]> {
  try {
    return await dbGetCategories(all);
  } catch (err) {
    console.error("serverData: Failed to get categories:", err);
    return [];
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    return await dbGetReviews("approved");
  } catch (err) {
    console.error("serverData: Failed to get approved reviews:", err);
    return [];
  }
}
