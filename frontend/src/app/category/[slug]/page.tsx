import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicLayout from "../../../components/PublicLayout";
import MarketplaceListing from "../../../components/MarketplaceListing";
import MasonryGallery from "../../../components/MasonryGallery";
import { getPublishedCakes, getCategories } from "../../../lib/serverData";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category • LUSH LAYERS" };

  const cleanTitle = category.name.toLowerCase().endsWith("cakes")
    ? category.name
    : `${category.name} Cakes`;

  return {
    title: `${cleanTitle} • LUSH LAYERS`,
    description: category.description || `Browse handcrafted ${cleanTitle} confections by LUSH LAYERS.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const cleanTitle = category.name.toLowerCase().endsWith("cakes")
    ? category.name
    : `${category.name} Cakes`;

  const allCakes = await getPublishedCakes();

  return (
    <PublicLayout>
      <div style={{ paddingTop: "1.75rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/cakes" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Categories
            </Link>
            <span>/</span>
            <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}>{category.name}</span>
          </nav>

          {/* Header - Compact */}
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 1.5rem" }}>
            <span className="cake-category-badge">Curated Collection</span>
            <h1 style={{ fontSize: "1.85rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              {cleanTitle}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              {category.description || "Artisanal hand-sculpted bespoke confections."}
            </p>
          </div>

          {/* Marketplace Product Listing with 4/3/2 Responsive Grid */}
          <MarketplaceListing
            initialCakes={allCakes || []}
            categories={categories || []}
            initialCategorySlug={category.slug}
            showCategoryStrip={true}
            title={`${category.name} Collection`}
            subtitle={`Explore all creations designed for ${category.name}`}
          />

          {/* Editorial Discovery Gallery */}
          <div style={{ marginTop: "3.5rem", paddingTop: "2.5rem", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 1.5rem" }}>
              <span className="cake-category-badge">Visual Inspiration</span>
              <h2 style={{ fontSize: "1.45rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                Editorial Atelier Wall
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                Artisan finishes, botanical motifs, and bespoke luxury cakes.
              </p>
            </div>
            <MasonryGallery cakes={allCakes || []} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
