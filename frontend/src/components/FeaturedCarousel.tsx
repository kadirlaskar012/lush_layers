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

      <style jsx>{`
        .spotlight-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.15rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .spotlight-header-text {
          flex: 1;
          min-width: 240px;
        }
        .spotlight-badge-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .spotlight-title {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.2vw, 1.55rem);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.22;
          margin-top: 0.15rem;
          letter-spacing: -0.01em;
        }
        .spotlight-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
          max-width: 580px;
        }
        .spotlight-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .spotlight-arrows-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .carousel-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: #FFFFFF;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(45, 35, 25, 0.05);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .carousel-nav-btn:hover {
          border-color: var(--gold);
          color: var(--gold-dark);
          box-shadow: 0 3px 8px rgba(197, 152, 58, 0.18);
          transform: translateY(-1px);
        }
        .spotlight-view-all {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--gold-dark);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.3rem 0.5rem;
          border-radius: var(--radius-sm);
          transition: color 0.2s;
        }
        .spotlight-view-all:hover {
          color: var(--gold);
        }
        .spotlight-viewport {
          position: relative;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        .featured-carousel-track {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          padding: 0.35rem 0.1rem 0.85rem;
          align-items: stretch;
          width: 100%;
          max-width: 100%;
        }
        .featured-carousel-track::-webkit-scrollbar {
          display: none;
        }
        .featured-carousel-item {
          flex: 0 0 calc((100% - 12px) / 2);
          width: calc((100% - 12px) / 2);
          min-width: calc((100% - 12px) / 2);
          max-width: calc((100% - 12px) / 2);
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 640px) {
          .featured-carousel-track {
            gap: 14px;
          }
          .featured-carousel-item {
            flex: 0 0 calc((100% - 2 * 14px) / 3);
            width: calc((100% - 2 * 14px) / 3);
            min-width: calc((100% - 2 * 14px) / 3);
            max-width: calc((100% - 2 * 14px) / 3);
          }
        }
        @media (min-width: 900px) {
          .featured-carousel-track {
            gap: 16px;
          }
          .featured-carousel-item {
            flex: 0 0 calc((100% - 3 * 16px) / 4);
            width: calc((100% - 3 * 16px) / 4);
            min-width: calc((100% - 3 * 16px) / 4);
            max-width: calc((100% - 3 * 16px) / 4);
          }
        }
        @media (min-width: 1180px) {
          .featured-carousel-track {
            gap: 16px;
          }
          .featured-carousel-item {
            flex: 0 0 calc((100% - 4 * 16px) / 5);
            width: calc((100% - 4 * 16px) / 5);
            min-width: calc((100% - 4 * 16px) / 5);
            max-width: calc((100% - 4 * 16px) / 5);
          }
        }
        .spotlight-dots-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 0.35rem;
        }
        .spotlight-dot {
          width: 7px;
          height: 7px;
          border-radius: var(--radius-full);
          border: none;
          background: var(--border-subtle);
          cursor: pointer;
          padding: 0;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .spotlight-dot.active {
          width: 20px;
          background: var(--gold);
          box-shadow: 0 1px 4px rgba(197, 152, 58, 0.35);
        }
      `}</style>
    </section>
  );
}
