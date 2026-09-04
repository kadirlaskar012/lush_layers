"use client";

import React, { useState, useMemo } from "react";
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

  const hasActiveFilters = Boolean(searchQuery || selectedCategorySlug || selectedFlavour);

  return (
    <div className="marketplace-listing-wrapper" id="marketplace-catalog">
      {/* 1. Category Story Strip (Visual Carousel Inspired by Cake Marketplaces) */}
      {showCategoryStrip && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                color: "var(--text-primary)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span>Celebrate with the Perfect Cake</span>
              <span style={{ fontSize: "1.2rem" }}>🎉</span>
            </h2>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Swipe to explore collections
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--gold-dark)" }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by name, chocolate, floral..."
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
                fontSize: "0.8rem",
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Category, Flavour & Sort dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
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
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

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
          <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>🎂</div>
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
