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
    <div className="category-pill-bar" id="category-filter-bar">
      <Link
        href="/cakes"
        className={`category-nav-pill ${!activeSlug && pathname === "/cakes" ? "active" : ""}`}
      >
        All Creations
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={`category-nav-pill ${isActive ? "active" : ""}`}
            id={`category-pill-${cat.slug}`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
