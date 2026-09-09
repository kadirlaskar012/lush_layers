/**
 * Bi-directional synchronization helper
 * Ensures any action performed in Next.js Admin Panel (Approve, Publish, Unpublish,
 * Reject, Restore, Update, Delete) is immediately replicated to the local Python backend.
 */
export async function syncCakeActionToLocal(
  cakeId: string,
  action: "approve" | "publish" | "unpublish" | "reject" | "restore" | "dismiss-duplicate" | "delete" | "update",
  data?: any
) {
  const backendBase = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000" : null);
  if (!backendBase) return;

  try {
    let url = `${backendBase}/api/cakes/${encodeURIComponent(cakeId)}`;
    let method = "POST";

    if (action === "delete") {
      method = "DELETE";
    } else if (action === "update") {
      method = "PUT";
    } else {
      url += `/${action}`;
    }

    const options: RequestInit = {
      method,
      signal: AbortSignal.timeout(2000),
    };

    if (data && (method === "PUT" || method === "POST")) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn(`[syncCakeActionToLocal] Local backend returned ${res.status} for ${action} on ${cakeId}`);
    }
  } catch (err: any) {
    // Local backend might be offline or undergoing restart; fail gracefully
    console.warn(`[syncCakeActionToLocal] Failed to sync ${action} to local backend:`, err.message);
  }
}
