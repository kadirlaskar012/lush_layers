/**
 * Returns a consistent 4-digit unique confection ID (e.g. "1001", "1042").
 * If the cake has display_id from backend DB, uses that.
 * Otherwise, computes a deterministic 4-digit ID (1000-9999).
 */
export function getCakeDisplayId(cake?: {
  id?: string;
  display_id?: string;
  slug?: string;
} | null): string {
  if (!cake) return "1001";
  if (cake.display_id && cake.display_id.trim() !== "") {
    return cake.display_id.trim().replace(/^#/, "");
  }
  const key = cake.id || cake.slug || "confection-1001";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return String(Math.abs(hash % 9000) + 1000);
}
