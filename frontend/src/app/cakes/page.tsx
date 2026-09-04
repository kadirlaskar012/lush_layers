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
      <div style={{ paddingTop: "1.75rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Header - Compact */}
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 1.5rem" }}>
            <span className="cake-category-badge">Boutique Catalog</span>
            <h1 style={{ fontSize: "1.85rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              The Artisanal Catalog
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Filter by occasion, browse seasonal flavour profiles, or tap any cake to place an immediate enquiry via WhatsApp.
            </p>
          </div>

          {/* Search & Filters Container - Compact & Light */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              padding: "1.1rem",
              marginBottom: "1.75rem",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            {/* Live Search Input */}
            <form method="GET" action="/cakes" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <input
                  type="text"
                  name="search"
                  defaultValue={searchFilter || ""}
                  placeholder="Search by title or note (e.g., 'Raspberry', 'Chocolate', 'Pistachio')..."
                  className="form-input"
                  style={{ flex: 1, padding: "0.55rem 0.9rem", fontSize: "0.86rem" }}
                  id="catalog-search-input"
                />
                <button type="submit" className="btn-gold" style={{ padding: "0.55rem 1.1rem", fontSize: "0.82rem" }}>
                  Search
                </button>
                {(searchFilter || categoryFilter || flavourFilter) && (
                  <a
                    href="/cakes"
                    className="btn-outline-gold"
                    style={{ padding: "0.55rem 0.85rem", fontSize: "0.82rem" }}
                  >
                    Clear
                  </a>
                )}
              </div>
            </form>

            {/* Category Filter Navigation */}
            <div style={{ marginBottom: "0.85rem" }}>
              <CategoryBar categories={categories} activeSlug={categoryFilter} />
            </div>

            {/* Flavour Filter Navigation */}
            {uniqueFlavours.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.5rem", borderTop: "1px solid var(--border-light)" }}>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>
                  Flavours:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {uniqueFlavours.map((flv) => {
                    const isSelected = flavourFilter === flv;
                    return (
                      <a
                        key={flv}
                        href={`/cakes?flavour=${encodeURIComponent(flv)}`}
                        style={{
                          textDecoration: "none",
                          fontSize: "0.74rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                          background: isSelected ? "var(--gold)" : "var(--bg-cream)",
                          border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                          color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                          fontWeight: isSelected ? 600 : 500,
                          transition: "all 0.15s",
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
            <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Filtered by:</span>
              {searchFilter && (
                <span className="cake-size-pill" style={{ color: "var(--gold-dark)", borderColor: "var(--gold)" }}>
                  Search: "{searchFilter}"
                </span>
              )}
              {flavourFilter && (
                <span className="cake-size-pill" style={{ color: "var(--gold-dark)", borderColor: "var(--gold)" }}>
                  Flavour: "{flavourFilter}"
                </span>
              )}
            </div>
          )}

          {/* Responsive Cake Gallery (Desktop: 4, Tablet: 3, Mobile: STRICTLY 2) */}
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
