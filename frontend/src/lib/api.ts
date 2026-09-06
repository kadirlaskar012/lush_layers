import { Cake, Category, Review, ProcessingJob, AdminStats, Enquiry } from "./types";

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

function createApiUrl(path: string): URL {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return new URL(cleanPath, window.location.origin);
  }
  return new URL(cleanPath, getApiBaseUrl());
}

function getApiUrlString(path: string): string {
  return createApiUrl(path).toString();
}

// --- PUBLIC WEBSITE API (Used by Client Components) ---

export async function getPublishedCakes(params?: {
  categoryId?: string;
  flavour?: string;
  search?: string;
  placement?: string;
}): Promise<Cake[]> {
  try {
    const url = createApiUrl("/api/cakes");
    url.searchParams.set("status", "published");
    if (params?.categoryId) url.searchParams.set("category_id", params.categoryId);
    if (params?.flavour) url.searchParams.set("flavour", params.flavour);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.placement) url.searchParams.set("placement", params.placement);

    const res = await fetch(url.toString(), {
      next: { revalidate: 60, tags: ["cakes"] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch published cakes:", err);
    return [];
  }
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  try {
    const res = await fetch(getApiUrlString(`/api/cakes/${slug}`), {
      next: { revalidate: 60, tags: [`cake-${slug}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch cake slug ${slug}:`, err);
    return null;
  }
}

export async function getCategories(all: boolean = false): Promise<Category[]> {
  try {
    const url = createApiUrl("/api/categories");
    if (all) url.searchParams.set("all", "true");

    const res = await fetch(url.toString(), {
      ...(all ? { cache: "no-store" as RequestCache } : { next: { revalidate: 60, tags: ["categories"] } }),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category | null> {
  try {
    const res = await fetch(getApiUrlString(`/api/categories/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.category || null;
  } catch (err) {
    console.error(`Failed to update category ${id}:`, err);
    return null;
  }
}

export async function createCategory(
  data: Partial<Category>
): Promise<Category | null> {
  try {
    const res = await fetch(getApiUrlString("/api/categories"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.category || null;
  } catch (err) {
    console.error("Failed to create category:", err);
    return null;
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    const url = createApiUrl("/api/reviews");
    url.searchParams.set("status", "approved");
    const res = await fetch(url.toString(), {
      next: { revalidate: 60, tags: ["reviews"] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch approved reviews:", err);
    return [];
  }
}

export async function submitCustomerReview(payload: {
  customer_name: string;
  customer_location?: string;
  review_text: string;
  rating: number;
  cake_id?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(getApiUrlString("/api/reviews"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || "Submission failed");
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to submit review" };
  }
}

// --- ADMIN API ---

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch(getApiUrlString("/api/system/status"), {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    const data = await res.json();
    return data.stats;
  } catch (err) {
    return {
      pending: 0,
      approved: 0,
      published: 0,
      total_approved: 0,
      rejected: 0,
      processing: 0,
      failed: 0,
      pending_reviews: 0,
      enquiries: {
        total: 0,
        new: 0,
        contacted: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      },
    };
  }
}

export async function getAdminCakes(
  status?: string,
  search?: string,
  categoryId?: string,
  sortBy?: string,
  placement?: string
): Promise<Cake[]> {
  try {
    const url = createApiUrl("/api/cakes");
    if (status === "approved") {
      url.searchParams.set("status", "approved,published");
    } else if (status && status !== "all") {
      url.searchParams.set("status", status);
    }
    if (search) url.searchParams.set("search", search);
    if (categoryId && categoryId !== "all") url.searchParams.set("category_id", categoryId);
    if (sortBy) url.searchParams.set("sort_by", sortBy);
    if (placement && placement !== "all") url.searchParams.set("placement", placement);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch admin cakes:", err);
    return [];
  }
}

export async function updateCakeCuration(
  cakeId: string,
  curation: { is_hero?: boolean; is_trending?: boolean; is_inspiration?: boolean }
): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/curation`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(curation),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to update cake curation");
  }
  const data = await res.json();
  return data.cake;
}

export async function updateCakeDetails(cakeId: string, updates: Partial<Cake>): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.error || "Failed to update cake");
  }
  return await res.json();
}

export async function approveCake(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/approve`), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to approve cake");
  const data = await res.json();
  return data.cake;
}

export async function rejectCake(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/reject`), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reject cake");
  const data = await res.json();
  return data.cake;
}

export async function publishCake(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/publish`), {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.error || "Failed to publish cake. Note: Image is mandatory.");
  }
  const data = await res.json();
  return data.cake;
}

export async function deleteCake(cakeId: string): Promise<boolean> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}`), {
    method: "DELETE",
  });
  return res.ok;
}

export async function getDuplicateCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(getApiUrlString("/api/cakes/duplicates"), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch duplicate cakes:", err);
    return [];
  }
}

export async function dismissCakeDuplicate(cakeId: string): Promise<{ message: string; cake: Cake }> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/dismiss-duplicate`), {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to dismiss duplicate");
  }
  return await res.json();
}

export async function generateCakeAI(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/ai-generate`), {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "AI generation requires local backend tool");
  }
  const data = await res.json();
  return data.cake;
}

export async function generateAllPendingAI(): Promise<{
  message: string;
  total_pending: number;
  queued: number;
  succeeded: number;
  failed: number;
  results: Array<{ id: string; name: string; status: string; error?: string }>;
}> {
  const res = await fetch(getApiUrlString("/api/cakes/pending/ai-generate-all"), {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Bulk AI generation requires local backend tool");
  }
  return await res.json();
}

export async function regenerateCakeAI(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/regenerate-ai`), {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to regenerate AI metadata");
  }
  const data = await res.json();
  return data.cake;
}

export async function reprocessCakeImage(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/reprocess`), {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Reprocessing requires local backend tool");
  }
  const data = await res.json();
  return data.cake;
}

export async function getProcessingJobs(): Promise<ProcessingJob[]> {
  try {
    const res = await fetch(getApiUrlString("/api/jobs?limit=50"), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function retryProcessingJob(jobId: string): Promise<boolean> {
  const res = await fetch(getApiUrlString(`/api/jobs/${jobId}/retry`), {
    method: "POST",
  });
  return res.ok;
}

export async function getAdminReviews(status?: string): Promise<Review[]> {
  try {
    const url = createApiUrl("/api/reviews");
    if (status) url.searchParams.set("status", status);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function approveReview(reviewId: string): Promise<boolean> {
  const res = await fetch(getApiUrlString(`/api/reviews/${reviewId}/approve`), {
    method: "POST",
  });
  return res.ok;
}

export async function rejectReview(reviewId: string): Promise<boolean> {
  const res = await fetch(getApiUrlString(`/api/reviews/${reviewId}/reject`), {
    method: "POST",
  });
  return res.ok;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const res = await fetch(getApiUrlString(`/api/reviews/${reviewId}`), {
    method: "DELETE",
  });
  return res.ok;
}

export async function unpublishCake(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/unpublish`), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to unpublish cake");
  const data = await res.json();
  return data.cake;
}

export async function restoreCake(cakeId: string): Promise<Cake> {
  const res = await fetch(getApiUrlString(`/api/cakes/${cakeId}/restore`), {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to restore cake");
  const data = await res.json();
  return data.cake;
}

// --- ORDERS & ENQUIRIES API (STRICT: ZERO PRICE) ---
export async function createEnquiry(payload: {
  customer_name: string;
  phone: string;
  cake_name: string;
  cake_image_url?: string;
  flavour?: string;
  selected_size?: string;
  custom_message?: string;
  delivery_date?: string;
}): Promise<Enquiry | null> {
  try {
    const res = await fetch(getApiUrlString("/api/enquiries"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.enquiry;
  } catch (err) {
    console.error("Failed to register enquiry:", err);
    return null;
  }
}

export async function getEnquiries(
  status?: string,
  searchOrLimit?: string | number,
  maybeLimit?: number
): Promise<Enquiry[]> {
  try {
    let search: string | undefined;
    let limit: number | undefined;

    if (typeof searchOrLimit === "number") {
      limit = searchOrLimit;
    } else {
      search = searchOrLimit;
      limit = maybeLimit;
    }

    const url = createApiUrl("/api/enquiries");
    if (status && status !== "all") url.searchParams.set("status", status);
    if (search && search.trim()) url.searchParams.set("search", search.trim());
    if (limit) url.searchParams.set("limit", limit.toString());

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch enquiries:", err);
    return [];
  }
}

export async function trackEnquiry(enquiryNumber: string): Promise<Enquiry | null> {
  try {
    const cleaned = encodeURIComponent(enquiryNumber.trim().toUpperCase().replace("#", ""));
    const res = await fetch(getApiUrlString(`/api/enquiries/track/${cleaned}`), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.enquiry;
  } catch (err) {
    console.error("Failed to track enquiry:", err);
    return null;
  }
}

export async function updateEnquiryDetails(enquiryId: string, payload: {
  status?: string;
  selected_size?: string;
  delivery_date?: string;
  admin_notes?: string;
  flavour?: string;
  cake_name?: string;
  custom_message?: string;
}): Promise<Enquiry> {
  const res = await fetch(getApiUrlString(`/api/enquiries/${enquiryId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update enquiry details");
  const data = await res.json();
  return data.enquiry;
}

export async function updateEnquiryStatus(enquiryId: string, status: string): Promise<Enquiry> {
  return updateEnquiryDetails(enquiryId, { status });
}

export async function deleteEnquiry(enquiryId: string): Promise<boolean> {
  const res = await fetch(getApiUrlString(`/api/enquiries/${enquiryId}`), {
    method: "DELETE",
  });
  return res.ok;
}
