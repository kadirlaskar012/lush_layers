import {
  dbGetPublishedCakes,
  dbGetCakeBySlug,
  dbGetCategories,
  dbGetReviews,
  dbGetPromotions,
} from "./db";
import { Cake, Category, Review, Promotion } from "./types";

// Ultra-fast in-memory cache with 60s TTL to eliminate database latency on storefront
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const serverMemoryCache = new Map<string, CacheEntry<any>>();

export function invalidateServerCache(pattern?: string) {
  if (!pattern || pattern === "all") {
    serverMemoryCache.clear();
    return;
  }
  for (const key of serverMemoryCache.keys()) {
    if (key.includes(pattern)) {
      serverMemoryCache.delete(key);
    }
  }
}

function getFromCache<T>(key: string): T | null {
  const item = serverMemoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data as T;
  }
  return null;
}

function setToCache<T>(key: string, data: T, ttlMs: number = 60000): T {
  if (data !== undefined && data !== null) {
    serverMemoryCache.set(key, { data, expiry: Date.now() + ttlMs });
  }
  return data;
}

async function withFastTimeout<T>(
  fn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  timeoutMs: number = 800
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
  const cacheKey = `cakes:${JSON.stringify(params || {})}`;
  const cached = getFromCache<Cake[]>(cacheKey);
  if (cached) return cached;

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

  const result = await withFastTimeout(fetchDb, fetchLocal, 800);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result;
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  const cacheKey = `cake:slug:${slug}`;
  const cached = getFromCache<Cake | null>(cacheKey);
  if (cached) return cached;

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

  const result = await withFastTimeout(fetchDb, fetchLocal, 800);
  if (result) {
    setToCache(cacheKey, result);
  }
  return result;
}

export async function getCategories(all: boolean = false): Promise<Category[]> {
  const cacheKey = `categories:${all}`;
  const cached = getFromCache<Category[]>(cacheKey);
  if (cached) return cached;

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

  const result = await withFastTimeout(fetchDb, fetchLocal, 800);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result;
}

export async function getApprovedReviews(): Promise<Review[]> {
  const cacheKey = "reviews:approved";
  const cached = getFromCache<Review[]>(cacheKey);
  if (cached) return cached;

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

  const result = await withFastTimeout(fetchDb, fetchLocal, 800);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result;
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const cacheKey = "promotions:active";
  const cached = getFromCache<Promotion[]>(cacheKey);
  if (cached) return cached;

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

  const result = await withFastTimeout(fetchDb, fetchLocal, 800);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result;
}
