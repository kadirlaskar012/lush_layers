"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Cake } from "../lib/types";
import CakeCard from "./CakeCard";

interface FeaturedCarouselProps {
  cakes: Cake[];
  title?: string;
  subtitle?: string;
}

export default function FeaturedCarousel({
  cakes,
  title = "Chef's Curated Spotlight",
  subtitle = "Most admired artisanal tiers and handcrafted seasonal designs",
}: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!cakes || cakes.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section
      style={{
        padding: "2rem 0",
        background: "var(--bg-main)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      id="featured-spotlight"
    >
      <div className="container-lux">
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span className="cake-category-badge">Trending & Bespoke</span>
              <span style={{ fontSize: "0.75rem" }}>✨</span>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)",
                color: "var(--text-primary)",
                lineHeight: 1.2,
                marginTop: "0.15rem",
              }}
            >
              {title}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
              {subtitle}
            </p>
          </div>

          {/* Desktop Navigation Arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-xs)",
                transition: "all 0.2s",
              }}
              className="carousel-nav-btn"
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-xs)",
                transition: "all 0.2s",
              }}
              className="carousel-nav-btn"
            >
              →
            </button>
            <Link
              href="/cakes"
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--gold-dark)",
                textDecoration: "none",
                marginLeft: "0.5rem",
              }}
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Horizontal Swipeable Track */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "0.85rem",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            padding: "0.35rem 0.15rem 0.85rem",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
          className="featured-carousel-track"
        >
          {cakes.map((cake) => (
            <div
              key={cake.id}
              style={{
                flex: "0 0 220px",
                scrollSnapAlign: "start",
                maxWidth: "240px",
              }}
              className="featured-carousel-item"
            >
              <CakeCard cake={cake} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
