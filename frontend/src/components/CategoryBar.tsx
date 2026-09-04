"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "../lib/types";

interface CategoryBarProps {
  categories: Category[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function CategoryBar({ categories, activeSlug, onSelectCategory }: CategoryBarProps) {
  const pathname = usePathname();

  // Curated visual category items inspired by cake-commerce marketplaces
  const curatedCategories = [
    {
      id: "all",
      name: "All Cakes",
      slug: "",
      icon: "🍰",
      href: "/cakes",
      color: "#FAF6F0",
      accent: "#B88E3E",
    },
    {
      id: "birthday",
      name: "Birthday",
      slug: "bespoke-birthday",
      icon: "🎈",
      href: "/category/bespoke-birthday",
      color: "#FFF5F7",
      accent: "#E11D48",
    },
    {
      id: "anniversary",
      name: "Anniversary",
      slug: "signature-tiered",
      icon: "💍",
      href: "/category/signature-tiered",
      color: "#FFF9EE",
      accent: "#B88E3E",
    },
    {
      id: "chocolate",
      name: "Chocolate",
      slug: "pure-belgian-chocolate",
      icon: "🍫",
      href: "/category/pure-belgian-chocolate",
      color: "#F6F1EA",
      accent: "#6B4423",
    },
    {
      id: "floral",
      name: "Floral & Rose",
      slug: "botanical-floral",
      icon: "🌸",
      href: "/category/botanical-floral",
      color: "#FFF0F3",
      accent: "#DB2777",
    },
    {
      id: "wedding",
      name: "Wedding",
      slug: "signature-tiered",
      icon: "👰",
      href: "/category/signature-tiered",
      color: "#F9F9F9",
      accent: "#C89B3C",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      slug: "modern-minimalist",
      icon: "✨",
      href: "/category/modern-minimalist",
      color: "#F4F6F8",
      accent: "#475569",
    },
    {
      id: "baby-shower",
      name: "Baby Shower",
      slug: "bespoke-birthday",
      icon: "🍼",
      href: "/category/bespoke-birthday",
      color: "#F0F9FF",
      accent: "#0284C7",
    },
    {
      id: "custom",
      name: "Customised",
      slug: "custom",
      icon: "🎨",
      href: "/contact",
      color: "#FDF2EC",
      accent: "#EA580C",
    },
  ];

  return (
    <div className="category-story-strip" id="category-filter-strip">
      {curatedCategories.map((item) => {
        const isActive =
          (item.slug === "" && !activeSlug && pathname === "/cakes") ||
          (item.slug !== "" && activeSlug === item.slug);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(item.slug);
              }
            }}
            className={`category-story-chip ${isActive ? "active" : ""}`}
            id={`category-story-${item.id}`}
          >
            <div
              className="category-story-avatar"
              style={{
                background: item.color,
                borderColor: isActive ? "var(--gold)" : "var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: "1.65rem", lineHeight: 1 }}>{item.icon}</span>
            </div>
            <span
              className="category-story-label"
              style={{
                color: isActive ? "var(--gold-dark)" : "var(--text-primary)",
                fontWeight: isActive ? 700 : 600,
              }}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
