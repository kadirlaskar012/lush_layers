import {
  dbGetPublishedCakes,
  dbGetCakeBySlug,
  dbGetCategories,
  dbGetReviews,
  dbGetPromotions,
} from "./db";
import { Cake, Category, Review, Promotion } from "./types";

async function withFastTimeout<T>(
  fn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  timeoutMs: number = 1500
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    clearTimeout(timer!);
    if (result && Array.isArray(result) && result.length === 0) {
      return await fallbackFn();
    }
    if (!result && typeof result !== "boolean") {
      return await fallbackFn();
    }
    return result;
  } catch {
    clearTimeout(timer!);
    return await fallbackFn();
  }
}

export async function getPublishedCakes(params?: {
  categoryId?: string;
  flavour?: string;
  search?: string;
  placement?: string;
}): Promise<Cake[]> {
  const fetchDb = async () => {
    return await dbGetPublishedCakes(params);
  };

  const fetchLocal = async () => {
    try {
      let url = "http://localhost:8000/api/cakes?status=published";
      if (params?.placement) url += `&placement=${encodeURIComponent(params.placement)}`;
      if (params?.categoryId) url += `&category_id=${encodeURIComponent(params.categoryId)}`;
      if (params?.flavour) url += `&flavour=${encodeURIComponent(params.flavour)}`;
      if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  };

  return withFastTimeout(fetchDb, fetchLocal, 1500);
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  const fetchDb = async () => {
    return await dbGetCakeBySlug(slug);
  };

  const fetchLocal = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/cakes/${slug}`, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  };

  return withFastTimeout(fetchDb, fetchLocal, 1500);
}

export async function getCategories(all: boolean = false): Promise<Category[]> {
  const fetchDb = async () => {
    return await dbGetCategories(all);
  };

  const fetchLocal = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/categories", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  };

  return withFastTimeout(fetchDb, fetchLocal, 1500);
}

export async function getApprovedReviews(): Promise<Review[]> {
  const fetchDb = async () => {
    return await dbGetReviews("approved");
  };

  const fetchLocal = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/reviews", { cache: "no-store" });
      if (res.ok) {
        const list: Review[] = await res.json();
        return list.filter((r) => r.status === "approved");
      }
    } catch {}
    return [];
  };

  return withFastTimeout(fetchDb, fetchLocal, 1500);
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const fetchDb = async () => {
    return await dbGetPromotions(true);
  };

  const fetchLocal = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/promotions?is_active=true", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  };

  return withFastTimeout(fetchDb, fetchLocal, 1500);
}
