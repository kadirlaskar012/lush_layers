"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, Sparkles, Cake as CakeIcon, RotateCcw } from "lucide-react";
import { Cake, Category } from "../lib/types";
import CakeCard from "./CakeCard";
import CategoryBar from "./CategoryBar";

interface MarketplaceListingProps {
  initialCakes: Cake[];
  categories: Category[];
  initialCategorySlug?: string;
  initialFlavour?: string;
  initialSearch?: string;
  showCategoryStrip?: boolean;
  title?: string;
  subtitle?: string;
}

export default function MarketplaceListing({
  initialCakes,
  categories,
  initialCategorySlug = "",
  initialFlavour = "",
  initialSearch = "",
  showCategoryStrip = true,
  title = "Our Signature Confections",
  subtitle = "Handcrafted with single-origin ingredients, fresh daily for your special moments.",
}: MarketplaceListingProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategorySlug);
  const [selectedFlavour, setSelectedFlavour] = useState(initialFlavour);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "az">("popular");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique flavours from cakes for the flavour filter dropdown
  const uniqueFlavours = useMemo(() => {
    const set = new Set<string>();
    initialCakes.forEach((c) => {
      if (c.flavour && c.flavour !== "Not specified") {
        const primary = c.flavour.split("&")[0].trim();
        if (primary) set.add(primary);
      }
    });
    return Array.from(set).slice(0, 12);
  }, [initialCakes]);

  // Filter and sort cakes in real-time
  const filteredCakes = useMemo(() => {
    let result = [...initialCakes];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.flavour.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.category_name && c.category_name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategorySlug) {
      result = result.filter((c) => {
        const cat = categories.find((cat) => cat.slug === selectedCategorySlug);
        if (cat) {
          return c.category_id === cat.id || c.category_slug === selectedCategorySlug;
        }
        return (
          c.category_slug === selectedCategorySlug ||
          (c.category_name && c.category_name.toLowerCase().includes(selectedCategorySlug.replace("-", " ")))
        );
      });
    }

    // Flavour filter
    if (selectedFlavour) {
      const f = selectedFlavour.toLowerCase();
      result = result.filter((c) => c.flavour.toLowerCase().includes(f));
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: popular (by review score / id hash)
      result.sort((a, b) => (b.name.length % 5) - (a.name.length % 5));
    }

    return result;
  }, [initialCakes, categories, searchQuery, selectedCategorySlug, selectedFlavour, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategorySlug("");
    setSelectedFlavour("");
    setSortBy("popular");
  };

  const activeFilterCount = (selectedCategorySlug ? 1 : 0) + (selectedFlavour ? 1 : 0) + (sortBy !== "popular" ? 1 : 0);
  const hasActiveFilters = Boolean(searchQuery || selectedCategorySlug || selectedFlavour || sortBy !== "popular");

  return (
    <div className="marketplace-listing-wrapper" id="marketplace-catalog">
      {/* 1. Category Story Strip (Visual Carousel Inspired by Cake Marketplaces) */}
      {showCategoryStrip && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "0.65rem",
              flexWrap: "wrap",
              gap: "0.25rem 0.6rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.02rem, 3.5vw, 1.25rem)",
                color: "var(--text-primary)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                margin: 0,
              }}
            >
              <span>Celebrate with the Perfect Cake</span>
              <Sparkles size={15} style={{ color: "var(--gold)" }} />
            </h2>
            <span
              style={{
                fontSize: "0.74rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              <span>Swipe collections</span>
              <span style={{ color: "var(--gold-dark)" }}>→</span>
            </span>
          </div>

          <CategoryBar
            categories={categories}
            activeSlug={selectedCategorySlug}
            onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
          />
        </div>
      )}

      {/* 2. Marketplace Browsing & Filter Toolbar */}
      <div className="marketplace-toolbar" id="catalog-toolbar">
        {/* Left: Item Counter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: "0.76rem",
              background: "var(--bg-cream)",
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            {filteredCakes.length} designs
          </span>
        </div>

        {/* Center: Search input */}
        <div className="marketplace-search-wrap">
          <Search size={14} style={{ color: "var(--gold-dark)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by name, flavour, design..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="marketplace-search-input"
            id="toolbar-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="mobile-filter-trigger-wrap">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="btn-outline-gold"
            id="mobile-filter-trigger-btn"
            style={{
              padding: "0.38rem 0.75rem",
              fontSize: "0.78rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: "var(--gold)",
                  color: "#FFFFFF",
                  fontSize: "0.65rem",
                  borderRadius: "var(--radius-full)",
                  padding: "0.05rem 0.35rem",
                  fontWeight: 700,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop / Tablet Filters (Dropdowns) */}
        <div className="desktop-filters-row">
          {/* Category dropdown */}
          <select
            value={selectedCategorySlug}
            onChange={(e) => setSelectedCategorySlug(e.target.value)}
            className="marketplace-filter-select"
            id="filter-category-select"
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Flavour dropdown */}
          {uniqueFlavours.length > 0 && (
            <select
              value={selectedFlavour}
              onChange={(e) => setSelectedFlavour(e.target.value)}
              className="marketplace-filter-select"
              id="filter-flavour-select"
              aria-label="Filter by Flavour"
            >
              <option value="">All Flavours</option>
              {uniqueFlavours.map((flv) => (
                <option key={flv} value={flv}>
                  {flv}
                </option>
              ))}
            </select>
          )}

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="marketplace-filter-select"
            id="sort-select"
            aria-label="Sort Cakes"
          >
            <option value="popular">Sort: Popularity</option>
            <option value="newest">Sort: Newest First</option>
            <option value="az">Sort: Alphabetical</option>
          </select>

          {/* Clear button if filters applied */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--blush-accent)",
                fontSize: "0.76rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.3rem 0.4rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet / Modal */}
      {isMobileFilterOpen && (
        <div className="filter-drawer-overlay" onClick={() => setIsMobileFilterOpen(false)}>
          <div className="filter-bottom-sheet" id="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <SlidersHorizontal size={16} style={{ color: "var(--gold-dark)" }} />
                <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: 700, margin: 0 }}>
                  Filter & Sort Confections
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Category selection */}
            <div style={{ marginBottom: "1rem" }}>
              <label className="form-label">Category</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug("")}
                  style={{
                    padding: "0.32rem 0.65rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    background: selectedCategorySlug === "" ? "var(--gold)" : "var(--bg-main)",
                    color: selectedCategorySlug === "" ? "#FFFFFF" : "var(--text-secondary)",
                    border: selectedCategorySlug === "" ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    style={{
                      padding: "0.32rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem",
                      background: selectedCategorySlug === cat.slug ? "var(--gold)" : "var(--bg-main)",
                      color: selectedCategorySlug === cat.slug ? "#FFFFFF" : "var(--text-secondary)",
                      border: selectedCategorySlug === cat.slug ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Flavour selection */}
            {uniqueFlavours.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <label className="form-label">Flavour Profile</label>
                <select
                  value={selectedFlavour}
                  onChange={(e) => setSelectedFlavour(e.target.value)}
                  className="form-select"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                >
                  <option value="">All Flavours</option>
                  {uniqueFlavours.map((flv) => (
                    <option key={flv} value={flv}>
                      {flv}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort selection */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="form-select"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
              >
                <option value="popular">Popularity & Rating</option>
                <option value="newest">Newest Creations First</option>
                <option value="az">Alphabetical (A - Z)</option>
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-outline-gold"
                style={{ flex: 1, padding: "0.55rem", fontSize: "0.82rem", justifyContent: "center" }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-gold"
                style={{ flex: 2, padding: "0.55rem", fontSize: "0.82rem", justifyContent: "center" }}
              >
                Apply Filters ({filteredCakes.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Product Grid: Strictly 4 Desktop / 3 Tablet / 2 Mobile */}
      {filteredCakes.length > 0 ? (
        <div className="cake-grid-responsive" id="marketplace-cake-grid">
          {filteredCakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            textAlign: "center",
            padding: "3.5rem 1.5rem",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--border-subtle)",
            marginTop: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
            <CakeIcon size={38} style={{ color: "var(--gold)" }} />
          </div>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
            No creations match your filter criteria
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Try adjusting your search query, or clear your selected filters to view all handcrafted cakes.
          </p>
          <button onClick={handleResetFilters} className="btn-gold" style={{ padding: "0.45rem 1.1rem", fontSize: "0.8rem" }}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
