import { Pool } from "pg";
import dns from "dns";
import { Cake, Category, Review, Enquiry, AdminStats, ProcessingJob, Promotion, PhoneEligibilityResult } from "./types";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

const defaultConnectionString =
  "postgresql://postgres.phpisimuahahngdaeohg:pKbgg0S2O201GK3z@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

// Lazy connection pool instantiation
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connStr = process.env.DATABASE_URL || defaultConnectionString;
    pool = new Pool({
      connectionString: connStr,
      ssl: {
        rejectUnauthorized: false,
      },
      max: process.env.NODE_ENV === "production" ? 3 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 7000,
      keepAlive: true,
    });

    pool.on("error", (err) => {
      console.error("[db.ts] Unexpected PostgreSQL pool client error:", err.message || err);
    });
  }
  return pool;
}

function parseJsonField<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function mapCake(row: any): Cake {
  return {
    id: String(row.id),
    display_id: row.display_id || undefined,
    name: row.name || "",
    slug: row.slug || "",
    flavour: row.flavour || "",
    category_id: row.category_id ? String(row.category_id) : undefined,
    category_name: row.category_name || undefined,
    category_slug: row.category_slug || undefined,
    description: row.description || "",
    available_sizes: parseJsonField<string[]>(row.available_sizes, ["0.5 kg", "1.0 kg"]),
    image_url: row.image_url || "",
    cloudinary_public_id: row.cloudinary_public_id || undefined,
    status: row.status || "pending",
    is_hero: Boolean(row.is_hero),
    is_trending: Boolean(row.is_trending),
    is_inspiration: Boolean(row.is_inspiration),
    is_seasonal: Boolean(row.is_seasonal),
    file_hash: row.file_hash || undefined,
    phash: row.phash || undefined,
    is_duplicate: Boolean(row.is_duplicate),
    duplicate_of_id: row.duplicate_of_id ? String(row.duplicate_of_id) : null,
    duplicate_of_display_id: row.duplicate_of_display_id || null,
    duplicate_score: row.duplicate_score ? Number(row.duplicate_score) : undefined,
    duplicate_reason: row.duplicate_reason || null,
    ai_metadata: parseJsonField<any>(row.ai_metadata, {}),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
  };
}

