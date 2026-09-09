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
    // Only cache non-empty arrays to prevent poisoning the cache on transient empty results
    if (!Array.isArray(data) || data.length > 0) {
      serverMemoryCache.set(key, { data, expiry: Date.now() + ttlMs });
    }
  }
  return data;
}

function getLocalBackendBase(): string | null {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_BACKEND_URL.includes("localhost") && !process.env.NEXT_PUBLIC_BACKEND_URL.includes("127.0.0.1")) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8000";
  }
  return null;
}

async function withFastTimeout<T>(
  fn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  timeoutMs: number = 6000
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    if (timer) clearTimeout(timer);
    if (result && Array.isArray(result) && result.length === 0) {
      if (getLocalBackendBase()) {
        const fallbackRes = await fallbackFn();
        if (fallbackRes && Array.isArray(fallbackRes) && fallbackRes.length > 0) {
          return fallbackRes;
        }
      }
      return result;
    }
    if (!result && typeof result !== "boolean") {
      if (getLocalBackendBase()) {
        return await fallbackFn();
      }
      return result;
    }
    return result;
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    console.error("[ServerData] Database fetch error:", err?.message || err);
    if (getLocalBackendBase()) {
      try {
        return await fallbackFn();
      } catch {}
    }
    return (Array.isArray(fn) ? [] : null) as unknown as T;
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
  if (cached && cached.length > 0) return cached;

  const fetchDb = async () => {
    return await dbGetPublishedCakes(params);
  };

  const fetchLocal = async () => {
    const base = getLocalBackendBase();
    if (!base) return [];
    try {
      let url = `${base}/api/cakes?status=published`;
      if (params?.placement) url += `&placement=${encodeURIComponent(params.placement)}`;
      if (params?.categoryId) url += `&category_id=${encodeURIComponent(params.categoryId)}`;
      if (params?.flavour) url += `&flavour=${encodeURIComponent(params.flavour)}`;
      if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  };

  const result = await withFastTimeout(fetchDb, fetchLocal, 6000);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result || [];
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  const cacheKey = `cake:slug:${slug}`;
  const cached = getFromCache<Cake | null>(cacheKey);
  if (cached) return cached;

  const fetchDb = async () => {
    return await dbGetCakeBySlug(slug);
  };

  const fetchLocal = async () => {
    const base = getLocalBackendBase();
    if (!base) return null;
    try {
      const res = await fetch(`${base}/api/cakes/${slug}`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  };

  const result = await withFastTimeout(fetchDb, fetchLocal, 6000);
  if (result) {
    setToCache(cacheKey, result);
  }
  return result;
}

export async function getCategories(all: boolean = false): Promise<Category[]> {
  const cacheKey = `categories:${all}`;
  const cached = getFromCache<Category[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  const fetchDb = async () => {
    return await dbGetCategories(all);
  };

  const fetchLocal = async () => {
    const base = getLocalBackendBase();
    if (!base) return [];
    try {
      const res = await fetch(`${base}/api/categories`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  };

  const result = await withFastTimeout(fetchDb, fetchLocal, 6000);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result || [];
}

export async function getApprovedReviews(): Promise<Review[]> {
  const cacheKey = "reviews:approved";
  const cached = getFromCache<Review[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  const fetchDb = async () => {
    return await dbGetReviews("approved");
  };

  const fetchLocal = async () => {
    const base = getLocalBackendBase();
    if (!base) return [];
    try {
      const res = await fetch(`${base}/api/reviews`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const list: Review[] = await res.json();
        return list.filter((r) => r.status === "approved");
      }
    } catch {}
    return [];
  };

  const result = await withFastTimeout(fetchDb, fetchLocal, 6000);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result || [];
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const cacheKey = "promotions:active";
  const cached = getFromCache<Promotion[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  const fetchDb = async () => {
    return await dbGetPromotions(true);
  };

  const fetchLocal = async () => {
    const base = getLocalBackendBase();
    if (!base) return [];
    try {
      const res = await fetch(`${base}/api/promotions?is_active=true`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {}
    return [];
  };

  const result = await withFastTimeout(fetchDb, fetchLocal, 6000);
  if (result && result.length > 0) {
    setToCache(cacheKey, result);
  }
  return result || [];
}
