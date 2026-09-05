"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cake } from "lucide-react";
import { Category } from "../lib/types";
import { getCategoryIconMeta } from "../lib/categoryIcons";

interface CategoryBarProps {
  categories: Category[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function CategoryBar({ categories, activeSlug, onSelectCategory }: CategoryBarProps) {
  const pathname = usePathname();

  // Fallback categories if none supplied from API
  const defaultList: Partial<Category>[] = [
    {
      id: "c-bday",
      name: "Bespoke Birthday",
      slug: "bespoke-birthday",
      icon: "PartyPopper",
      color: "#FFF5F7",
      accent: "#E11D48",
    },
    {
      id: "c-tiered",
      name: "Signature Tiered",
      slug: "signature-tiered",
      icon: "Crown",
      color: "#F9F9F9",
      accent: "#C89B3C",
    },
    {
      id: "c-floral",
      name: "Botanical & Floral",
      slug: "botanical-floral",
      icon: "Flower2",
      color: "#FFF0F3",
      accent: "#DB2777",
    },
    {
      id: "c-choc",
      name: "Pure Belgian Chocolate",
      slug: "pure-belgian-chocolate",
      icon: "Cookie",
      color: "#F6F1EA",
      accent: "#6B4423",
    },
    {
      id: "c-min",
      name: "Modern Minimalist",
      slug: "modern-minimalist",
      icon: "Shapes",
      color: "#F4F6F8",
      accent: "#475569",
    },
  ];

  const activeCategories = (categories && categories.length > 0 ? categories : defaultList).filter(
    (c) => c.active !== false
  );

  return (
    <div className="category-story-strip" id="category-filter-strip">
      {/* 1. All Cakes Chip */}
      <Link
        href="/cakes"
        onClick={() => {
          if (onSelectCategory) {
            onSelectCategory("");
          }
        }}
        className={`category-story-chip group ${activeSlug === "" || (!activeSlug && pathname === "/cakes") ? "active" : ""}`}
        id="category-story-all"
      >
        <div
          className="category-story-avatar icon-hover-lift"
          style={{
            background: "#FAF6F0",
            borderColor: activeSlug === "" ? "var(--gold)" : "var(--border-subtle)",
            color: "#B88E3E",
          }}
        >
          <Cake size={24} strokeWidth={1.75} />
        </div>
        <span
          className="category-story-label"
          style={{
            color: activeSlug === "" ? "var(--gold-dark)" : "var(--text-primary)",
            fontWeight: activeSlug === "" ? 700 : 600,
          }}
        >
          All Cakes
        </span>
      </Link>

      {/* 2. Dynamic Categories with Configured Icons & Colors */}
      {activeCategories.map((cat) => {
        const meta = getCategoryIconMeta(cat.icon);
        const IconComponent = meta.icon;
        const bgColor = cat.color || meta.color;
        const accentColor = cat.accent || meta.accent;
        const isActive = activeSlug === cat.slug;

        return (
          <Link
            key={cat.id || cat.slug}
            href={`/category/${cat.slug}`}
            onClick={() => {
              if (onSelectCategory && cat.slug) {
                onSelectCategory(cat.slug);
              }
            }}
            className={`category-story-chip group ${isActive ? "active" : ""}`}
            id={`category-story-${cat.slug}`}
          >
            <div
              className="category-story-avatar icon-hover-lift"
              style={{
                background: bgColor,
                borderColor: isActive ? "var(--gold)" : "var(--border-subtle)",
                color: accentColor,
              }}
            >
              <IconComponent size={24} strokeWidth={1.75} />
            </div>
            <span
              className="category-story-label"
              style={{
                color: isActive ? "var(--gold-dark)" : "var(--text-primary)",
                fontWeight: isActive ? 700 : 600,
              }}
            >
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
