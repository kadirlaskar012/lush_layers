"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Crown, Award, ArrowRight, Tag, Gift, Percent } from "lucide-react";
import WhatsAppOrderModal from "./WhatsAppOrderModal";
import { Cake, Promotion } from "../lib/types";

interface AnimatedPostersProps {
  whatsappNumber?: string;
  promotions?: Promotion[];
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

export function AtelierFeaturedPoster({
  whatsappNumber = "918768388868",
  promotions,
}: AnimatedPostersProps) {
  const [activePosterIdx, setActivePosterIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultPosters = [
    {
      id: "poster-1",
      badge: "First Customer Discount 5%",
      title: "First Customer Celebration & Welcome",
      tagline: "Above 1000 bill user will get 5% discount and an addon cake",
      description:
        "Enjoy an exclusive 5% welcome discount on your initial luxury confection booking, plus an exquisite complimentary artisan addon cake when order exceeds ₹1,000.",
      edition: "First Customer Special Welcome Edition",
      promo_code: "FIRST5",
      discount_percent: 5,
      min_order_amount: 1000,
      addon_perk: "Complimentary Addon Mini Cake",
      image_url: "",
      accentColor: "#C5983A",
      bgGradient: "linear-gradient(135deg, #FFFDF8 0%, #FAF4E8 50%, #F5ECDD 100%)",
      icon: Crown,
    },
    {
      id: "poster-2",
      badge: "Seasonal Chef's Curated Edition",
      title: "The Royal Belgian Couverture & Vanilla Symphony",
      tagline: "Slow-Melted 70% Callebaut Ganache • 24K Edible Gold Leaf • Madagascar Bourbon Vanilla",
      description:
        "Crafted tier-by-tier with velvety European chocolate sponge, rich espresso-infused ganache, and crisp hazelnut praline flakes.",
      edition: "Limited Daily Batch: 8 Confections Only",
      promo_code: "CHEF10",
      discount_percent: 10,
      min_order_amount: 1500,
      addon_perk: "Artisan Macaron Gift Box",
      image_url: "",
      accentColor: "#C5983A",
      bgGradient: "linear-gradient(135deg, #FFFDF8 0%, #FAF4E8 50%, #F5ECDD 100%)",
      icon: Crown,
    },
    {
      id: "poster-3",
      badge: "Bespoke Wedding Architecture",
      title: "Heirloom Tiered Botanicals & Ivory Silk Fondant",
      tagline: "Architectural Dowelled Stability • Sugar Bas-Relief Petals • Fresh Berry Compote",
      description:
        "Personalized by Chef Pâtissier Tina Baidya to complement your floral arrangements, venue lighting, and heirloom ceremony aesthetic.",
      edition: "Milestone Consultation Slots Open",
      promo_code: "ROYAL5",
      discount_percent: 5,
      min_order_amount: 1000,
      addon_perk: "Complimentary Addon Mini Cake",
      image_url: "",
      accentColor: "#E11D48",
      bgGradient: "linear-gradient(135deg, #FFFDF9 0%, #FDF2F4 50%, #FCE8EC 100%)",
      icon: Sparkles,
    },
  ];

  const hasDbPromos = Boolean(promotions && promotions.length > 0);

  const posters = hasDbPromos
    ? (promotions as Promotion[]).map((p, idx) => ({
        id: p.id,
        badge: p.badge || "Special Offer",
        title: p.title,
        tagline: p.tagline || "",
        description: p.description || "",
        edition: p.edition || "Limited Edition",
        promo_code: p.promo_code,
        discount_percent: p.discount_percent ?? 5,
        min_order_amount: p.min_order_amount ?? 1000,
        addon_perk: p.addon_perk || "Complimentary Addon Mini Cake",
        image_url: p.image_url || "",
        accentColor: p.accent_color || "#C5983A",
        bgGradient: p.bg_gradient || "linear-gradient(135deg, #FFFDF8 0%, #FAF4E8 50%, #F5ECDD 100%)",
        icon: idx % 3 === 0 ? Crown : idx % 3 === 1 ? Sparkles : Award,
      }))
    : defaultPosters;

  // Auto-cycle ONLY after client mount to prevent hydration flash
  useEffect(() => {
    if (!isMounted || posters.length <= 1) return;
    const timer = setInterval(() => {
      setActivePosterIdx((prev) => (prev + 1) % posters.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isMounted, posters.length]);

  const current = posters[activePosterIdx] || posters[0];
  const IconComponent = current.icon;
  const hasCustomPosterImage = Boolean(current.image_url);

  return (
    <>
      <div
        className="animated-poster-container"
        id="atelier-animated-poster"
        style={{
          background: current.bgGradient,
          transition: "background 0.5s ease",
          padding: "1.5rem 1.75rem",
        }}
      >
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <div className="poster-floating-tag">
                <IconComponent size={13} style={{ color: "var(--gold)" }} />
                <span>{current.badge}</span>
              </div>

              {/* Discount Tag Pill */}
              <span
                style={{
                  background: "linear-gradient(135deg, #B88E3E 0%, #8F6418 100%)",
                  color: "#FFFFFF",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  padding: "0.22rem 0.65rem",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  boxShadow: "0 2px 8px rgba(184, 142, 62, 0.25)",
                }}
              >
                <Tag size={12} />
                <span>
                  {current.discount_percent}% OFF • Code: {current.promo_code}
                </span>
              </span>
            </div>

            {/* Poster Tab Selectors */}
            {posters.length > 1 && (
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
            )}
          </div>

          {/* Poster Typography & Artwork Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: hasCustomPosterImage
                ? "repeat(auto-fit, minmax(280px, 1fr))"
                : "1fr",
              gap: "1.5rem",
              alignItems: "center",
            }}
          >
            {/* Left/Main Column: Copy & CTAs */}
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

              {current.tagline && (
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "var(--gold-dark)",
                    fontStyle: "italic",
                    fontWeight: 600,
                    marginBottom: "0.6rem",
                    lineHeight: 1.4,
                  }}
                >
                  {current.tagline}
                </p>
              )}

              {current.description && (
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.55,
                    marginBottom: "0.85rem",
                    maxWidth: "600px",
                  }}
                >
                  {current.description}
                </p>
              )}

              {/* Complimentary Addon Perk Pill */}
              {current.addon_perk && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    color: "#065F46",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    marginBottom: "1.15rem",
                  }}
                >
                  <Gift size={13} style={{ color: "#059669" }} />
                  <span>
                    Special Perk: {current.addon_perk} on orders above ₹{current.min_order_amount || 1000}!
                  </span>
                </div>
              )}

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

            {/* Right Column: Custom Poster Image (if uploaded) */}
            {hasCustomPosterImage && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "380px",
                    height: "220px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "2px solid rgba(197, 152, 58, 0.4)",
                    boxShadow: "0 10px 30px rgba(184, 142, 62, 0.15)",
                    background: "#FFFFFF",
                  }}
                >
                  <img
                    src={current.image_url}
                    alt={current.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "10px",
                      background: "rgba(0,0,0,0.72)",
                      backdropFilter: "blur(6px)",
                      color: "#F6E7B9",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      border: "1px solid rgba(246, 231, 185, 0.2)",
                    }}
                  >
                    <Sparkles size={11} />
                    <span>Lush Layers • Made With Love ❤️</span>
                  </div>
                </div>
              </div>
            )}
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
            image_url: current.image_url || "",
            available_sizes: ["0.5 kg (Small)", "1.0 kg (Medium)", "1.5 kg (Tiered)", "2.0 kg (Celebration)"],
            category_name: current.badge,
            status: "published",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialPromoCode={current.promo_code}
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
