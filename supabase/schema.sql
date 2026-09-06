-- ==========================================================
-- LUSH LAYERS - Supabase PostgreSQL Schema
-- Luxury Cake Catalog & Ingestion System
-- STRICT RULE: ZERO PRICE FIELDS, ZERO PAYMENT LOGIC
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. CAKES TABLE (Mandatory image, zero price columns)
CREATE TABLE IF NOT EXISTS cakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    flavour VARCHAR(150) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    available_sizes JSONB NOT NULL DEFAULT '["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"]'::jsonb,
    image_url TEXT NOT NULL, -- Mandatory image! Cannot be null or empty
    cloudinary_public_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
    ai_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- 3. REVIEWS TABLE (Customer submissions start as pending)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(150) NOT NULL,
    customer_location VARCHAR(150),
    review_text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    cake_id UUID REFERENCES cakes(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMPTZ
);

-- 4. PROCESSING_JOBS TABLE (Local Python Background Queue Tracking)
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    original_size_bytes BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'processing', 'image_processed', 'ai_processing', 'uploading', 'completed', 'failed', 'retrying')),
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    cake_id UUID REFERENCES cakes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ==========================================================
-- INDEXES FOR HIGH-PERFORMANCE ISR & FILTERING
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_cakes_slug ON cakes(slug);
CREATE INDEX IF NOT EXISTS idx_cakes_category_id ON cakes(category_id);
CREATE INDEX IF NOT EXISTS idx_cakes_flavour ON cakes(flavour);
CREATE INDEX IF NOT EXISTS idx_cakes_status ON cakes(status);
CREATE INDEX IF NOT EXISTS idx_cakes_published_at ON cakes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at DESC);

-- ==========================================================
-- UPDATED_AT TRIGGER
-- ==========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cakes_updated_at ON cakes;
CREATE TRIGGER trg_cakes_updated_at
    BEFORE UPDATE ON cakes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_processing_jobs_updated_at ON processing_jobs;
CREATE TRIGGER trg_processing_jobs_updated_at
    BEFORE UPDATE ON processing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- SEED LUXURY CATEGORIES
-- ==========================================================
INSERT INTO categories (id, name, slug, description, image_url, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Signature Tiered', 'signature-tiered', 'Grand multi-tiered cakes adorned with delicate buttercream and gold leaf accents.', '/categories/tiered.webp', 1),
    ('c0000000-0000-0000-0000-000000000002', 'Bespoke Birthday', 'bespoke-birthday', 'Handcrafted birthday centrepieces curated to celebrate life''s most memorable milestones.', '/categories/birthday.webp', 2),
    ('c0000000-0000-0000-0000-000000000003', 'Botanical & Floral', 'botanical-floral', 'Intricately piped sugar florals and natural botanical infusions on velvety layers.', '/categories/floral.webp', 3),
    ('c0000000-0000-0000-0000-000000000004', 'Pure Belgian Chocolate', 'pure-belgian-chocolate', 'Decadent single-origin Belgian chocolate ganache, mousse, and cocoa sponges.', '/categories/chocolate.webp', 4),
    ('c0000000-0000-0000-0000-000000000005', 'Modern Minimalist', 'modern-minimalist', 'Sleek architectural lines, pristine textures, and contemporary luxury design.', '/categories/minimalist.webp', 5)
ON CONFLICT (slug) DO NOTHING;
