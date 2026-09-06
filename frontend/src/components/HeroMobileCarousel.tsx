"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { Cake } from "../lib/types";
import { getCakeDisplayId } from "../lib/cakeHelper";
import { getOptimizedImageUrl } from "../lib/imageHelper";

interface HeroMobileCarouselProps {
  cakes: Cake[];
}

export default function HeroMobileCarousel({ cakes }: HeroMobileCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const getStepDistance = useCallback(() => {
    if (!scrollRef.current) return 175;
    const el = scrollRef.current;
    const firstItem = el.firstElementChild as HTMLElement;
    if (!firstItem) return 175;
    const gap = parseFloat(window.getComputedStyle(el).gap) || 12;
    return firstItem.offsetWidth + gap;
  }, []);

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

  // Subtle auto-scroll every 3.8s on mobile
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

      if (targetLeft >= maxScroll + 10 || el.scrollLeft >= maxScroll - 6) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: Math.min(targetLeft, maxScroll), behavior: "smooth" });
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isAutoPlaying, cakes, getStepDistance]);

  if (!cakes || cakes.length === 0) return null;

  return (
    <div className="hero-mobile-carousel-container">
      {/* Header bar with micro label */}
      <div className="hero-mobile-carousel-header">
        <div className="hero-mobile-carousel-title-group">
          <span className="hero-mobile-carousel-badge">
            <Sparkles size={10} style={{ color: "var(--gold-dark)" }} />
            <span>🌟 Atelier Highlights</span>
          </span>
          <span className="hero-mobile-carousel-sub">Swipe cards</span>
        </div>
        <Link href="/cakes" className="hero-mobile-carousel-viewall">
          <span>View All</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="hero-mobile-carousel-track"
        onTouchStart={stopAutoPlay}
        onMouseDown={stopAutoPlay}
      >
        {cakes.map((cake) => {
          const displayId = cake.display_id || getCakeDisplayId(cake);
          return (
            <div key={cake.id} className="hero-compact-card">
              {/* Image Container with Studio White Clarity */}
              <Link
                href={`/cakes/${cake.slug}`}
                className="hero-compact-img-link"
                tabIndex={0}
              >
                <div className="hero-compact-img-box">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getOptimizedImageUrl(cake.image_url, { width: 320 })}
                    alt={cake.name}
                    loading="lazy"
                    decoding="async"
                    className="hero-compact-img"
                  />
                  {/* Subtle 4-digit ID */}
                  <span className="hero-compact-id">#{displayId}</span>
                </div>
              </Link>

              {/* Compact Meta */}
              <div className="hero-compact-meta">
                <Link
                  href={`/cakes/${cake.slug}`}
                  className="hero-compact-name"
                  title={cake.name}
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.25,
                  }}
                >
                  {cake.name}
                </Link>
                <span
                  className="hero-compact-flavour"
                  style={{
                    display: "block",
                    fontSize: "0.67rem",
                    color: "var(--gold-dark)",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}
                >
                  {cake.flavour || "Signature"}
                </span>
                <Link
                  href={`/cakes/${cake.slug}`}
                  className="btn-order-now hero-compact-order-btn"
                  style={{
                    marginTop: "0.35rem",
                    height: "25px",
                    fontSize: "0.70rem",
                    padding: "0 0.5rem",
                    width: "100%",
                    justifyContent: "center",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span>Order Now</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Micro Dots Indicator */}
      {cakes.length > 1 && (
        <div className="hero-mobile-dots">
          {cakes.slice(0, 7).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-mobile-dot ${activeIndex === i ? "active" : ""}`}
              onClick={() => {
                stopAutoPlay();
                if (scrollRef.current) {
                  const step = getStepDistance();
                  scrollRef.current.scrollTo({ left: i * step, behavior: "smooth" });
                }
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .hero-mobile-carousel-container {
          display: none;
          margin-top: 1rem;
          margin-bottom: 0.25rem;
          width: 100%;
          position: relative;
        }

        @media (max-width: 767px) {
          .hero-mobile-carousel-container {
            display: block;
          }
        }

        .hero-mobile-carousel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding: 0 0.15rem;
        }

        .hero-mobile-carousel-title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .hero-mobile-carousel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--gold-subtle);
          border: 1px solid var(--gold-border);
          color: var(--gold-dark);
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.12rem 0.5rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
        }

        .hero-mobile-carousel-sub {
          font-size: 0.66rem;
          color: var(--text-muted);
        }

        .hero-mobile-carousel-viewall {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--gold-dark);
          text-decoration: none;
        }

        .hero-mobile-carousel-track {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 0.2rem 0.1rem 0.4rem;
          scrollbar-width: none;
        }

        .hero-mobile-carousel-track::-webkit-scrollbar {
          display: none;
        }

        /* Compact Card: Height strictly ~195px */
        .hero-compact-card {
          flex: 0 0 160px;
          width: 160px;
          scroll-snap-align: start;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.45rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-compact-card:active {
          transform: scale(0.98);
        }

        .hero-compact-img-link {
          text-decoration: none;
          display: block;
        }

        .hero-compact-img-box {
          width: 100%;
          height: 110px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }

        .hero-compact-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .hero-compact-card:hover .hero-compact-img {
          transform: scale(1.04);
        }

        .hero-compact-id {
          position: absolute;
          top: 4px;
          left: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          font-weight: 700;
          color: var(--gold-dark);
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid var(--border-subtle);
          padding: 0.05rem 0.28rem;
          border-radius: 3px;
          backdrop-filter: blur(4px);
          line-height: 1.2;
          z-index: 2;
        }

        .hero-compact-meta {
          padding-top: 0.35rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          flex: 1;
        }

        .hero-compact-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.25;
        }

        .hero-compact-flavour {
          font-size: 0.67rem;
          color: var(--gold-dark);
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .hero-compact-order-btn {
          margin-top: 0.35rem;
          height: 25px;
          font-size: 0.70rem;
          padding: 0 0.5rem;
          width: 100%;
          justify-content: center;
          border-radius: var(--radius-sm);
        }

        .hero-mobile-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-top: 0.2rem;
        }

        .hero-mobile-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--border-subtle);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-mobile-dot.active {
          width: 14px;
          border-radius: 4px;
          background: var(--gold);
        }
      `}</style>
    </div>
  );
}
