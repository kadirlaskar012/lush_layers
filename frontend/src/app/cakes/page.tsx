import React from "react";
import PublicLayout from "../../components/PublicLayout";
import MasonryGallery from "../../components/MasonryGallery";
import CategoryBar from "../../components/CategoryBar";
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
  const categoryFilter = params?.category;
  const flavourFilter = params?.flavour;
  const searchFilter = params?.search;

  const [categories, cakes] = await Promise.all([
    getCategories(),
    getPublishedCakes({
      categoryId: categoryFilter,
      flavour: flavourFilter,
      search: searchFilter,
    }),
  ]);

  // Extract unique flavours from published cakes for flavour filter pills
  const allCakesForFlavours = await getPublishedCakes();
  const uniqueFlavours = Array.from(
    new Set(allCakesForFlavours.map((c) => c.flavour.split("&")[0].trim()))
  ).slice(0, 8);

  return (
    <PublicLayout>
      <div style={{ paddingTop: "3.5rem", paddingBottom: "6rem" }}>
        <div className="container-lux">
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem" }}>
            <span className="cake-category-badge">Complete Collection</span>
            <h1 style={{ fontSize: "3rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
              The Artisanal Catalog
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
              Browse our handcrafted celebration and signature cakes. Filter by category, search by flavour, or select any confection to enquire directly on WhatsApp.
            </p>
          </div>

          {/* Search & Filters */}
          <div
            className="glass-card"
            style={{
              padding: "1.5rem 2rem",
              marginBottom: "3rem",
              border: "1px solid var(--border-gold)",
            }}
          >
            {/* Live Search Input */}
            <form method="GET" action="/cakes" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="text"
                  name="search"
                  defaultValue={searchFilter || ""}
                  placeholder="Search by cake title or ingredients (e.g., 'Raspberry', 'Chocolate', 'Velvet')..."
                  className="form-input"
                  style={{ flex: 1, padding: "0.85rem 1.25rem" }}
                  id="catalog-search-input"
                />
                <button type="submit" className="btn-gold" style={{ padding: "0.85rem 1.75rem" }}>
                  Search
                </button>
                {(searchFilter || categoryFilter || flavourFilter) && (
                  <a
                    href="/cakes"
                    className="btn-outline-gold"
                    style={{ padding: "0.85rem 1.25rem" }}
                  >
                    Clear
                  </a>
                )}
              </div>
            </form>

            {/* Category Filter Navigation */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                Filter by Category:
              </div>
              <CategoryBar categories={categories} activeSlug={categoryFilter} />
            </div>

            {/* Flavour Filter Navigation */}
            {uniqueFlavours.length > 0 && (
              <div>
                <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                  Filter by Flavour Note:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {uniqueFlavours.map((flv) => {
                    const isSelected = flavourFilter === flv;
                    return (
                      <a
                        key={flv}
                        href={`/cakes?flavour=${encodeURIComponent(flv)}`}
                        style={{
                          textDecoration: "none",
                          fontSize: "0.82rem",
                          padding: "0.35rem 0.9rem",
                          borderRadius: "var(--radius-full)",
                          background: isSelected ? "rgba(212, 175, 55, 0.25)" : "rgba(255, 255, 255, 0.04)",
                          border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                          color: isSelected ? "var(--gold-light)" : "var(--text-secondary)",
                          transition: "all 0.2s",
                        }}
                      >
                        {flv}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Indicators */}
          {(searchFilter || flavourFilter) && (
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Active filters:</span>
              {searchFilter && (
                <span className="cake-size-pill" style={{ color: "var(--gold-light)", borderColor: "var(--gold)" }}>
                  Search: "{searchFilter}"
                </span>
              )}
              {flavourFilter && (
                <span className="cake-size-pill" style={{ color: "var(--gold-light)", borderColor: "var(--gold)" }}>
                  Flavour: "{flavourFilter}"
                </span>
              )}
            </div>
          )}

          {/* Masonry Cake Gallery (NO PRICE) */}
          <MasonryGallery
            cakes={cakes}
            emptyMessage={
              searchFilter || flavourFilter
                ? "No creations match your search criteria. Try a different flavour or clear filters."
                : "No cakes available yet."
            }
          />
        </div>
      </div>
    </PublicLayout>
  );
}
