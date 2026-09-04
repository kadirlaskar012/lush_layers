import React from "react";
import PublicLayout from "../../components/PublicLayout";
import MarketplaceListing from "../../components/MarketplaceListing";
import MasonryGallery from "../../components/MasonryGallery";
import { getPublishedCakes, getCategories } from "../../lib/api";

export const revalidate = 60; // ISR: 60s

interface CakesPageProps {
  searchParams: Promise<{
    category?: string;
    flavour?: string;
    search?: string;
  }>;
}

export default async function CakesPage({ searchParams }: CakesPageProps) {
  const params = await searchParams;
  const categoryFilter = params?.category || "";
  const flavourFilter = params?.flavour || "";
  const searchFilter = params?.search || "";

  const [categories, cakes] = await Promise.all([
    getCategories(),
    getPublishedCakes(),
  ]);

  return (
    <PublicLayout>
      <div style={{ paddingTop: "1.75rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Header - Compact & Premium */}
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 1.5rem" }}>
            <span className="cake-category-badge">Boutique Catalog</span>
            <h1 style={{ fontSize: "1.85rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              The Artisanal Catalog
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Filter by occasion, browse seasonal flavour profiles, or tap any cake to place an immediate enquiry via WhatsApp.
            </p>
          </div>

          {/* Full Marketplace Browsing Experience (Live Search, Category Strip, Dropdowns & 4/3/2 Grid) */}
          <MarketplaceListing
            initialCakes={cakes || []}
            categories={categories || []}
            initialCategorySlug={categoryFilter}
            initialFlavour={flavourFilter}
            initialSearch={searchFilter}
            showCategoryStrip={true}
            title="Available Creations"
            subtitle="Explore our complete bespoke repertoire"
          />

          {/* Separate Editorial Discovery Gallery */}
          <div style={{ marginTop: "3.5rem", paddingTop: "2.5rem", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 1.5rem" }}>
              <span className="cake-category-badge">Visual Inspiration</span>
              <h2 style={{ fontSize: "1.45rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                Editorial Atelier Wall
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                A visual showcase of bespoke artisan finishes, botanical motifs, and bespoke luxury cakes.
              </p>
            </div>
            <MasonryGallery cakes={cakes || []} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
