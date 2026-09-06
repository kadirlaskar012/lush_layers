"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Cake } from "../lib/types";
import { getCakeDisplayId } from "../lib/cakeHelper";
import { getOptimizedImageUrl } from "../lib/imageHelper";

interface HeroMobileCarouselProps {
  cakes: Cake[];
}

export default function HeroMobileCarousel({ cakes }: HeroMobileCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const nextSlide = useCallback(() => {
    if (!cakes || cakes.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % cakes.length);
  }, [cakes]);

  const prevSlide = useCallback(() => {
    if (!cakes || cakes.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + cakes.length) % cakes.length);
  }, [cakes]);

  // Auto-play rotating carousel every 3.8 seconds
  useEffect(() => {
    if (!isAutoPlaying || !cakes || cakes.length <= 1) return;

    const timer = setInterval(() => {
      if (document.hidden) return;
      nextSlide();
    }, 3800);

    return () => clearInterval(timer);
  }, [isAutoPlaying, cakes, nextSlide]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    stopAutoPlay();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    // 40px threshold for swipe
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!cakes || cakes.length === 0) return null;

  return (
    <div className="hero-mobile-carousel-wrapper">
      {/* Header bar with micro label & fixed View All button */}
      <div className="hero-mobile-carousel-header">
        <div className="hero-mobile-carousel-title-group">
          <span className="hero-mobile-carousel-badge">
            <Sparkles size={11} style={{ color: "var(--gold-dark)" }} />
            <span>Atelier Highlights</span>
          </span>
          <span className="hero-mobile-carousel-sub">Swipe cards</span>
        </div>

        <Link
          href="/cakes"
          className="hero-mobile-carousel-viewall"
          id="hero-mobile-view-all-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.74rem",
            fontWeight: 600,
            color: "var(--gold-dark)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            padding: "0.22rem 0.65rem",
            borderRadius: "9999px",
            background: "var(--bg-cream)",
            border: "1px solid var(--gold-border)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>View All</span>
          <ChevronRight size={13} style={{ flexShrink: 0, strokeWidth: 2.2 }} />
        </Link>
      </div>

      {/* Horizontally Fit Carousel Viewport */}
      <div
        className="hero-mobile-carousel-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={stopAutoPlay}
      >
        {/* Sliding Track */}
        <div
          className="hero-mobile-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {cakes.map((cake, idx) => {
            const displayId = cake.display_id || getCakeDisplayId(cake);
            return (
              <div key={cake.id || idx} className="hero-mobile-slide">
                <div className="hero-mobile-card">
                  {/* Top Card Badges */}
                  <div className="hero-card-top-bar">
                    <span className="hero-card-category">
                      {cake.category_name || "Artisanal Cake"}
                    </span>
                    <span className="hero-card-id">#{displayId}</span>
                  </div>

                  {/* Cake Image Box with Studio Clarity */}
                  <Link href={`/cakes/${cake.slug}`} className="hero-card-img-link" tabIndex={0} style={{ textDecoration: "none" }}>
                    <div className="hero-card-img-box">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(cake.image_url, { width: 440 })}
                        alt={cake.name}
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="hero-card-img"
                      />
                    </div>
                  </Link>

                  {/* Meta Content: Name & Flavour */}
                  <div className="hero-card-content">
                    <Link
                      href={`/cakes/${cake.slug}`}
                      className="hero-card-title-link"
                      style={{ textDecoration: "none", color: "inherit", display: "block", width: "100%" }}
                    >
                      <h3 className="hero-card-title" style={{ textDecoration: "none" }}>
                        {cake.name}
                      </h3>
                    </Link>

                    <p className="hero-card-flavour">
                      {cake.flavour || "Bespoke Chef Confection"}
                    </p>

                    {/* Centered Middle-Aligned Order Button */}
                    <div
                      className="hero-card-cta-wrapper"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        marginTop: "0.85rem"
                      }}
                    >
                      <Link
                        href={`/cakes/${cake.slug}`}
                        className="btn-order-now hero-card-order-btn"
                        id={`hero-order-btn-${displayId}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "160px",
                          textAlign: "center",
                          textDecoration: "none"
                        }}
                      >
                        <span>Order Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous & Next Floating Arrow Buttons */}
        {cakes.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                stopAutoPlay();
                prevSlide();
              }}
              className="hero-nav-arrow hero-nav-prev"
              aria-label="Previous cake"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                stopAutoPlay();
                nextSlide();
              }}
              className="hero-nav-arrow hero-nav-next"
              aria-label="Next cake"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Micro Dots Indicator */}
      {cakes.length > 1 && (
        <div className="hero-mobile-dots-bar">
          {cakes.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-mobile-dot ${activeIndex === i ? "active" : ""}`}
              onClick={() => {
                stopAutoPlay();
                setActiveIndex(i);
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .hero-mobile-carousel-wrapper {
          display: none;
          margin-top: 1.15rem;
          margin-bottom: 0.5rem;
          width: 100%;
          position: relative;
        }

        @media (max-width: 767px) {
          .hero-mobile-carousel-wrapper {
            display: block;
          }
        }

        .hero-mobile-carousel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.65rem;
          padding: 0 0.15rem;
          gap: 0.5rem;
        }

        .hero-mobile-carousel-title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex: 1;
          min-width: 0;
        }

        .hero-mobile-carousel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.28rem;
          background: var(--gold-subtle);
          border: 1px solid var(--gold-border);
          color: var(--gold-dark);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.16rem 0.55rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .hero-mobile-carousel-sub {
          font-size: 0.68rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        /* Fixed View All link styling */
        .hero-mobile-carousel-viewall {
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.25rem !important;
          font-size: 0.74rem !important;
          font-weight: 600 !important;
          color: var(--gold-dark) !important;
          text-decoration: none !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          padding: 0.18rem 0.55rem !important;
          border-radius: var(--radius-full) !important;
          background: var(--bg-cream) !important;
          border: 1px solid var(--border-subtle) !important;
          transition: all 0.15s ease !important;
        }

        .hero-mobile-carousel-viewall:hover,
        .hero-mobile-carousel-viewall:active,
        .hero-mobile-carousel-viewall:focus {
          background: var(--gold-subtle) !important;
          border-color: var(--gold) !important;
          color: var(--gold-dark) !important;
        }

        /* Viewport strictly fills horizontal container width */
        .hero-mobile-carousel-viewport {
          width: 100%;
          overflow: hidden;
          position: relative;
          border-radius: var(--radius-lg);
        }

        /* Smooth Sliding Track */
        .hero-mobile-carousel-track {
          display: flex;
          width: 100%;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        /* Each slide takes exactly 100% horizontal width */
        .hero-mobile-slide {
          flex: 0 0 100%;
          width: 100%;
          box-sizing: border-box;
          padding: 0 2px;
        }

        /* Luxury Card with Sage & Gold Atelier Aesthetics */
        .hero-mobile-card {
          background: var(--bg-surface);
          border: 1px solid var(--gold-border);
          border-radius: var(--radius-lg);
          padding: 0.9rem 1rem 1rem;
          box-shadow: 0 4px 16px rgba(26, 46, 34, 0.07);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .hero-card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .hero-card-category {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold-dark);
          background: var(--gold-subtle);
          padding: 0.12rem 0.45rem;
          border-radius: var(--radius-xs);
        }

        .hero-card-id {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .hero-card-img-link {
          display: block;
          text-decoration: none;
        }

        .hero-card-img-box {
          width: 100%;
          height: 190px;
          background: #FFFFFF;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .hero-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.35s ease;
        }

        .hero-mobile-card:hover .hero-card-img {
          transform: scale(1.03);
        }

        .hero-card-content {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-card-title-link {
          text-decoration: none;
          display: block;
          max-width: 100%;
        }

        .hero-card-title {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hero-card-flavour {
          font-family: var(--font-editorial);
          font-style: italic;
          font-size: 0.84rem;
          color: var(--gold-dark);
          margin: 0.25rem 0 0;
          line-height: 1.25;
          max-width: 95%;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Centered Middle Alignment Order Button */
        .hero-card-cta-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-top: 0.75rem;
        }

        .hero-card-order-btn {
          min-width: 160px;
          padding: 0.45rem 1.4rem;
          justify-content: center;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
          text-decoration: none;
          box-shadow: 0 2px 6px rgba(191, 154, 62, 0.15);
        }

        /* Navigation Arrows */
        .hero-nav-arrow {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 5;
          transition: background 0.15s ease;
        }

        .hero-nav-prev {
          left: 8px;
        }

        .hero-nav-next {
          right: 8px;
        }

        .hero-nav-arrow:hover {
          background: #FFFFFF;
          color: var(--gold-dark);
        }

        /* Dot Indicators */
        .hero-mobile-dots-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.65rem;
        }

        .hero-mobile-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--border-subtle);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-mobile-dot.active {
          width: 20px;
          background: var(--gold);
        }
      `}</style>
    </div>
  );
}
