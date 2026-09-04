"use client";

import React, { useState, useEffect } from "react";
import { getCategories } from "../../../lib/api";
import { Category } from "../../../lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCats = async () => {
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <span className="cake-category-badge">Category Taxonomy</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Boutique Categories ({categories.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Active showcase categories, navigation slugs, and descriptions.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <span className="cake-category-badge">/{cat.slug}</span>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", margin: "0.3rem 0", fontWeight: 600 }}>{cat.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: "1.5", marginBottom: "1rem" }}>
              {cat.description || "Artisanal collection"}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "0.6rem" }}>
              <span style={{ fontSize: "0.74rem", color: "#059669", fontWeight: 600 }}>● Active in Catalog</span>
              <a
                href={`/category/${cat.slug}`}
                target="_blank"
                style={{ fontSize: "0.78rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600 }}
              >
                View Live Page ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
