"use client";

import React, { useState, useEffect } from "react";
import { getCategories } from "../../../lib/api";
import { Category } from "../../../lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <span className="cake-category-badge">Category Taxonomy</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Boutique Categories
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Manage your showcase categories, navigation slugs, and descriptions.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card" style={{ padding: "2rem", border: "1px solid var(--border-subtle)" }}>
            <span className="cake-category-badge">Slug: /{cat.slug}</span>
            <h3 style={{ fontSize: "1.35rem", color: "var(--gold-light)", margin: "0.5rem 0" }}>{cat.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              {cat.description || "Artisanal collection"}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#34D399" }}>● Active in Catalog</span>
              <a
                href={`/category/${cat.slug}`}
                target="_blank"
                style={{ fontSize: "0.82rem", color: "var(--gold)", textDecoration: "none" }}
              >
                View Public Page ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
