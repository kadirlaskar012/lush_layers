"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "../lib/types";

interface CategoryBarProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryBar({ categories, activeSlug }: CategoryBarProps) {
  const pathname = usePathname();

  return (
    <div className="category-scroll-container" id="category-filter-bar">
      <Link
        href="/cakes"
        className={`category-pill-item ${!activeSlug && pathname === "/cakes" ? "active" : ""}`}
      >
        <span>🍰</span>
        <span>All Confections</span>
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        const iconMap: Record<string, string> = {
          "signature-tiered": "👑",
          "bespoke-birthday": "🎈",
          "botanical-floral": "🌸",
          "pure-belgian-chocolate": "🍫",
          "modern-minimalist": "✨",
        };
        const icon = iconMap[cat.slug] || "🎂";

        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={`category-pill-item ${isActive ? "active" : ""}`}
            id={`category-pill-${cat.slug}`}
          >
            <span>{icon}</span>
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