function mapCategory(row: any): Category {
  return {
    id: String(row.id),
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    image_url: row.image_url || undefined,
    icon: row.icon || "Cake",
    color: row.color || "#FAF6F0",
    accent: row.accent || "#B88E3E",
    active: row.active !== false,
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

function mapReview(row: any): Review {
  return {
    id: String(row.id),
    customer_name: row.customer_name,
    customer_location: row.customer_location || undefined,
    review_text: row.review_text,
    rating: Number(row.rating || 5),
    cake_id: row.cake_id ? String(row.cake_id) : undefined,
    status: row.status || "pending",
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    approved_at: row.approved_at ? new Date(row.approved_at).toISOString() : null,
  };
}

function mapEnquiry(row: any): Enquiry {
  return {
    id: String(row.id),
    enquiry_number: row.enquiry_number || "",
    customer_name: row.customer_name,
    phone: row.phone,
    cake_name: row.cake_name,
    cake_image_url: row.cake_image_url || undefined,
    flavour: row.flavour || undefined,
    selected_size: row.selected_size || undefined,
    custom_message: row.custom_message || undefined,
    delivery_date: row.delivery_date || undefined,
    admin_notes: row.admin_notes || undefined,
    status: row.status || "New",
    applied_promo_code: row.applied_promo_code || undefined,
    discount_percent: row.discount_percent !== null && row.discount_percent !== undefined ? Number(row.discount_percent) : 0,
    promo_perk: row.promo_perk || undefined,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

function mapPromotion(row: any): Promotion {
  return {
    id: String(row.id),
    title: row.title || "",
    badge: row.badge || undefined,
    tagline: row.tagline || undefined,
    description: row.description || undefined,
    edition: row.edition || undefined,
    promo_code: (row.promo_code || "").toUpperCase(),
    discount_percent: Number(row.discount_percent || 0),
    min_order_amount: Number(row.min_order_amount || 0),
    addon_perk: row.addon_perk || undefined,
    image_url: row.image_url || undefined,
    bg_gradient: row.bg_gradient || undefined,
    accent_color: row.accent_color || undefined,
    is_new_user_only: Boolean(row.is_new_user_only),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

// ================= CAKES =================

export async function dbGetPublishedCakes(params?: {
  categoryId?: string;
  flavour?: string;
  search?: string;
  placement?: string;
}): Promise<Cake[]> {
  const p = getPool();
  let query = `
    SELECT c.*, cat.name as category_name, cat.slug as category_slug
    FROM cakes c
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE c.status = 'published'
  `;
  const values: any[] = [];

  if (params?.categoryId && params.categoryId !== "all") {
    values.push(params.categoryId);
    query += ` AND c.category_id = $${values.length}`;
  }
  if (params?.flavour) {
    values.push(`%${params.flavour}%`);
    query += ` AND c.flavour ILIKE $${values.length}`;
  }
  if (params?.search) {
    values.push(`%${params.search}%`);
    query += ` AND (c.name ILIKE $${values.length} OR c.flavour ILIKE $${values.length} OR c.description ILIKE $${values.length})`;
  }
  if (params?.placement === "hero") {
    query += ` AND c.is_hero = true`;
  } else if (params?.placement === "trending") {
    query += ` AND c.is_trending = true`;
  } else if (params?.placement === "inspiration") {
    query += ` AND c.is_inspiration = true`;
  } else if (params?.placement === "seasonal") {
    query += ` AND c.is_seasonal = true`;
  }

  query += ` ORDER BY c.created_at DESC`;

  const res = await p.query(query, values);
  return res.rows.map(mapCake);
}

export async function dbGetCakeBySlug(slug: string): Promise<Cake | null> {
  const p = getPool();
  const query = `
    SELECT c.*, cat.name as category_name, cat.slug as category_slug
    FROM cakes c
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE c.slug = $1
    LIMIT 1
  `;
  const res = await p.query(query, [slug]);
  if (res.rows.length === 0) return null;
  return mapCake(res.rows[0]);
}

export async function dbGetAdminCakes(params?: {
  status?: string;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  placement?: string;
}): Promise<Cake[]> {
  const p = getPool();
  let query = `
    SELECT c.*, cat.name as category_name, cat.slug as category_slug
    FROM cakes c
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE 1=1
  `;
  const values: any[] = [];

  if (params?.status && params.status !== "all") {
    if (params.status === "approved") {
      query += ` AND c.status IN ('approved', 'published')`;
    } else if (params.status.includes(",")) {
      const parts = params.status.split(",").map((s) => s.trim());
      query += ` AND c.status = ANY($${values.length + 1})`;
      values.push(parts);
    } else {
      values.push(params.status);
      query += ` AND c.status = $${values.length}`;
    }
  }

  if (params?.categoryId && params.categoryId !== "all") {
    values.push(params.categoryId);
    query += ` AND c.category_id = $${values.length}`;
  }

  if (params?.search) {
    values.push(`%${params.search}%`);
    query += ` AND (c.name ILIKE $${values.length} OR c.flavour ILIKE $${values.length} OR c.description ILIKE $${values.length})`;
  }

  if (params?.placement && params.placement !== "all") {
    if (params.placement === "hero") query += ` AND c.is_hero = true`;
    if (params.placement === "trending") query += ` AND c.is_trending = true`;
    if (params.placement === "inspiration") query += ` AND c.is_inspiration = true`;
    if (params.placement === "seasonal") query += ` AND c.is_seasonal = true`;
  }

  if (params?.sortBy === "name_asc") {
    query += ` ORDER BY c.name ASC`;
  } else if (params?.sortBy === "name_desc") {
    query += ` ORDER BY c.name DESC`;
  } else {
    query += ` ORDER BY c.created_at DESC`;
  }

  const res = await p.query(query, values);
  return res.rows.map(mapCake);
}

export async function dbUpdateCakeCuration(
  cakeId: string,
  curation: { is_hero?: boolean; is_trending?: boolean; is_inspiration?: boolean; is_seasonal?: boolean }
): Promise<Cake> {
  const p = getPool();
  const sets: string[] = ["updated_at = NOW()"];
  const values: any[] = [cakeId];

  if (curation.is_hero !== undefined) {
    values.push(curation.is_hero);
    sets.push(`is_hero = $${values.length}`);
  }
  if (curation.is_trending !== undefined) {
    values.push(curation.is_trending);
    sets.push(`is_trending = $${values.length}`);
  }
  if (curation.is_inspiration !== undefined) {
    values.push(curation.is_inspiration);
    sets.push(`is_inspiration = $${values.length}`);
  }
  if (curation.is_seasonal !== undefined) {
    values.push(curation.is_seasonal);
    sets.push(`is_seasonal = $${values.length}`);
  }

  const query = `
    UPDATE cakes
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
  `;
  const res = await p.query(query, values);
  if (res.rows.length === 0) throw new Error("Cake not found");
  return mapCake(res.rows[0]);
}

export async function dbUpdateCakeDetails(cakeId: string, updates: Partial<Cake>): Promise<Cake> {
  const p = getPool();
  const sets: string[] = ["updated_at = NOW()"];
  const values: any[] = [cakeId];

  const allowedFields = [
    "name",
    "flavour",
    "description",
    "category_id",
    "status",
    "image_url",
    "available_sizes",
    "is_hero",
    "is_trending",
    "is_inspiration",
    "is_seasonal",
  ];

  for (const field of allowedFields) {
    if ((updates as any)[field] !== undefined) {
      let val = (updates as any)[field];
      if (field === "available_sizes") {
        val = JSON.stringify(val);
      }
      values.push(val);
      sets.push(`${field} = $${values.length}`);
    }
  }

  const query = `
    UPDATE cakes
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
  `;
  const res = await p.query(query, values);
  if (res.rows.length === 0) throw new Error("Cake not found");
  return mapCake(res.rows[0]);
}

export async function dbUpdateCakeStatus(cakeId: string, status: string): Promise<Cake> {
  const p = getPool();
  let query = `
    UPDATE cakes
    SET status = $2,
        updated_at = NOW()
  `;
  const values: any[] = [cakeId, status];

  if (status === "published") {
    query += `, published_at = COALESCE(published_at, NOW())`;
  }

  query += ` WHERE id = $1 RETURNING *`;
  const res = await p.query(query, values);
  if (res.rows.length === 0) throw new Error("Cake not found");
  return mapCake(res.rows[0]);
}

export async function dbDeleteCake(cakeId: string): Promise<boolean> {
  const p = getPool();
  const res = await p.query(`DELETE FROM cakes WHERE id = $1`, [cakeId]);
  return (res.rowCount ?? 0) > 0;
}

export async function dbGetDuplicateCakes(): Promise<Cake[]> {
  const p = getPool();
  const query = `
    SELECT c.*, cat.name as category_name, cat.slug as category_slug
    FROM cakes c
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE c.is_duplicate = true OR c.status = 'duplicate'
    ORDER BY c.created_at DESC
  `;
  const res = await p.query(query);
  return res.rows.map(mapCake);
}

export async function dbDismissCakeDuplicate(cakeId: string): Promise<Cake> {
  const p = getPool();
  const query = `
    UPDATE cakes
    SET is_duplicate = false,
        status = 'pending',
        duplicate_reason = NULL,
        duplicate_score = NULL,
        duplicate_of_id = NULL,
        duplicate_of_display_id = NULL,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const res = await p.query(query, [cakeId]);
  if (res.rows.length === 0) throw new Error("Cake not found");
  return mapCake(res.rows[0]);
}

// ================= CATEGORIES =================

export async function dbGetCategories(all: boolean = false): Promise<Category[]> {
  const p = getPool();
  let query = `SELECT * FROM categories`;
  if (!all) {
    query += ` WHERE active = true`;
  }
  query += ` ORDER BY sort_order ASC, name ASC`;
  const res = await p.query(query);
  return res.rows.map(mapCategory);
}

export async function dbUpdateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const p = getPool();
  const sets: string[] = ["updated_at = NOW()"];
  const values: any[] = [id];

  const allowed = ["name", "slug", "description", "image_url", "icon", "color", "accent", "active", "sort_order"];
  for (const field of allowed) {
    if ((updates as any)[field] !== undefined) {
      values.push((updates as any)[field]);
      sets.push(`${field} = $${values.length}`);
    }
  }

  const query = `
    UPDATE categories
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
  `;
  const res = await p.query(query, values);
  if (res.rows.length === 0) return null;
  return mapCategory(res.rows[0]);
}

export async function dbCreateCategory(data: Partial<Category>): Promise<Category | null> {
  const p = getPool();
  const name = data.name || "Untitled Category";
  const slug = data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const query = `
    INSERT INTO categories (id, name, slug, description, image_url, icon, color, accent, active, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *
  `;
  const res = await p.query(query, [
    name,
    slug,
    data.description || "",
    data.image_url || null,
    data.icon || "Cake",
    data.color || "#FAF6F0",
    data.accent || "#B88E3E",
    data.active !== false,
    Number(data.sort_order || 0),
  ]);
  if (res.rows.length === 0) return null;
  return mapCategory(res.rows[0]);
}

// ================= REVIEWS =================

export async function dbGetReviews(status: string = "approved"): Promise<Review[]> {
  const p = getPool();
  const query = `
    SELECT * FROM reviews
    WHERE status = $1
    ORDER BY created_at DESC
  `;
  const res = await p.query(query, [status]);
  return res.rows.map(mapReview);
}

export async function dbSubmitReview(payload: {
  customer_name: string;
  customer_location?: string;
  review_text: string;
  rating: number;
  cake_id?: string;
}): Promise<{ success: boolean; message: string }> {
  const p = getPool();
  const query = `
    INSERT INTO reviews (id, customer_name, customer_location, review_text, rating, cake_id, status, created_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', NOW())
  `;
  await p.query(query, [
    payload.customer_name,
    payload.customer_location || "Verified Guest",
    payload.review_text,
    payload.rating || 5,
    payload.cake_id || null,
  ]);
  return { success: true, message: "Thank you! Your review has been submitted for moderation." };
}

export async function dbUpdateReviewStatus(reviewId: string, status: string): Promise<boolean> {
  const p = getPool();
  const query = `
    UPDATE reviews
    SET status = $2,
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END
    WHERE id = $1
  `;
  const res = await p.query(query, [reviewId, status]);
  return (res.rowCount ?? 0) > 0;
}

export async function dbDeleteReview(reviewId: string): Promise<boolean> {
  const p = getPool();
  const res = await p.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);
  return (res.rowCount ?? 0) > 0;
}

// ================= ENQUIRIES =================

function generateEnquiryNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LL-${code}`;
}

export async function dbCreateEnquiry(payload: {
  customer_name: string;
  phone: string;
  cake_name: string;
  cake_image_url?: string;
  flavour?: string;
  selected_size?: string;
  custom_message?: string;
  delivery_date?: string;
  applied_promo_code?: string;
  discount_percent?: number;
  promo_perk?: string;
}): Promise<Enquiry | null> {
  const p = getPool();
  const enquiryNumber = generateEnquiryNumber();

  const query = `
    INSERT INTO enquiries (
      id, enquiry_number, customer_name, phone, cake_name, cake_image_url,
      flavour, selected_size, custom_message, delivery_date, status,
      applied_promo_code, discount_percent, promo_perk,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid()::text, $1, $2, $3, $4, $5,
      $6, $7, $8, $9, 'New',
      $10, $11, $12,
      NOW(), NOW()
    )
    RETURNING *
  `;
  const res = await p.query(query, [
    enquiryNumber,
    payload.customer_name,
    payload.phone,
    payload.cake_name,
    payload.cake_image_url || null,
    payload.flavour || null,
    payload.selected_size || null,
    payload.custom_message || null,
    payload.delivery_date || null,
    payload.applied_promo_code ? payload.applied_promo_code.toUpperCase().trim() : null,
    payload.discount_percent || 0,
    payload.promo_perk || null,
  ]);
  if (res.rows.length === 0) return null;
  return mapEnquiry(res.rows[0]);
}

export async function dbGetEnquiries(params?: {
  status?: string;
  search?: string;
  limit?: number;
}): Promise<Enquiry[]> {
  const p = getPool();
  let query = `SELECT * FROM enquiries WHERE 1=1`;
  const values: any[] = [];

  if (params?.status && params.status !== "all") {
    values.push(params.status);
    query += ` AND status = $${values.length}`;
  }
  if (params?.search && params.search.trim()) {
    values.push(`%${params.search.trim()}%`);
    query += ` AND (enquiry_number ILIKE $${values.length} OR customer_name ILIKE $${values.length} OR phone ILIKE $${values.length} OR cake_name ILIKE $${values.length})`;
  }

  query += ` ORDER BY created_at DESC`;

  if (params?.limit) {
    values.push(params.limit);
    query += ` LIMIT $${values.length}`;
  }

  const res = await p.query(query, values);
  return res.rows.map(mapEnquiry);
}

export async function dbGetEnquiryByNumber(enquiryNumber: string): Promise<Enquiry | null> {
  const p = getPool();
  const cleaned = enquiryNumber.trim().toUpperCase().replace("#", "");
  const query = `
    SELECT * FROM enquiries
    WHERE enquiry_number = $1
    LIMIT 1
  `;
  const res = await p.query(query, [cleaned]);
  if (res.rows.length === 0) return null;
  return mapEnquiry(res.rows[0]);
}

export async function dbUpdateEnquiryDetails(
  enquiryId: string,
  payload: {
    status?: string;
    selected_size?: string;
    delivery_date?: string;
    admin_notes?: string;
    flavour?: string;
    cake_name?: string;
    custom_message?: string;
    applied_promo_code?: string;
    discount_percent?: number;
    promo_perk?: string;
  }
): Promise<Enquiry> {
  const p = getPool();
  const sets: string[] = ["updated_at = NOW()"];
  const values: any[] = [enquiryId];

  const allowed = ["status", "selected_size", "delivery_date", "admin_notes", "flavour", "cake_name", "custom_message", "applied_promo_code", "discount_percent", "promo_perk"];
  for (const field of allowed) {
    if ((payload as any)[field] !== undefined) {
      values.push((payload as any)[field]);
      sets.push(`${field} = $${values.length}`);
    }
  }

  const query = `
    UPDATE enquiries
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
  `;
  const res = await p.query(query, values);
  if (res.rows.length === 0) throw new Error("Enquiry not found");
  return mapEnquiry(res.rows[0]);
}

export async function dbDeleteEnquiry(enquiryId: string): Promise<boolean> {
  const p = getPool();
  const res = await p.query(`DELETE FROM enquiries WHERE id = $1`, [enquiryId]);
  return (res.rowCount ?? 0) > 0;
}

// ================= ADMIN STATS =================

export async function dbGetAdminStats(): Promise<AdminStats> {
  const p = getPool();

  const [cakeCounts, reviewCounts, enquiryCounts] = await Promise.all([
    p.query(`
      SELECT status, count(*)::int as count
      FROM cakes
      GROUP BY status
    `),
    p.query(`
      SELECT count(*)::int as count
      FROM reviews
      WHERE status = 'pending'
    `),
    p.query(`
      SELECT status, count(*)::int as count
      FROM enquiries
      GROUP BY status
    `).catch(() => ({ rows: [] })),
  ]);

  const statsMap: Record<string, number> = {};
  for (const r of cakeCounts.rows) {
    statsMap[r.status] = r.count;
  }

  const enquiryMap: Record<string, number> = {
    total: 0,
    new: 0,
    contacted: 0,
    confirmed: 0,
    baking: 0,
    ready: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const r of enquiryCounts.rows) {
    const s = (r.status || "").toLowerCase();
    enquiryMap.total += r.count;
    if (s === "new") enquiryMap.new = r.count;
    else if (s === "contacted") enquiryMap.contacted = r.count;
    else if (s === "confirmed") enquiryMap.confirmed = r.count;
    else if (s === "baking") enquiryMap.baking = r.count;
    else if (s === "ready") enquiryMap.ready = r.count;
    else if (s === "delivered") enquiryMap.delivered = r.count;
    else if (s === "completed") enquiryMap.completed = r.count;
    else if (s === "cancelled") enquiryMap.cancelled = r.count;
  }

  const pending = statsMap["pending"] || 0;
  const approved = statsMap["approved"] || 0;
  const published = statsMap["published"] || 0;
  const rejected = statsMap["rejected"] || 0;
  const duplicates = statsMap["duplicate"] || 0;

  return {
    pending,
    approved,
    published,
    total_approved: approved + published,
    rejected,
    duplicates,
    processing: 0,
    failed: 0,
    pending_reviews: reviewCounts.rows[0]?.count || 0,
    enquiries: enquiryMap as any,
  };
}

// ================= PROMOTIONS & POSTERS =================

export async function dbGetPromotions(isActiveOnly: boolean = false): Promise<Promotion[]> {
  const p = getPool();
  let query = `SELECT * FROM promotions`;
  if (isActiveOnly) {
    query += ` WHERE is_active = true`;
  }
  query += ` ORDER BY sort_order ASC, created_at DESC`;
  try {
    const res = await p.query(query);
    return res.rows.map(mapPromotion);
  } catch (err) {
    console.error("dbGetPromotions error:", err);
    return [];
  }
}

export async function dbGetPromotionById(id: string): Promise<Promotion | null> {
  const p = getPool();
  try {
    const res = await p.query(`SELECT * FROM promotions WHERE id = $1 LIMIT 1`, [id]);
    if (res.rows.length === 0) return null;
    return mapPromotion(res.rows[0]);
  } catch (err) {
    console.error("dbGetPromotionById error:", err);
    return null;
  }
}

export async function dbCreatePromotion(data: {
  title: string;
  badge?: string;
  tagline?: string;
  description?: string;
  edition?: string;
  promo_code: string;
  discount_percent: number;
  min_order_amount?: number;
  addon_perk?: string;
  image_url?: string;
  bg_gradient?: string;
  accent_color?: string;
  is_new_user_only?: boolean;
  is_active?: boolean;
  sort_order?: number;
}): Promise<Promotion | null> {
  const p = getPool();
  const query = `
    INSERT INTO promotions (
      id, title, badge, tagline, description, edition,
      promo_code, discount_percent, min_order_amount, addon_perk,
      image_url, bg_gradient, accent_color, is_new_user_only,
      is_active, sort_order, created_at, updated_at
    ) VALUES (
      gen_random_uuid()::text, $1, $2, $3, $4, $5,
      $6, $7, $8, $9,
      $10, $11, $12, $13,
      $14, $15, NOW(), NOW()
    )
    RETURNING *
  `;
  try {
    const res = await p.query(query, [
      data.title,
      data.badge || "Special Offer",
      data.tagline || null,
      data.description || null,
      data.edition || null,
      (data.promo_code || "").trim().toUpperCase(),
      data.discount_percent ?? 5,
      data.min_order_amount ?? 1000,
      data.addon_perk || null,
      data.image_url || null,
      data.bg_gradient || null,
      data.accent_color || null,
      Boolean(data.is_new_user_only),
      data.is_active !== undefined ? Boolean(data.is_active) : true,
      data.sort_order ?? 0,
    ]);
    if (res.rows.length === 0) return null;
    return mapPromotion(res.rows[0]);
  } catch (err) {
    console.error("dbCreatePromotion error:", err);
    return null;
  }
}

export async function dbUpdatePromotion(
  id: string,
  data: Partial<Promotion>
): Promise<Promotion | null> {
  const p = getPool();
  const sets: string[] = ["updated_at = NOW()"];
  const values: any[] = [id];

  const allowed = [
    "title", "badge", "tagline", "description", "edition",
    "promo_code", "discount_percent", "min_order_amount", "addon_perk",
    "image_url", "bg_gradient", "accent_color", "is_new_user_only",
    "is_active", "sort_order"
  ];

  for (const field of allowed) {
    if ((data as any)[field] !== undefined) {
      let val = (data as any)[field];
      if (field === "promo_code" && typeof val === "string") {
        val = val.trim().toUpperCase();
      }
      values.push(val);
      sets.push(`${field} = $${values.length}`);
    }
  }

  const query = `
    UPDATE promotions
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
  `;
  try {
    const res = await p.query(query, values);
    if (res.rows.length === 0) return null;
    return mapPromotion(res.rows[0]);
  } catch (err) {
    console.error("dbUpdatePromotion error:", err);
    return null;
  }
}

export async function dbDeletePromotion(id: string): Promise<boolean> {
  const p = getPool();
  try {
    const res = await p.query(`DELETE FROM promotions WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.error("dbDeletePromotion error:", err);
    return false;
  }
}

export async function dbCheckPhoneEligibility(phone: string, code?: string): Promise<PhoneEligibilityResult> {
  const raw = String(phone || "").trim();
  const cleanDigits = raw.replace(/[^0-9]/g, "");
  if (cleanDigits.length < 7) {
    return {
      is_valid_phone: false,
      is_new_user: false,
      eligible: false,
      message: "Please enter a valid mobile number.",
    };
  }

  const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
  const p = getPool();

  let previousOrdersCount = 0;
  let customerName = "";

  try {
    const countRes = await p.query(`
      SELECT COUNT(*)::int as count, MAX(customer_name) as name
      FROM enquiries
      WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE $1
    `, [`%${last10}%`]);
    if (countRes.rows.length > 0) {
      previousOrdersCount = countRes.rows[0].count || 0;
      customerName = countRes.rows[0].name || "";
    }
  } catch (err) {
    console.warn("Phone lookup error in enquiries:", err);
  }

  const isNewUser = previousOrdersCount === 0;
  const activePromos = await dbGetPromotions(true);
  const newUserPromo = activePromos.find((p) => Boolean(p.is_new_user_only));

  if (code && code.trim()) {
    const cleanCode = code.trim().toUpperCase();
    const targetPromo = activePromos.find((p) => p.promo_code === cleanCode);
    if (!targetPromo) {
      return {
        is_valid_phone: true,
        is_new_user: isNewUser,
        eligible: false,
        code_status: "invalid",
        message: `Promo code '${code}' is invalid or expired.`,
      };
    }
    if (targetPromo.is_new_user_only && !isNewUser) {
      return {
        is_valid_phone: true,
        is_new_user: false,
        eligible: false,
        code_status: "already_redeemed",
        promo: targetPromo,
        message: "You have already redeemed the new customer welcome offer. Welcome back!",
      };
    }
    return {
      is_valid_phone: true,
      is_new_user: isNewUser,
      eligible: true,
      code_status: "applied",
      promo: targetPromo,
      discount_percent: targetPromo.discount_percent,
      promo_code: targetPromo.promo_code,
      addon_perk: targetPromo.addon_perk,
      min_order_amount: targetPromo.min_order_amount,
      message: `🎉 Code ${targetPromo.promo_code} applied! ${targetPromo.discount_percent}% discount granted.`,
    };
  }

  if (isNewUser && newUserPromo) {
    return {
      is_valid_phone: true,
      is_new_user: true,
      eligible: true,
      code_status: "auto_applied",
      promo: newUserPromo,
      discount_percent: newUserPromo.discount_percent,
      promo_code: newUserPromo.promo_code,
      addon_perk: newUserPromo.addon_perk,
      min_order_amount: newUserPromo.min_order_amount,
      message: `🎉 New Patron Detected! ${newUserPromo.discount_percent}% Welcome Discount automatically applied (Code: ${newUserPromo.promo_code})!`,
    };
  }

  if (!isNewUser) {
    return {
      is_valid_phone: true,
      is_new_user: false,
      eligible: false,
      code_status: "existing_user",
      message: `Welcome back, ${customerName || "valued patron"}! You have previously ordered with us. New customer welcome offer has already been redeemed.`,
    };
  }

  return {
    is_valid_phone: true,
    is_new_user: isNewUser,
    eligible: false,
    code_status: "none",
    message: "No active promotions available at this time.",
  };
}

// ================= BULK BATCH OPERATIONS =================

export async function dbBulkUpdateCakeStatus(cakeIds: string[], status: string): Promise<Cake[]> {
  if (!cakeIds || cakeIds.length === 0) return [];
  const p = getPool();
  let query = `
    UPDATE cakes
    SET status = $2,
        updated_at = NOW()
  `;
  const values: any[] = [cakeIds, status];

  if (status === "published") {
    query += `, published_at = COALESCE(published_at, NOW())`;
  }
  if (status === "pending") {
    query += `, is_duplicate = false, duplicate_reason = NULL, duplicate_score = NULL, duplicate_of_id = NULL, duplicate_of_display_id = NULL`;
  }

  query += ` WHERE id = ANY($1) RETURNING *`;
  const res = await p.query(query, values);
  return res.rows.map(mapCake);
}

export async function dbBulkDeleteCakes(cakeIds: string[]): Promise<number> {
  if (!cakeIds || cakeIds.length === 0) return 0;
  const p = getPool();
  const res = await p.query(`DELETE FROM cakes WHERE id = ANY($1)`, [cakeIds]);
  return res.rowCount ?? 0;
}

export async function dbBulkUpdateEnquiryStatus(enquiryIds: string[], status: string): Promise<Enquiry[]> {
  if (!enquiryIds || enquiryIds.length === 0) return [];
  const p = getPool();
  const res = await p.query(
    `UPDATE enquiries SET status = $2, updated_at = NOW() WHERE id = ANY($1) RETURNING *`,
    [enquiryIds, status]
  );
  return res.rows.map(mapEnquiry);
}

export async function dbBulkDeleteEnquiries(enquiryIds: string[]): Promise<number> {
  if (!enquiryIds || enquiryIds.length === 0) return 0;
  const p = getPool();
  const res = await p.query(`DELETE FROM enquiries WHERE id = ANY($1)`, [enquiryIds]);
  return res.rowCount ?? 0;
}

export async function dbBulkUpdateReviewStatus(reviewIds: string[], status: string): Promise<number> {
  if (!reviewIds || reviewIds.length === 0) return 0;
  const p = getPool();
  const isApproved = status === "approved";
  const query = isApproved
    ? `UPDATE reviews SET status = $2, approved_at = NOW() WHERE id = ANY($1)`
    : `UPDATE reviews SET status = $2 WHERE id = ANY($1)`;
  const res = await p.query(query, [reviewIds, status]);
  return res.rowCount ?? 0;
}

export async function dbBulkDeleteReviews(reviewIds: string[]): Promise<number> {
  if (!reviewIds || reviewIds.length === 0) return 0;
  const p = getPool();
  const res = await p.query(`DELETE FROM reviews WHERE id = ANY($1)`, [reviewIds]);
  return res.rowCount ?? 0;
}
