"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Cake } from "../lib/types";
import { getCakeDisplayId } from "../lib/cakeHelper";
import { getOptimizedImageUrl } from "../lib/imageHelper";

interface HeroMasterworkRotatorProps {
  cakes: Cake[];
  autoPlayIntervalMs?: number;
}

export default function HeroMasterworkRotator({
  cakes,
  autoPlayIntervalMs = 4000,
}: HeroMasterworkRotatorProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const validCakes = cakes && cakes.length > 0 ? cakes : [];
  const totalCakes = validCakes.length;

  const nextSlide = useCallback(() => {
    if (totalCakes <= 1) return;
    setCurrentIdx((prev) => (prev + 1) % totalCakes);
    setProgress(0);
  }, [totalCakes]);

  const prevSlide = useCallback(() => {
    if (totalCakes <= 1) return;
    setCurrentIdx((prev) => (prev - 1 + totalCakes) % totalCakes);
    setProgress(0);
  }, [totalCakes]);

  const goToSlide = (idx: number) => {
    setCurrentIdx(idx);
    setProgress(0);
  };

  // Progress Bar & Auto-Play timer
  useEffect(() => {
    if (totalCakes <= 1 || isPaused) return;

    const stepMs = 50;
    const increment = (stepMs / autoPlayIntervalMs) * 100;

    const timer = setInterval(() => {
      if (document.hidden) return;
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return Math.min(100, prev + increment);
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [totalCakes, isPaused, autoPlayIntervalMs, nextSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setIsPaused(false);
      return;
    }
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
    setIsPaused(false);
  };

  if (!validCakes || validCakes.length === 0) return null;

  const activeCake = validCakes[currentIdx] || validCakes[0];
  const displayId = activeCake.display_id || getCakeDisplayId(activeCake);

  return (
    <div
      className="hero-rotator-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <div
        className="hero-rotator-card"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid var(--gold-border)",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.07)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
        }}
      >
        {/* Top Gold Progress Timer Bar */}
        <div
          style={{
            height: "3px",
            background: "rgba(184, 134, 11, 0.12)",
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--gold), var(--gold-dark))",
              transition: isPaused ? "none" : "width 0.05s linear",
            }}
          />
        </div>

        {/* Card Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.85rem 1.15rem 0.25rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.32rem",
              fontSize: "0.74rem",
              fontWeight: 700,
              color: "var(--gold-dark)",
              letterSpacing: "0.02em",
            }}
          >
            <Sparkles size={11} style={{ color: "var(--gold)" }} />
            <span>Chef&apos;s Masterwork • #{displayId}</span>
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--text-muted)",
              }}
            >
              {currentIdx + 1} / {totalCakes}
            </span>
          </div>
        </div>

        {/* Center Stage Cake Photo with Smooth Transition & Floating Arrows */}
        <div
          style={{
            padding: "0.6rem 1rem",
            textAlign: "center",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "260px",
          }}
        >
          <Link
            href={`/cakes/${activeCake.slug}`}
            style={{ textDecoration: "none", display: "inline-block" }}
            tabIndex={0}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeCake.id || currentIdx}
              src={getOptimizedImageUrl(activeCake.image_url, { width: 540 })}
              alt={activeCake.name}
              loading="eager"
              decoding="async"
              className="hero-rotator-main-img"
              style={{
                maxWidth: "280px",
                maxHeight: "280px",
                width: "100%",
                height: "auto",
                aspectRatio: "1/1",
                objectFit: "contain",
                margin: "0 auto",
                filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.12))",
                transition: "transform 0.35s ease, opacity 0.35s ease",
              }}
            />
          </Link>

          {/* Left Arrow */}
          {totalCakes > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Creation"
              style={{
                position: "absolute",
                left: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.94)",
                border: "1px solid var(--gold-border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.12)",
                color: "var(--text-primary)",
                transition: "all 0.2s ease",
                zIndex: 2,
              }}
            >
              <ChevronLeft size={17} />
            </button>
          )}

          {/* Right Arrow */}
          {totalCakes > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Creation"
              style={{
                position: "absolute",
                right: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.94)",
                border: "1px solid var(--gold-border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.12)",
                color: "var(--text-primary)",
                transition: "all 0.2s ease",
                zIndex: 2,
              }}
            >
              <ChevronRight size={17} />
            </button>
          )}
        </div>

        {/* Cake Metadata & Order Action Section */}
        <div
          style={{
            padding: "0.85rem 1.25rem 1.15rem",
            borderTop: "1px solid var(--gold-border)",
            background: "var(--bg-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--gold-dark)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {activeCake.category_name || "Signature Creation"}
            </span>

            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--color-success)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--color-success)",
                  display: "inline-block",
                }}
              />
              Bespoke Fresh
            </span>
          </div>

          <Link
            href={`/cakes/${activeCake.slug}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <h3
              style={{
                margin: "0.15rem 0",
                fontSize: "1.08rem",
                fontFamily: "Cinzel, serif",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.3,
              }}
            >
              {activeCake.name}
            </h3>
          </Link>

          <p
            style={{
              margin: "0.2rem 0 0.85rem",
              fontStyle: "italic",
              fontSize: "0.82rem",
              color: "var(--gold-dark)",
              lineHeight: 1.4,
            }}
          >
            {activeCake.flavour || "Bespoke Chef Confection"}
          </p>

          {/* Centered Order Button */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.9rem" }}>
            <Link
              href={`/cakes/${activeCake.slug}`}
              className="btn-order-now"
              id={`hero-rotator-order-${displayId}`}
              style={{
                width: "100%",
                maxWidth: "260px",
                padding: "0.45rem 1.25rem",
                height: "36px",
                fontSize: "0.84rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <span>Order Now</span>
            </Link>
          </div>

          {/* Clickable Mini-Thumbnails Strip */}
          {totalCakes > 1 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.4rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Featured Milestone Tiers
                </span>
                <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                  Tap cake to view
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.45rem",
                  alignItems: "center",
                  overflowX: "auto",
                  paddingBottom: "0.25rem",
                  scrollbarWidth: "none",
                }}
              >
                {validCakes.map((cake, idx) => {
                  const isThumbActive = idx === currentIdx;
                  return (
                    <button
                      key={cake.id || idx}
                      onClick={() => goToSlide(idx)}
                      aria-label={`View cake #${cake.display_id || idx + 1}`}
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "10px",
                        border: isThumbActive
                          ? "2px solid var(--gold-dark)"
                          : "1px solid var(--gold-border)",
                        background: isThumbActive ? "var(--bg-cream)" : "#FFFFFF",
                        padding: "2px",
                        cursor: "pointer",
                        opacity: isThumbActive ? 1 : 0.65,
                        transform: isThumbActive ? "scale(1.08)" : "scale(1)",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(cake.image_url, { width: 100 })}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
