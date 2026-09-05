import { Cake, Category, Review, ProcessingJob, AdminStats, Enquiry } from "./types";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

// --- PUBLIC WEBSITE API ---

export async function getPublishedCakes(params?: {
  categoryId?: string;
  flavour?: string;
  search?: string;
}): Promise<Cake[]> {
  try {
    const url = new URL(`${BACKEND_BASE_URL}/api/cakes`);
    url.searchParams.set("status", "published");
    if (params?.categoryId) url.searchParams.set("category_id", params.categoryId);
    if (params?.flavour) url.searchParams.set("flavour", params.flavour);
    if (params?.search) url.searchParams.set("search", params.search);

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
    const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${slug}`, {
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
    const url = all ? `${BACKEND_BASE_URL}/api/categories?all=true` : `${BACKEND_BASE_URL}/api/categories`;
    const res = await fetch(url, {
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
    const res = await fetch(`${BACKEND_BASE_URL}/api/categories/${id}`, {
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
    const res = await fetch(`${BACKEND_BASE_URL}/api/categories`, {
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
    const res = await fetch(`${BACKEND_BASE_URL}/api/reviews?status=approved`, {
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
    const res = await fetch(`${BACKEND_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Submission failed");
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to submit review" };
  }
}

// --- ADMIN API ---

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/system/status`, {
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

export async function getAdminCakes(status?: string, search?: string): Promise<Cake[]> {
  try {
    const url = new URL(`${BACKEND_BASE_URL}/api/cakes`);
    if (status === "approved") {
      // Approved collection includes both staged approved and published cakes
      url.searchParams.set("status", "approved,published");
    } else if (status) {
      url.searchParams.set("status", status);
    }
    if (search) url.searchParams.set("search", search);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch admin cakes:", err);
    return [];
  }
}

export async function updateCakeDetails(cakeId: string, updates: Partial<Cake>): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update cake");
  }
  return await res.json();
}

export async function approveCake(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/approve`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to approve cake");
  const data = await res.json();
  return data.cake;
}

export async function rejectCake(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/reject`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reject cake");
  const data = await res.json();
  return data.cake;
}

export async function publishCake(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/publish`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to publish cake. Note: Image is mandatory.");
  }
  const data = await res.json();
  return data.cake;
}

export async function deleteCake(cakeId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function generateCakeAI(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/ai-generate`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to generate AI metadata");
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
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/pending/ai-generate-all`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to bulk generate AI metadata");
  }
  return await res.json();
}

export async function regenerateCakeAI(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/regenerate-ai`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to regenerate AI metadata");
  }
  const data = await res.json();
  return data.cake;
}

export async function reprocessCakeImage(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/reprocess`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to reprocess image");
  }
  const data = await res.json();
  return data.cake;
}

export async function getProcessingJobs(): Promise<ProcessingJob[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/jobs?limit=50`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function retryProcessingJob(jobId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/jobs/${jobId}/retry`, {
    method: "POST",
  });
  return res.ok;
}

export async function getAdminReviews(status?: string): Promise<Review[]> {
  try {
    const url = new URL(`${BACKEND_BASE_URL}/api/reviews`);
    if (status) url.searchParams.set("status", status);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function approveReview(reviewId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/reviews/${reviewId}/approve`, {
    method: "POST",
  });
  return res.ok;
}

export async function rejectReview(reviewId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/reviews/${reviewId}/reject`, {
    method: "POST",
  });
  return res.ok;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/reviews/${reviewId}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function unpublishCake(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/unpublish`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to unpublish cake");
  const data = await res.json();
  return data.cake;
}

export async function restoreCake(cakeId: string): Promise<Cake> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/cakes/${cakeId}/restore`, {
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
  flavour?: string;
  selected_size?: string;
  custom_message?: string;
}): Promise<Enquiry | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/enquiries`, {
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

export async function getEnquiries(status?: string, limit?: number): Promise<Enquiry[]> {
  try {
    const url = new URL(`${BACKEND_BASE_URL}/api/enquiries`);
    if (status && status !== "all") url.searchParams.set("status", status);
    if (limit) url.searchParams.set("limit", limit.toString());
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch enquiries:", err);
    return [];
  }
}

export async function updateEnquiryStatus(enquiryId: string, status: string): Promise<Enquiry> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/enquiries/${enquiryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update enquiry status");
  const data = await res.json();
  return data.enquiry;
}

export async function deleteEnquiry(enquiryId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_BASE_URL}/api/enquiries/${enquiryId}`, {
    method: "DELETE",
  });
  return res.ok;
}

