"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Crown, Award, ArrowRight } from "lucide-react";
import WhatsAppOrderModal from "./WhatsAppOrderModal";
import { Cake } from "../lib/types";

interface AnimatedPostersProps {
  whatsappNumber?: string;
}

export function LuxuryMarqueeTape() {
  const marqueeItems = [
    "100% Single-Origin Belgian Chocolate",
    "Hand-Piped Botanical Sugarcraft",
    "Heirloom Tiered Celebration Architecture",
    "Slow-Baked Artisanal European Butter",
    "Bespoke Confection Artistry by Tina Baidya",
    "Zero Artificial Essence or Shortenings",
    "Direct Studio Line: +91 8768388868",
  ];

  return (
    <div className="luxury-marquee-wrap" aria-hidden="true">
      <div className="luxury-marquee-track">
        {marqueeItems.concat(marqueeItems).map((text, idx) => (
          <span key={idx} className="marquee-item">
            <span className="marquee-spark">✦</span>
            <span>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function AtelierFeaturedPoster({ whatsappNumber = "918768388868" }: AnimatedPostersProps) {
  // Start at 0, suppress hydration mismatch using isMounted pattern
  const [activePosterIdx, setActivePosterIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only run client-side interactions after mount to avoid SSR flash
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const posters = [
    {
      id: "poster-1",
      badge: "2026 Signature Showcase",
      title: "The Royal Belgian Couverture & Vanilla Symphony",
      tagline: "Slow-Melted 70% Callebaut Ganache • 24K Edible Gold Leaf • Madagascar Bourbon Vanilla",
      description:
        "Crafted tier-by-tier with velvety European chocolate sponge, rich espresso-infused ganache, and crisp hazelnut praline flakes.",
      edition: "Limited Daily Batch: 8 Confections Only",
      accentColor: "#C5983A",
      bgGradient: "linear-gradient(135deg, #FFFDF8 0%, #FAF4E8 50%, #F5ECDD 100%)",
      icon: Crown,
    },
    {
      id: "poster-2",
      badge: "Bespoke Wedding Architecture",
      title: "Heirloom Tiered Botanicals & Ivory Silk Fondant",
      tagline: "Architectural Dowelled Stability • Sugar Bas-Relief Petals • Fresh Berry Compote",
      description:
        "Personalized by Chef Pâtissier Tina Baidya to complement your floral arrangements, venue lighting, and heirloom ceremony aesthetic.",
      edition: "Milestone Consultation Slots Open",
      accentColor: "#E11D48",
      bgGradient: "linear-gradient(135deg, #FFFDF9 0%, #FDF2F4 50%, #FCE8EC 100%)",
      icon: Sparkles,
    },
    {
      id: "poster-3",
      badge: "Seasonal Chef's Curated Edition",
      title: "Rosewater Raspberry & White Chocolate Velour",
      tagline: "Wild Mountain Raspberries • French Churned Butter • Delicate Floral Essence",
      description:
        "Feather-light chiffon sponge layered with house-made berry compote and silken Swiss meringue buttercream.",
      edition: "Fresh Seasonal Harvest Selection",
      accentColor: "#8F6418",
      bgGradient: "linear-gradient(135deg, #FFFDF8 0%, #F8F5EE 50%, #F4ECE0 100%)",
      icon: Award,
    },
  ];

  // Auto-cycle ONLY after client mount to prevent hydration flash
  useEffect(() => {
    if (!isMounted) return;
    const timer = setInterval(() => {
      setActivePosterIdx((prev) => (prev + 1) % posters.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isMounted, posters.length]);

  const current = posters[activePosterIdx];
  const IconComponent = current.icon;

  return (
    <>
      <div className="animated-poster-container" id="atelier-animated-poster">
        {/* Specular Light Sheen sweep animation */}
        <div className="poster-shimmer-sweep" />

        <div style={{ position: "relative", zIndex: 3 }}>
          {/* Top Poster Ribbon */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div className="poster-floating-tag">
              <IconComponent size={13} style={{ color: "var(--gold)" }} />
              <span>{current.badge}</span>
            </div>

            {/* Poster Tab Selectors - Only interactive after mount */}
            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
              {posters.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => isMounted && setActivePosterIdx(idx)}
                  aria-label={`View poster ${idx + 1}`}
                  style={{
                    width: idx === activePosterIdx ? "26px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: idx === activePosterIdx ? "var(--gold)" : "rgba(197, 152, 58, 0.28)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Poster Typography & Artwork Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.25rem",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--gold-dark)",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "0.35rem",
                }}
              >
                {current.edition}
              </span>

              <h3
                style={{
                  fontSize: "clamp(1.28rem, 3.2vw, 1.95rem)",
                  lineHeight: 1.18,
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  transition: "color 0.3s ease",
                }}
              >
                {current.title}
              </h3>

              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--gold-dark)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  marginBottom: "0.65rem",
                  lineHeight: 1.4,
                }}
              >
                {current.tagline}
              </p>

              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                  marginBottom: "1.15rem",
                  maxWidth: "600px",
                }}
              >
                {current.description}
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  maxWidth: "360px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="btn-order-now"
                  style={{ flex: 1, height: "38px", fontSize: "0.84rem" }}
                  id="poster-order-now-btn"
                >
                  <span>Order Now</span>
                </button>

                <Link
                  href="/cakes"
                  className="btn-gold"
                  style={{ flex: 1, height: "38px", fontSize: "0.82rem", padding: "0.45rem 1rem" }}
                >
                  <span>Explore Menu</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable modal triggered when patron clicks Order Now */}
      {isModalOpen && (
        <WhatsAppOrderModal
          cake={{
            id: current.id,
            name: current.title,
            slug: "bespoke-creation",
            description: current.description,
            flavour: current.tagline,
            image_url: "",
            available_sizes: ["0.5 kg (Small)", "1.0 kg (Medium)", "1.5 kg (Tiered)", "2.0 kg (Celebration)"],
            category_name: current.badge,
            status: "published",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export function DualEditorialPosters({ cakes = [] }: { cakes?: Cake[] }) {
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);

  if (!cakes || cakes.length === 0) return null;

  return (
    <>
      <div className="dual-posters-grid" id="editorial-dual-posters">
        {cakes.map((cake, idx) => {
          const Icon = idx % 2 === 0 ? Sparkles : Crown;
          const animDelay = `${(idx + 1) * 2}s`;
          return (
            <div key={cake.id} className="editorial-poster-card">
              <div className="poster-shimmer-sweep" style={{ animationDelay: animDelay }} />

              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                {cake.image_url ? (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      minWidth: "80px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: "1px solid rgba(197, 152, 58, 0.35)",
                      boxShadow: "var(--shadow-xs)",
                      background: "var(--bg-cream)",
                      position: "relative",
                    }}
                  >
                    <img
                      src={cake.image_url}
                      alt={cake.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="poster-floating-tag" style={{ marginBottom: "0.4rem", display: "inline-flex" }}>
                    <Icon size={11} style={{ color: "var(--gold)" }} />
                    <span>{cake.category_name || "Seasonal Creation"}</span>
                  </div>
                  <h4
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.15rem",
                      color: "var(--text-primary)",
                      lineHeight: 1.25,
                      marginBottom: "0.25rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={cake.name}
                  >
                    {cake.name}
                  </h4>
                  {cake.flavour && (
                    <p
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--gold-dark)",
                        fontStyle: "italic",
                        fontWeight: 500,
                        lineHeight: 1.3,
                        marginBottom: "0.25rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={cake.flavour}
                    >
                      {cake.flavour}
                    </p>
                  )}
                </div>
              </div>

              {cake.description && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cake.description}
                </p>
              )}

              <div style={{ marginTop: "auto", display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedCake(cake)}
                  className="btn-order-now"
                  style={{ flex: 1, height: "36px", fontSize: "0.82rem" }}
                >
                  <span>Order Now</span>
                </button>
                <Link
                  href={`/cakes/${cake.slug}`}
                  className="btn-outline-gold"
                  style={{
                    padding: "0 0.85rem",
                    height: "36px",
                    fontSize: "0.78rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCake && (
        <WhatsAppOrderModal
          cake={selectedCake}
          isOpen={Boolean(selectedCake)}
          onClose={() => setSelectedCake(null)}
        />
      )}
    </>
  );
}
