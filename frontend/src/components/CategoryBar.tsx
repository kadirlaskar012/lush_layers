"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cake,
  PartyPopper,
  Heart,
  Cookie,
  Flower2,
  Crown,
  Shapes,
  Baby,
  Palette,
} from "lucide-react";
import { Category } from "../lib/types";

interface CategoryBarProps {
  categories: Category[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function CategoryBar({ categories, activeSlug, onSelectCategory }: CategoryBarProps) {
  const pathname = usePathname();

  // Curated visual category items inspired by cake-commerce marketplaces with modern Lucide icons
  const curatedCategories = [
    {
      id: "all",
      name: "All Cakes",
      slug: "",
      icon: Cake,
      href: "/cakes",
      color: "#FAF6F0",
      accent: "#B88E3E",
    },
    {
      id: "birthday",
      name: "Birthday",
      slug: "bespoke-birthday",
      icon: PartyPopper,
      href: "/category/bespoke-birthday",
      color: "#FFF5F7",
      accent: "#E11D48",
    },
    {
      id: "anniversary",
      name: "Anniversary",
      slug: "signature-tiered",
      icon: Heart,
      href: "/category/signature-tiered",
      color: "#FFF9EE",
      accent: "#B88E3E",
    },
    {
      id: "chocolate",
      name: "Chocolate",
      slug: "pure-belgian-chocolate",
      icon: Cookie,
      href: "/category/pure-belgian-chocolate",
      color: "#F6F1EA",
      accent: "#6B4423",
    },
    {
      id: "floral",
      name: "Floral & Rose",
      slug: "botanical-floral",
      icon: Flower2,
      href: "/category/botanical-floral",
      color: "#FFF0F3",
      accent: "#DB2777",
    },
    {
      id: "wedding",
      name: "Wedding",
      slug: "signature-tiered",
      icon: Crown,
      href: "/category/signature-tiered",
      color: "#F9F9F9",
      accent: "#C89B3C",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      slug: "modern-minimalist",
      icon: Shapes,
      href: "/category/modern-minimalist",
      color: "#F4F6F8",
      accent: "#475569",
    },
    {
      id: "baby-shower",
      name: "Baby Shower",
      slug: "bespoke-birthday",
      icon: Baby,
      href: "/category/bespoke-birthday",
      color: "#F0F9FF",
      accent: "#0284C7",
    },
    {
      id: "custom",
      name: "Customised",
      slug: "custom",
      icon: Palette,
      href: "/contact",
      color: "#FDF2EC",
      accent: "#EA580C",
    },
  ];

  return (
    <div className="category-story-strip" id="category-filter-strip">
      {curatedCategories.map((item) => {
        const IconComponent = item.icon;
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
            className={`category-story-chip group ${isActive ? "active" : ""}`}
            id={`category-story-${item.id}`}
          >
            <div
              className="category-story-avatar icon-hover-lift"
              style={{
                background: item.color,
                borderColor: isActive ? "var(--gold)" : "var(--border-subtle)",
                color: item.accent,
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
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
