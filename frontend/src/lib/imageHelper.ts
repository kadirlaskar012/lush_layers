/**
 * Cloudinary & Image URL optimizer for LUSH LAYERS
 * Automatically injects WebP/AVIF auto-format, smart quality compression,
 * and responsive width bounding to prevent oversized image downloads,
 * eliminate layout shifts, and accelerate mobile loading.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: { width?: number; quality?: string } = {}
): string {
  if (!url) return "";

  const { width = 600 } = options;

  // If Cloudinary URL, inject performance transformations (f_auto, q_auto, w_X, c_limit)
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (url.includes("/f_auto") || url.includes("/q_auto")) {
      return url;
    }
    const transform = `f_auto,q_auto,w_${width},c_limit`;
    return url.replace("/image/upload/", `/image/upload/${transform}/`);
  }

  return url;
}
