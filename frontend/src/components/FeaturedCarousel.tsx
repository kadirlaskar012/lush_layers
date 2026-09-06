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
  title = "Trending & Chef's Spotlight",
  subtitle = "Handcrafted tiers and seasonal favourites celebrating life's sweetest milestones",
}: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Stop auto-play permanently when user manually navigates or touches
  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  // Calculate clean step distance based on first card width and track gap
  const getStepDistance = useCallback(() => {
    if (!scrollRef.current) return 240;
    const el = scrollRef.current;
    const firstItem = el.firstElementChild as HTMLElement;
    if (!firstItem) return 240;
    const gap = parseFloat(window.getComputedStyle(el).gap) || 16;
    return firstItem.offsetWidth + gap;
  }, []);

  // Track active slide index from scroll position
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const step = getStepDistance();
    if (step > 0) {
      const idx = Math.round(el.scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(cakes.length - 1, idx)));
    }
  }, [cakes.length, getStepDistance]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  // Navigate left or right by exact card step
  const scroll = (direction: "left" | "right") => {
    stopAutoPlay();
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const step = getStepDistance();
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    const currentIndex = Math.round(el.scrollLeft / step);

    if (direction === "right") {
      const nextIndex = currentIndex + 1;
      const targetLeft = nextIndex * step;
      if (targetLeft >= maxScroll + 8) {
        // Loop smoothly back to beginning
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: Math.min(targetLeft, maxScroll), behavior: "smooth" });
      }
    } else {
      const prevIndex = Math.max(0, currentIndex - 1);
      el.scrollTo({ left: prevIndex * step, behavior: "smooth" });
    }
  };

  // Jump to specific slide when dot is clicked
  const scrollToIndex = (index: number) => {
    stopAutoPlay();
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const step = getStepDistance();
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(index * step, maxScroll), behavior: "smooth" });
  };

  // Auto-play interval: scrolls to next card smoothly every 3.5s
  useEffect(() => {
    if (!isAutoPlaying || !cakes || cakes.length <= 1) return;

    const interval = setInterval(() => {
      if (document.hidden || !scrollRef.current) return;
      const el = scrollRef.current;
      const step = getStepDistance();
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      const currentIndex = Math.round(el.scrollLeft / step);
      const nextIndex = currentIndex + 1;
      const targetLeft = nextIndex * step;

      if (targetLeft >= maxScroll + 8 || el.scrollLeft >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: Math.min(targetLeft, maxScroll), behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, cakes, getStepDistance]);

  if (!cakes || cakes.length === 0) return null;

  return (
    <section
      className="featured-spotlight-section"
      id="featured-spotlight"
      style={{
        padding: "1.75rem 0 2rem",
        background: "var(--bg-main)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div className="container-lux">
        {/* Section Header */}
        <div className="spotlight-header">
          <div className="spotlight-header-text">
            <div className="spotlight-badge-row">
              <span className="cake-category-badge">Trending & Bespoke</span>
              <Sparkles size={12} style={{ color: "var(--gold)" }} />
            </div>
            <h2 className="spotlight-title">
              {title}
            </h2>
            <p className="spotlight-subtitle">
              {subtitle}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="spotlight-nav-actions">
            <div className="spotlight-arrows-wrap">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous creation"
                className="carousel-nav-btn icon-hover-pulse"
                id="featured-carousel-prev"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next creation"
                className="carousel-nav-btn icon-hover-pulse"
                id="featured-carousel-next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Link
              href="/cakes"
              className="spotlight-view-all"
            >
              <span>View All</span>
              <ArrowRight size={13} className="icon-hover-slide" />
            </Link>
          </div>
        </div>

        {/* Carousel Track Viewport (Strictly bounded within container-lux) */}
        <div className="spotlight-viewport">
          <div
            ref={scrollRef}
            onTouchStart={stopAutoPlay}
            onPointerDown={stopAutoPlay}
            onWheel={stopAutoPlay}
            className="featured-carousel-track"
            id="featured-carousel-track"
          >
            {cakes.map((cake, idx) => (
              <div
                key={cake.id || idx}
                className="featured-carousel-item"
              >
                <CakeCard cake={cake} />
              </div>
            ))}
          </div>
        </div>

        {/* Subtle dot pagination indicators */}
        {cakes.length > 2 && (
          <div className="spotlight-dots-container">
            {cakes.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`spotlight-dot ${activeIndex === i ? "active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
