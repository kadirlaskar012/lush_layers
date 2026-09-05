"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Stop auto-play permanently when user manually navigates
  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const scroll = (direction: "left" | "right") => {
    // User manually clicked next or previous
    stopAutoPlay();

    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Auto-play interval: scrolls to the next card every 3.2 seconds
  useEffect(() => {
    if (!isAutoPlaying || !cakes || cakes.length <= 1) return;

    const interval = setInterval(() => {
      if (document.hidden || !scrollRef.current) return;
      const el = scrollRef.current;
      const cardWidth = el.firstElementChild?.clientWidth || 220;
      const maxScroll = el.scrollWidth - el.clientWidth;

      // When reaching near the end, loop smoothly back to start
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth + 12, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isAutoPlaying, cakes]);

  if (!cakes || cakes.length === 0) return null;

  return (
    <section
      style={{
        padding: "1.75rem 0",
        background: "var(--bg-main)",
        borderBottom: "1px solid var(--border-subtle)",
        overflow: "hidden",
        maxWidth: "100%",
      }}
      id="featured-spotlight"
    >
      <div className="container-lux" style={{ overflow: "hidden", maxWidth: "100%" }}>
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
              <Sparkles size={12} style={{ color: "var(--gold)" }} />
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

          {/* Navigation Controls */}
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
              className="carousel-nav-btn icon-hover-pulse"
              id="featured-carousel-prev"
            >
              <ChevronLeft size={16} />
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
              className="carousel-nav-btn icon-hover-pulse"
              id="featured-carousel-next"
            >
              <ChevronRight size={16} />
            </button>
            <Link
              href="/cakes"
              className="group"
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--gold-dark)",
                textDecoration: "none",
                marginLeft: "0.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} className="icon-hover-slide" />
            </Link>
          </div>
        </div>

        {/* Horizontal Swipeable Track */}
        <div
          ref={scrollRef}
          onTouchStart={stopAutoPlay}
          onPointerDown={stopAutoPlay}
          onWheel={stopAutoPlay}
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            padding: "0.4rem 0.25rem 1rem",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            scrollPadding: "0 0.5rem",
            alignItems: "stretch",
            willChange: "scroll-position",
            transform: "translate3d(0, 0, 0)",
          }}
          className="featured-carousel-track"
          id="featured-carousel-track"
        >
          {cakes.map((cake) => (
            <div
              key={cake.id}
              style={{
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
              }}
              className="featured-carousel-item"
            >
              <CakeCard cake={cake} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .featured-carousel-item {
          flex: 0 0 172px;
          width: 172px;
        }
        @media (min-width: 640px) {
          .featured-carousel-item {
            flex: 0 0 228px;
            width: 228px;
          }
        }
      `}</style>
    </section>
  );
}
