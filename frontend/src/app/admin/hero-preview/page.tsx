"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Monitor,
  Smartphone,
  Layers,
  Flame,
  ArrowRight,
  Clock,
  Heart,
  Palette,
  RotateCcw,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { getPublishedCakes } from "../../../lib/api";
import { Cake } from "../../../lib/types";

// Curated Fallback Mock Cakes in case database has few items
const SAMPLE_CAKES: Cake[] = [
  {
    id: "sample-1",
    name: "Korean 2D Comic 'Happy Birthday' Sunny Egg Cake",
    slug: "korean-2d-comic-sunny-egg",
    description: "Artisanal 2D comic milestone cake with velvety sponge and Madagascar vanilla cream.",
    flavour: "Madagascar Bourbon Vanilla Bean & Whipped Fresh Milk Cream",
    category_name: "Comic 2D Cakes",
    display_id: "1001",
    image_url: "https://res.cloudinary.com/gviwlymx/image/upload/v1741190432/lush_layers/cakes/cake_1001.webp",
    available_sizes: ["0.5 kg", "1.0 kg", "2.0 kg"],
    is_hero: true,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    name: "Rose Petal Chantilly Celebration Tier",
    slug: "rose-petal-chantilly-tier",
    description: "Multi-tiered celebration gateau infused with Damascus rosewater and white chocolate ganache.",
    flavour: "Damascus Rosewater, Lychee Confit & White Chocolate",
    category_name: "Couture Wedding",
    display_id: "1004",
    image_url: "https://res.cloudinary.com/gviwlymx/image/upload/v1741190440/lush_layers/cakes/cake_1004.webp",
    available_sizes: ["1.0 kg", "1.5 kg", "3.0 kg"],
    is_hero: true,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    name: "Modernist Comic Strip Buttercream Cake",
    slug: "modernist-comic-strip-cake",
    description: "Hand-painted black outline comic confection layered with rich Belgian chocolate ganache.",
    flavour: "Belgian Dark Chocolate Ganache & Hazelnut Praline",
    category_name: "Comic 2D Cakes",
    display_id: "1006",
    image_url: "https://res.cloudinary.com/gviwlymx/image/upload/v1741190450/lush_layers/cakes/cake_1006.webp",
    available_sizes: ["0.5 kg", "1.0 kg"],
    is_hero: true,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-4",
    name: "Rosewater & Strawberry Champagne Gateau",
    slug: "rosewater-strawberry-champagne",
    description: "Sophisticated celebration confection with macerated strawberries and champagne mousse.",
    flavour: "Macerated Wild Strawberries & Champagne Mousse",
    category_name: "Artisanal Gateaux",
    display_id: "1005",
    image_url: "https://res.cloudinary.com/gviwlymx/image/upload/v1741190445/lush_layers/cakes/cake_1005.webp",
    available_sizes: ["1.0 kg", "2.0 kg"],
    is_hero: false,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-5",
    name: "Bespoke 2D Cartoon Line-Art Celebration Gateau",
    slug: "bespoke-2d-cartoon-celebration",
    description: "Whimsical line-art creation with creamy salted caramel buttercream and roasted pecans.",
    flavour: "Salted Caramel Buttercream & Roasted Pecans",
    category_name: "Comic 2D Cakes",
    display_id: "1003",
    image_url: "https://res.cloudinary.com/gviwlymx/image/upload/v1741190435/lush_layers/cakes/cake_1003.webp",
    available_sizes: ["1.0 kg", "1.5 kg"],
    is_hero: false,
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export default function HeroDesignStudioPage() {
  const [activeConcept, setActiveConcept] = useState<number>(1);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [cakes, setCakes] = useState<Cake[]>(SAMPLE_CAKES);

  useEffect(() => {
    getPublishedCakes().then((data) => {
      if (data && data.length >= 3) {
        setCakes(data);
      }
    }).catch(() => {});
  }, []);

  const concepts = [
    {
      id: 1,
      title: "1. Atelier Masterwork Rotator",
      tagline: "Haute Couture 2-Column with Smooth Auto-Cycling & Mini Thumbnails",
      badge: "Balanced & Elegant",
      description: "Keeps the classic editorial left copy and trust badges, while transforming the right side into a live cycling showcase with thumbnail strip, smooth crossfade, and auto-progress bar."
    },
    {
      id: 2,
      title: "2. Cinematic Editorial Split",
      tagline: "Vogue-Style 50/50 Split with Big Numeric Index (01/05) & Sensory Flavor Notes",
      badge: "Luxury Editorial",
      description: "Dramatic typography with changing tasting notes as cakes cycle, floating gold masterwork badge, and a vertical navigation strip on the right."
    },
    {
      id: 3,
      title: "3. Center-Stage 3D Coverflow",
      tagline: "Apple Keynote-Style 3D Flanking Showcase with Peeking Adjacent Cakes",
      badge: "Modern & Dynamic",
      description: "Centered headline with a 3-card 3D glide track. The active center cake glows with a golden halo, while adjacent cakes peek in at 85% scale, inviting horizontal swipes."
    },
    {
      id: 4,
      title: "4. Artisan Luxury Bento Grid",
      tagline: "Multi-Tile Interactive Bento: Masterwork Spotlight + Fresh Baking Live Status",
      badge: "High Conversion",
      description: "Modern Bento layout: Primary tile has live rotating masterwork, Top-Right tile shows 'Today's Fresh Batch' live bakery status, and Bottom-Right tile features customer favourites."
    },
    {
      id: 5,
      title: "5. Atmospheric Storybook Canvas",
      tagline: "Instagram/Fashion Runway Story-Bar Hero with Tap Progression & Glassmorphism",
      badge: "Ultra Engaging",
      description: "Features segmented Instagram-style story progression bars at the top that smoothly fill up as each cake auto-advances. Floating frosted glass card with 1-click WhatsApp order."
    }
  ];

  return (
    <div style={{ padding: "0.5rem 0", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
      {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(184, 134, 11, 0.12)", color: "#8A6D1C", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              <Sparkles size={13} />
              <span>Hero Architecture Studio</span>
            </div>
            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "1.9rem", color: "#1E2A22", margin: "0 0 0.3rem", fontWeight: 700 }}>
              5 Unique Hero Section Concepts
            </h1>
            <p style={{ color: "#667085", fontSize: "0.88rem", margin: 0 }}>
              Review 5 interactive, responsive hero section designs tailored for Lush Layers. Test live cycling and switch between Desktop & Mobile viewports.
            </p>
          </div>

          {/* Device Switcher */}
          <div style={{ display: "inline-flex", background: "#EAE5D9", padding: "0.25rem", borderRadius: "10px", gap: "0.25rem" }}>
            <button
              onClick={() => setDeviceMode("desktop")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.9rem",
                borderRadius: "8px",
                border: "none",
                background: deviceMode === "desktop" ? "#FFFFFF" : "transparent",
                color: deviceMode === "desktop" ? "#1E2A22" : "#667085",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: deviceMode === "desktop" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <Monitor size={15} />
              <span>Desktop View</span>
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.9rem",
                borderRadius: "8px",
                border: "none",
                background: deviceMode === "mobile" ? "#FFFFFF" : "transparent",
                color: deviceMode === "mobile" ? "#1E2A22" : "#667085",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: deviceMode === "mobile" ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <Smartphone size={15} />
              <span>Mobile Preview</span>
            </button>
          </div>
        </div>

        {/* Concept Selector Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", marginBottom: "1.75rem" }}>
          {concepts.map((c) => {
            const isSelected = activeConcept === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConcept(c.id)}
                style={{
                  background: isSelected ? "#FFFFFF" : "#F4F0E8",
                  border: isSelected ? "2px solid #8A6D1C" : "1px solid #E2DCCF",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 6px 16px rgba(138, 109, 28, 0.12)" : "none",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: isSelected ? "#8A6D1C" : "#667085", background: isSelected ? "rgba(138,109,28,0.12)" : "rgba(0,0,0,0.05)", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                    {c.badge}
                  </span>
                  {isSelected && <CheckCircle2 size={15} style={{ color: "#8A6D1C" }} />}
                </div>
                <h4 style={{ margin: "0.15rem 0 0", fontSize: "0.92rem", fontWeight: 700, color: isSelected ? "#1E2A22" : "#4A5568" }}>
                  {c.title}
                </h4>
                <p style={{ margin: 0, fontSize: "0.74rem", color: "#718096", lineHeight: 1.3 }}>
                  {c.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Concept Overview Callout */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2DCCF", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <span style={{ fontWeight: 700, color: "#8A6D1C", fontSize: "0.84rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Active Concept {activeConcept}:
            </span>
            <span style={{ fontWeight: 600, color: "#1E2A22", fontSize: "0.92rem", marginLeft: "0.5rem" }}>
              {concepts.find(c => c.id === activeConcept)?.title}
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "#667085" }}>
              {concepts.find(c => c.id === activeConcept)?.description}
            </p>
          </div>
          <div style={{ fontSize: "0.78rem", color: "#8A6D1C", fontWeight: 600, background: "rgba(138,109,28,0.08)", padding: "0.35rem 0.8rem", borderRadius: "8px" }}>
            ✨ Live Interactive Simulation
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div
          style={{
            background: deviceMode === "mobile" ? "#1E2A22" : "#FFFFFF",
            border: "1px solid #E2DCCF",
            borderRadius: "16px",
            padding: deviceMode === "mobile" ? "2.5rem 1rem" : "0",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "600px"
          }}
        >
          {deviceMode === "mobile" ? (
            /* Mobile Device Frame Mockup */
            <div
              style={{
                width: "390px",
                maxWidth: "100%",
                background: "#FDFBF7",
                borderRadius: "36px",
                overflow: "hidden",
                border: "8px solid #2D3748",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                position: "relative"
              }}
            >
              {/* Dynamic Island / Notch */}
              <div style={{ height: "26px", background: "#2D3748", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: "90px", height: "14px", background: "#1A202C", borderRadius: "9999px" }} />
              </div>

              {/* Mobile Content */}
              <div style={{ maxHeight: "780px", overflowY: "auto", paddingBottom: "1.5rem" }}>
                {renderHeroConcept(activeConcept, cakes, true)}
              </div>
            </div>
          ) : (
            /* Full Desktop Canvas */
            <div style={{ width: "100%", background: "#FDFBF7" }}>
              {renderHeroConcept(activeConcept, cakes, false)}
            </div>
          )}
        </div>
      </div>
  );
}

// ============================================================================
// RENDERER ROUTER FOR THE 5 CONCEPTS
// ============================================================================
function renderHeroConcept(conceptId: number, cakes: Cake[], isMobile: boolean) {
  switch (conceptId) {
    case 1:
      return <ConceptOneAtelierRotator cakes={cakes} isMobile={isMobile} />;
    case 2:
      return <ConceptTwoEditorialSplit cakes={cakes} isMobile={isMobile} />;
    case 3:
      return <ConceptThreeCoverflow cakes={cakes} isMobile={isMobile} />;
    case 4:
      return <ConceptFourBento cakes={cakes} isMobile={isMobile} />;
    case 5:
      return <ConceptFiveStorybook cakes={cakes} isMobile={isMobile} />;
    default:
      return <ConceptOneAtelierRotator cakes={cakes} isMobile={isMobile} />;
  }
}

// ============================================================================
// CONCEPT 1: ATELIER MASTERWORK ROTATOR
// 2-Column with live cycling right showcase & thumbnail selector
// ============================================================================
function ConceptOneAtelierRotator({ cakes, isMobile }: { cakes: Cake[]; isMobile: boolean }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIdx((c) => (c + 1) % cakes.length);
          return 0;
        }
        return prev + 2;
      });
    }, 70);
    return () => clearInterval(interval);
  }, [currentIdx, cakes.length]);

  const activeCake = cakes[currentIdx] || cakes[0];

  return (
    <section style={{ padding: isMobile ? "1.5rem 1rem" : "3rem 2.5rem", background: "#FDFBF7", position: "relative" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr", gap: isMobile ? "1.5rem" : "3rem", alignItems: "center" }}>
          {/* Left: Headline & Trust Badges */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(184, 134, 11, 0.12)", color: "#8A6D1C", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.6rem" }}>
              <Sparkles size={11} />
              <span>LUSH LAYERS • PB Road, Kolkata</span>
            </div>

            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: isMobile ? "1.75rem" : "2.5rem", lineHeight: 1.15, color: "#1E2A22", margin: "0 0 0.75rem", fontWeight: 700 }}>
              Couture Confections, <br />
              <span style={{ background: "linear-gradient(135deg, #B8860B, #D4AF37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Made with Love
              </span>
            </h1>

            <p style={{ color: "#4A5568", fontSize: isMobile ? "0.85rem" : "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Architectural tiers, velvety ganache, and hand-piped florals. Every bespoke creation is crafted fresh for your most cherished milestones.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <button style={{ background: "linear-gradient(135deg, #B8860B, #996515)", color: "#FFFFFF", border: "none", padding: "0.6rem 1.4rem", borderRadius: "9999px", fontWeight: 600, fontSize: "0.86rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(184, 134, 11, 0.25)" }}>
                Explore All Cakes
              </button>
              <button style={{ background: "#FFFFFF", color: "#8A6D1C", border: "1.5px solid #8A6D1C", padding: "0.6rem 1.4rem", borderRadius: "9999px", fontWeight: 600, fontSize: "0.86rem", cursor: "pointer" }}>
                Order via WhatsApp
              </button>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.78rem", color: "#2D3748" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Check size={13} style={{ color: "#8A6D1C" }} /> <span>100% Artisanal Fresh</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Check size={13} style={{ color: "#8A6D1C" }} /> <span>Direct with Tina</span>
              </div>
            </div>
          </div>

          {/* Right: Masterwork Rotating Showcase */}
          <div>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", border: "1px solid #E8E2D5", boxShadow: "0 15px 35px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative" }}>
              {/* Progress bar */}
              <div style={{ height: "3px", background: "#F0EBE1", width: "100%" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #B8860B, #D4AF37)", transition: "width 0.07s linear" }} />
              </div>

              {/* Badge & Index Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem 0.25rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.74rem", fontWeight: 700, color: "#8A6D1C" }}>
                  <Sparkles size={11} />
                  <span>Chef's Masterwork • #{activeCake.display_id || "1001"}</span>
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#A0AEC0" }}>
                  {currentIdx + 1} / {cakes.length}
                </span>
              </div>

              {/* Center Cake Image with Smooth Transition */}
              <div style={{ padding: "0.75rem 1.25rem", textAlign: "center", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activeCake.id}
                  src={activeCake.image_url}
                  alt={activeCake.name}
                  style={{
                    width: isMobile ? "220px" : "310px",
                    height: isMobile ? "220px" : "310px",
                    objectFit: "contain",
                    margin: "0 auto",
                    transition: "all 0.4s ease",
                    filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.12))"
                  }}
                />

                {/* Left/Right Floating Navigation Arrows */}
                <button
                  onClick={() => setCurrentIdx((c) => (c - 1 + cakes.length) % cakes.length)}
                  style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #E2D8C3", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentIdx((c) => (c + 1) % cakes.length)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #E2D8C3", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Cake Details Card */}
              <div style={{ padding: "0.75rem 1.25rem 1.25rem", borderTop: "1px solid #F5F0E6" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A6D1C", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {activeCake.category_name || "Signature"}
                </span>
                <h3 style={{ margin: "0.2rem 0", fontSize: isMobile ? "0.95rem" : "1.1rem", fontFamily: "Cinzel, serif", fontWeight: 700, color: "#1E2A22" }}>
                  {activeCake.name}
                </h3>
                <p style={{ margin: "0 0 0.85rem", fontStyle: "italic", fontSize: "0.8rem", color: "#8A6D1C" }}>
                  {activeCake.flavour}
                </p>

                {/* Bottom Thumbnails Strip */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", overflowX: "auto", paddingBottom: "0.25rem" }}>
                  {cakes.map((cake, idx) => {
                    const isThumbActive = idx === currentIdx;
                    return (
                      <button
                        key={cake.id}
                        onClick={() => setCurrentIdx(idx)}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          border: isThumbActive ? "2px solid #8A6D1C" : "1px solid #E2DCCF",
                          background: "#FFFFFF",
                          padding: "2px",
                          cursor: "pointer",
                          opacity: isThumbActive ? 1 : 0.6,
                          transform: isThumbActive ? "scale(1.08)" : "scale(1)",
                          transition: "all 0.2s ease",
                          flexShrink: 0
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cake.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONCEPT 2: CINEMATIC EDITORIAL SPLIT
// Vogue-Style 50/50 with Big Numeric Counter & Live Flavor Tasting Notes
// ============================================================================
function ConceptTwoEditorialSplit({ cakes, isMobile }: { cakes: Cake[]; isMobile: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCake = cakes[activeIdx] || cakes[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % cakes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [cakes.length]);

  return (
    <section style={{ padding: isMobile ? "1.5rem 1rem" : "3.5rem 2.5rem", background: "#F7F4EC", position: "relative" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "1.5rem" : "3.5rem", alignItems: "center" }}>
          {/* Left: High-Fashion Headline & Real-time Flavor Notes */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "2.8rem", fontWeight: 700, color: "#8A6D1C", lineHeight: 1 }}>
                0{activeIdx + 1}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#A0AEC0" }}>
                / 0{cakes.length} EDITION
              </span>
            </div>

            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: isMobile ? "1.85rem" : "2.6rem", lineHeight: 1.15, color: "#1E2A22", margin: "0 0 1rem", fontWeight: 700 }}>
              {activeCake.name}
            </h1>

            {/* Tasting Notes Box */}
            <div style={{ background: "#FFFFFF", borderRadius: "14px", border: "1px solid #E8E0D0", padding: "1.1rem 1.25rem", marginBottom: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", fontWeight: 700, color: "#8A6D1C", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
                <Flame size={13} />
                <span>Chef's Tasting Notes</span>
              </div>
              <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.88rem", color: "#2D3748", lineHeight: 1.5 }}>
                &ldquo;{activeCake.flavour}&rdquo;
              </p>
              <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {(activeCake.available_sizes || ["1.0 kg", "2.0 kg"]).map((size) => (
                  <span key={size} style={{ fontSize: "0.72rem", background: "#F4F0E6", color: "#4A5568", padding: "0.2rem 0.55rem", borderRadius: "6px", fontWeight: 600 }}>
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button style={{ background: "#1E2A22", color: "#FDFBF7", border: "none", padding: "0.7rem 1.6rem", borderRadius: "9999px", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                <span>Order This Edition</span>
                <ArrowRight size={15} />
              </button>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button onClick={() => setActiveIdx((a) => (a - 1 + cakes.length) % cakes.length)} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #DCD3C0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setActiveIdx((a) => (a + 1) % cakes.length)} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #DCD3C0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Giant Portrait Display with Vertical Quick Bar */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ flex: 1, background: "#FFFFFF", borderRadius: "24px", border: "1px solid #E8E0D0", padding: "1.5rem", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", position: "relative" }}>
              <span style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(184, 134, 11, 0.12)", color: "#8A6D1C", fontSize: "0.74rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "9999px" }}>
                #{activeCake.display_id || "1001"}
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeCake.image_url}
                alt={activeCake.name}
                style={{ width: isMobile ? "240px" : "330px", height: isMobile ? "240px" : "330px", objectFit: "contain", margin: "1rem auto 0.5rem", filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.12))" }}
              />

              <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "1rem" }}>
                {cakes.map((_, i) => (
                  <div key={i} onClick={() => setActiveIdx(i)} style={{ width: i === activeIdx ? "24px" : "8px", height: "8px", borderRadius: "9999px", background: i === activeIdx ? "#8A6D1C" : "#E2DCCF", cursor: "pointer", transition: "all 0.3s ease" }} />
                ))}
              </div>
            </div>

            {/* Vertical Mini-ribbon on Desktop */}
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {cakes.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "10px",
                      border: i === activeIdx ? "2px solid #8A6D1C" : "1px solid #E0D7C4",
                      background: "#FFFFFF",
                      padding: "3px",
                      cursor: "pointer",
                      opacity: i === activeIdx ? 1 : 0.5,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONCEPT 3: CENTER-STAGE 3D COVERFLOW
// Apple Keynote-Style 3D Flanking Showcase with Peeking Side Cards
// ============================================================================
function ConceptThreeCoverflow({ cakes, isMobile }: { cakes: Cake[]; isMobile: boolean }) {
  const [centerIdx, setCenterIdx] = useState(0);

  const prevIdx = (centerIdx - 1 + cakes.length) % cakes.length;
  const nextIdx = (centerIdx + 1) % cakes.length;

  const currentCake = cakes[centerIdx] || cakes[0];

  return (
    <section style={{ padding: isMobile ? "2rem 1rem" : "3.5rem 2rem", background: "linear-gradient(180deg, #FDFBF7 0%, #F5EFE1 100%)", textAlign: "center", overflow: "hidden" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Centered Atelier Title */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(184, 134, 11, 0.12)", color: "#8A6D1C", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.6rem" }}>
          <Sparkles size={11} />
          <span>Curated Confection Gallery</span>
        </div>

        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: isMobile ? "1.85rem" : "2.8rem", color: "#1E2A22", margin: "0 0 0.5rem", fontWeight: 700 }}>
          The Haute Patisserie Gallery
        </h1>
        <p style={{ color: "#667085", fontSize: "0.92rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
          Swipe or click cards to glide through Tina&apos;s latest bespoke milestone masterpieces.
        </p>

        {/* 3D Coverflow Track */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: isMobile ? "0.5rem" : "1.75rem", position: "relative" }}>
          {/* Left Peeking Card */}
          {!isMobile && (
            <div
              onClick={() => setCenterIdx(prevIdx)}
              style={{
                width: "220px",
                background: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E5DFD1",
                padding: "1rem",
                opacity: 0.55,
                transform: "scale(0.82) rotateY(15deg)",
                cursor: "pointer",
                transition: "all 0.4s ease",
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
              }}
            >
              <span style={{ fontSize: "0.72rem", color: "#8A6D1C", fontWeight: 700 }}>#{cakes[prevIdx]?.display_id}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cakes[prevIdx]?.image_url} alt="" style={{ width: "160px", height: "160px", objectFit: "contain", margin: "0.5rem auto" }} />
              <h4 style={{ fontSize: "0.84rem", fontFamily: "Cinzel, serif", color: "#2D3748", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {cakes[prevIdx]?.name}
              </h4>
            </div>
          )}

          {/* Center Stage Elevated Card */}
          <div
            style={{
              width: isMobile ? "320px" : "420px",
              background: "#FFFFFF",
              borderRadius: "24px",
              border: "2px solid #D4AF37",
              padding: isMobile ? "1.25rem" : "1.75rem",
              boxShadow: "0 25px 50px rgba(184, 134, 11, 0.15), 0 10px 20px rgba(0,0,0,0.06)",
              transform: "scale(1)",
              zIndex: 2,
              position: "relative",
              transition: "all 0.4s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ background: "linear-gradient(135deg, #B8860B, #D4AF37)", color: "#FFFFFF", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                #{currentCake.display_id || "1001"} • Spotlight
              </span>
              <span style={{ fontSize: "0.75rem", color: "#718096", fontWeight: 600 }}>
                {centerIdx + 1} of {cakes.length}
              </span>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentCake.image_url}
              alt={currentCake.name}
              style={{
                width: isMobile ? "200px" : "270px",
                height: isMobile ? "200px" : "270px",
                objectFit: "contain",
                margin: "0.5rem auto",
                filter: "drop-shadow(0 14px 25px rgba(0,0,0,0.15))"
              }}
            />

            <h3 style={{ fontFamily: "Cinzel, serif", fontSize: isMobile ? "1.05rem" : "1.25rem", color: "#1E2A22", margin: "0.5rem 0 0.25rem", fontWeight: 700 }}>
              {currentCake.name}
            </h3>
            <p style={{ fontStyle: "italic", fontSize: "0.82rem", color: "#8A6D1C", margin: "0 0 1rem" }}>
              {currentCake.flavour}
            </p>

            <button style={{ background: "linear-gradient(135deg, #B8860B, #996515)", color: "#FFFFFF", border: "none", width: "100%", padding: "0.65rem 0", borderRadius: "9999px", fontWeight: 600, fontSize: "0.86rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(184, 134, 11, 0.25)" }}>
              Order This Creation
            </button>
          </div>

          {/* Right Peeking Card */}
          {!isMobile && (
            <div
              onClick={() => setCenterIdx(nextIdx)}
              style={{
                width: "220px",
                background: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E5DFD1",
                padding: "1rem",
                opacity: 0.55,
                transform: "scale(0.82) rotateY(-15deg)",
                cursor: "pointer",
                transition: "all 0.4s ease",
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
              }}
            >
              <span style={{ fontSize: "0.72rem", color: "#8A6D1C", fontWeight: 700 }}>#{cakes[nextIdx]?.display_id}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cakes[nextIdx]?.image_url} alt="" style={{ width: "160px", height: "160px", objectFit: "contain", margin: "0.5rem auto" }} />
              <h4 style={{ fontSize: "0.84rem", fontFamily: "Cinzel, serif", color: "#2D3748", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {cakes[nextIdx]?.name}
              </h4>
            </div>
          )}
        </div>

        {/* Carousel Arrow Navigation */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
          <button onClick={() => setCenterIdx(prevIdx)} style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #DCD3C0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#667085" }}>
            Swipe or use arrows to browse
          </span>
          <button onClick={() => setCenterIdx(nextIdx)} style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#FFFFFF", border: "1px solid #DCD3C0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONCEPT 4: ARTISAN LUXURY BENTO GRID
// Multi-Tile Interactive Bento: Masterwork Spotlight + Fresh Baking Status
// ============================================================================
function ConceptFourBento({ cakes, isMobile }: { cakes: Cake[]; isMobile: boolean }) {
  const [bentoIdx, setBentoIdx] = useState(0);
  const activeCake = cakes[bentoIdx] || cakes[0];

  return (
    <section style={{ padding: isMobile ? "1.5rem 1rem" : "3.5rem 2.5rem", background: "#FDFBF7" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.9fr", gap: "1.5rem", alignItems: "stretch" }}>
          {/* Main Hero Tile: Interactive Spotlight */}
          <div style={{ background: "#FFFFFF", borderRadius: "24px", border: "1px solid #E8E0CE", padding: isMobile ? "1.5rem" : "2.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ background: "rgba(184, 134, 11, 0.12)", color: "#8A6D1C", fontSize: "0.74rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "9999px" }}>
                  ⭐ Masterwork of the Day • #{activeCake.display_id || "1001"}
                </span>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button onClick={() => setBentoIdx((b) => (b - 1 + cakes.length) % cakes.length)} style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4EFE6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setBentoIdx((b) => (b + 1) % cakes.length)} style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4EFE6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <h2 style={{ fontFamily: "Cinzel, serif", fontSize: isMobile ? "1.45rem" : "2rem", color: "#1E2A22", margin: "0 0 0.4rem", fontWeight: 700 }}>
                {activeCake.name}
              </h2>
              <p style={{ color: "#8A6D1C", fontStyle: "italic", fontSize: "0.85rem", margin: "0 0 1rem" }}>
                {activeCake.flavour}
              </p>
            </div>

            <div style={{ textAlign: "center", margin: "1rem 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeCake.image_url} alt="" style={{ width: isMobile ? "200px" : "280px", height: isMobile ? "200px" : "280px", objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 14px 25px rgba(0,0,0,0.12))" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F4EFE6", paddingTop: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#718096" }}>Freshly Handcrafted</span>
                <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#2D3748" }}>Signature Atelier Bake</div>
              </div>
              <button style={{ background: "#1E2A22", color: "#FFFFFF", border: "none", padding: "0.55rem 1.3rem", borderRadius: "9999px", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer" }}>
                Order Now
              </button>
            </div>
          </div>

          {/* Right Sub-Tiles Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Tile 2: Today's Live Status */}
            <div style={{ background: "linear-gradient(135deg, #2E3E34 0%, #1A261F 100%)", borderRadius: "20px", color: "#FFFFFF", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#D4AF37", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                <Clock size={13} />
                <span>Tina&apos;s Live Atelier Status</span>
              </div>
              <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "1.2rem", margin: "0 0 0.4rem", fontWeight: 700 }}>
                Accepting Orders for Today & Upcoming Weekends
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#CBD5E0", margin: "0 0 0.75rem", lineHeight: 1.5 }}>
                Direct WhatsApp consultation with Baker Tina Baidya for custom designs, eggless options, and delivery across Kolkata.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#D4AF37", fontSize: "0.8rem", fontWeight: 600 }}>
                <span>Chat directly on WhatsApp</span>
                <ArrowRight size={13} />
              </div>
            </div>

            {/* Tile 3: Quick Mini-Carousel of Favourites */}
            <div style={{ background: "#FFFFFF", borderRadius: "20px", border: "1px solid #E8E0CE", padding: "1.25rem", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8A6D1C", textTransform: "uppercase" }}>
                  Trending Favourites
                </span>
                <span style={{ fontSize: "0.72rem", color: "#718096" }}>Tap to inspect</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
                {cakes.slice(0, 3).map((c, i) => (
                  <div
                    key={c.id}
                    onClick={() => setBentoIdx(i)}
                    style={{
                      background: "#FDFBF7",
                      borderRadius: "12px",
                      border: i === bentoIdx ? "2px solid #8A6D1C" : "1px solid #EAE3D5",
                      padding: "0.5rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image_url} alt="" style={{ width: "50px", height: "50px", objectFit: "contain", margin: "0 auto" }} />
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1E2A22", marginTop: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.name.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONCEPT 5: ATMOSPHERIC STORYBOOK CANVAS
// Instagram-Style Story Progress Bars with Smooth Auto-Advance & Frosted Card
// ============================================================================
function ConceptFiveStorybook({ cakes, isMobile }: { cakes: Cake[]; isMobile: boolean }) {
  const [storyIdx, setStoryIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStoryIdx((s) => (s + 1) % cakes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [cakes.length]);

  const activeCake = cakes[storyIdx] || cakes[0];

  return (
    <section style={{ padding: isMobile ? "1.5rem 1rem" : "3rem 2.5rem", background: "linear-gradient(135deg, #1E2A22 0%, #29382F 100%)", color: "#FFFFFF", position: "relative" }}>
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        {/* Story Segment Bars (Like Instagram Stories) */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem" }}>
          {cakes.map((_, i) => (
            <div
              key={i}
              onClick={() => setStoryIdx(i)}
              style={{
                flex: 1,
                height: "3px",
                background: i <= storyIdx ? "#D4AF37" : "rgba(255,255,255,0.2)",
                borderRadius: "2px",
                cursor: "pointer",
                transition: "background 0.3s ease"
              }}
            />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr", gap: "2.5rem", alignItems: "center" }}>
          {/* Left: Atmospheric Story Narrative */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(212, 175, 55, 0.15)", color: "#D4AF37", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.74rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              <Sparkles size={11} />
              <span>Story #{storyIdx + 1} • Chef&apos;s Showcase</span>
            </div>

            <h1 style={{ fontFamily: "Cinzel, serif", fontSize: isMobile ? "1.85rem" : "2.8rem", lineHeight: 1.15, margin: "0 0 0.85rem", fontWeight: 700, color: "#FDFBF7" }}>
              {activeCake.name}
            </h1>

            <p style={{ color: "#E2E8F0", fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              &ldquo;{activeCake.flavour}&rdquo;
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <button style={{ background: "linear-gradient(135deg, #D4AF37, #B8860B)", color: "#1A202C", border: "none", padding: "0.65rem 1.6rem", borderRadius: "9999px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                Order via WhatsApp
              </button>
              <button onClick={() => setStoryIdx((s) => (s + 1) % cakes.length)} style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)", padding: "0.65rem 1.25rem", borderRadius: "9999px", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer" }}>
                Next Story →
              </button>
            </div>
          </div>

          {/* Right: Floating Frosted Showcase */}
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "28px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
              <span style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "#D4AF37", color: "#1A202C", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                #{activeCake.display_id || "1001"}
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeCake.image_url}
                alt={activeCake.name}
                style={{ width: isMobile ? "220px" : "300px", height: isMobile ? "220px" : "300px", objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.35))" }}
              />

              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.4rem" }}>
                {cakes.map((_, i) => (
                  <div key={i} onClick={() => setStoryIdx(i)} style={{ width: i === storyIdx ? "20px" : "6px", height: "6px", borderRadius: "9999px", background: i === storyIdx ? "#D4AF37" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.3s ease" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
