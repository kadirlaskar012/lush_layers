"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./theme-preview.css";

interface ThemeConfig {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  fontHeading: string;
  fontBody: string;
  fontEditorial: string;
  colors: {
    bgMain: string;
    bgSurface: string;
    bgCard: string;
    bgAccentMuted: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primaryAccent: string;
    primaryAccentHover: string;
    secondaryAccent: string;
    goldShine: string;
    borderSubtle: string;
    borderAccent: string;
    shadowCard: string;
    shadowHover: string;
    badgeBg: string;
    badgeText: string;
    ctaGradient: string;
    ctaText: string;
  };
  cake: {
    name: string;
    flavour: string;
    desc: string;
    image: string;
    badge: string;
  };
  whyItKillsFlatness: string[];
}

const THEMES: ThemeConfig[] = [
  {
    id: "atelier-royale",
    name: "Option 1: Atelier Royale",
    tagline: "French Haute Pâtisserie • Warm Champagne & Roman Gold",
    vibe: "Ladurée Paris & Luxury Wedding Salon. Buttery warm ivory base, high-contrast espresso velvet typography, and 24K gold foil trim.",
    fontHeading: "'Playfair Display', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    fontEditorial: "'Lora', serif",
    colors: {
      bgMain: "#FAF7F2",
      bgSurface: "#FFFFFF",
      bgCard: "#FFFFFF",
      bgAccentMuted: "#F5EDE1",
      textPrimary: "#1A1513",
      textSecondary: "#4D3F38",
      textMuted: "#7D6B63",
      primaryAccent: "#C5A059",
      primaryAccentHover: "#A88338",
      secondaryAccent: "#E5B899",
      goldShine: "linear-gradient(135deg, #F0DEC5 0%, #C5A059 50%, #987532 100%)",
      borderSubtle: "rgba(197, 160, 89, 0.25)",
      borderAccent: "rgba(197, 160, 89, 0.65)",
      shadowCard: "0 10px 30px -8px rgba(138, 105, 50, 0.12), 0 2px 8px rgba(26, 21, 19, 0.04)",
      shadowHover: "0 20px 42px -10px rgba(138, 105, 50, 0.22), 0 6px 14px rgba(26, 21, 19, 0.06)",
      badgeBg: "#F7EFE4",
      badgeText: "#8C6826",
      ctaGradient: "linear-gradient(135deg, #D4AF37 0%, #B88E3E 100%)",
      ctaText: "#1A1513",
    },
    cake: {
      name: "Grand Imperial 2-Tier Celebration Gateau",
      flavour: "Vanilla Mascarpone & Lavender Orchid",
      desc: "An ethereal multi-tier vanilla celebration cake sculpted with silky cream frosting, delicate purple florals, hand-crafted butterflies, and subtle edible pearls.",
      image: "https://res.cloudinary.com/gviwlymx/image/upload/v1788964481/lush_layers/cakes/cake_55387db6.webp",
      badge: "★ Royal Signature",
    },
    whyItKillsFlatness: [
      "Warm Champagne Canvas (#FAF7F2): Fills the background with rich French warmth instead of cold washed-out grey.",
      "Espresso Velvet Typography (#1A1513): Gives razor-sharp readability and high contrast on all devices.",
      "Luminous Roman Gold Foil (#C5A059): Reflects light on badges, rings, and CTAs, adding luxurious depth.",
      "Soft Bake Ambient Shadows: Tinted with warm brown-gold rather than generic grey, lifting cards 3-dimensionally.",
    ],
  },
  {
    id: "velvet-caramel",
    name: "Option 2: Velvet Noir & Caramel",
    tagline: "Boutique Chocolaterie • Belgian Truffle & Molten Gold",
    vibe: "Decadent, dramatic, and high-fashion. Deep chocolate headers, warm almond buttercream surfaces, and molten caramel accents.",
    fontHeading: "'Cormorant Garamond', serif",
    fontBody: "'Outfit', sans-serif",
    fontEditorial: "'Fraunces', serif",
    colors: {
      bgMain: "#FDFBF7",
      bgSurface: "#FFFFFF",
      bgCard: "#FFFFFF",
      bgAccentMuted: "#F5ECE1",
      textPrimary: "#16110F",
      textSecondary: "#483730",
      textMuted: "#7E6A61",
      primaryAccent: "#D9822B",
      primaryAccentHover: "#B86618",
      secondaryAccent: "#7E2A3A",
      goldShine: "linear-gradient(135deg, #F9D68A 0%, #D9822B 50%, #944D0C 100%)",
      borderSubtle: "rgba(217, 130, 43, 0.22)",
      borderAccent: "rgba(217, 130, 43, 0.65)",
      shadowCard: "0 12px 32px -6px rgba(22, 17, 15, 0.10), 0 3px 10px rgba(217, 130, 43, 0.08)",
      shadowHover: "0 22px 46px -10px rgba(22, 17, 15, 0.22), 0 8px 18px rgba(217, 130, 43, 0.15)",
      badgeBg: "#FDF2E4",
      badgeText: "#A0550B",
      ctaGradient: "linear-gradient(135deg, #E89538 0%, #BD6C1A 100%)",
      ctaText: "#FFFFFF",
    },
    cake: {
      name: "Belgian Truffle & Choco Chip Dessert Tub",
      flavour: "54% Callebaut Ganache & Crisp Sprinkles",
      desc: "Decadent layered dark chocolate sponge bathed in molten fudge ganache, sprinkled with artisanal chocolate curls and roasted cocoa crisps.",
      image: "https://res.cloudinary.com/gviwlymx/image/upload/v1788960171/lush_layers/cakes/cake_5ca598b2.webp",
      badge: "★ Decadent Luxe",
    },
    whyItKillsFlatness: [
      "Dynamic Deep Truffle Anchors (#16110F): Creates stunning drama and high-fashion luxury contrast.",
      "Molten Caramel Buttons (#D9822B): Irresistible confectionery call-to-actions that pop off the page.",
      "Editorial High-Fashion Typography: Cormorant Garamond gives high-end Vogue pastry editorial elegance.",
      "Dual Layer Drop Shadows: Chocolate-ambient shadow underneath cards that makes them float with dimension.",
    ],
  },
  {
    id: "jardin-botanique",
    name: "Option 3: Jardin Botanique & Rose",
    tagline: "Organic Haute Atelier • Deep Pine & Rose Blossom Glaze",
    vibe: "Fresh botanical confections, pistachio-glazed tiers, wild organic berries, and crisp morning garden elegance.",
    fontHeading: "'Fraunces', serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    fontEditorial: "'Lora', serif",
    colors: {
      bgMain: "#F6F9F5",
      bgSurface: "#FFFFFF",
      bgCard: "#FFFFFF",
      bgAccentMuted: "#EBF3EA",
      textPrimary: "#112017",
      textSecondary: "#304437",
      textMuted: "#607467",
      primaryAccent: "#246E4A",
      primaryAccentHover: "#175034",
      secondaryAccent: "#CE6577",
      goldShine: "linear-gradient(135deg, #F1E5C8 0%, #C4A258 50%, #8C6D28 100%)",
      borderSubtle: "rgba(36, 110, 74, 0.20)",
      borderAccent: "rgba(36, 110, 74, 0.60)",
      shadowCard: "0 10px 30px -8px rgba(17, 32, 23, 0.10), 0 2px 8px rgba(36, 110, 74, 0.06)",
      shadowHover: "0 22px 46px -10px rgba(17, 32, 23, 0.20), 0 6px 16px rgba(36, 110, 74, 0.14)",
      badgeBg: "#E4EFE7",
      badgeText: "#185839",
      ctaGradient: "linear-gradient(135deg, #246E4A 0%, #154D32 100%)",
      ctaText: "#FFFFFF",
    },
    cake: {
      name: "Wild Rose & Red Velvet Heart Gateau",
      flavour: "Ruby Cocoa & Organic Rose Glaze",
      desc: "Sculpted velvet heart sponge infused with Madagascar vanilla, filled with cream cheese mousse and glazed in brilliant wild berry ruby red.",
      image: "https://res.cloudinary.com/gviwlymx/image/upload/v1788689286/lush_layers/cakes/cake_5be823c9.webp",
      badge: "★ Botanical Bloom",
    },
    whyItKillsFlatness: [
      "Deep Obsidian Pine (#112017): Replaces washed out grey-sage with crisp, punchy botanical depth.",
      "Raspberry Rose Accents (#CE6577): Adds vibrant confectionery color pops for tags, hearts, and highlights.",
      "Sculpted Organic Typography: Fraunces brings pillowy, handcrafted warmth like freshly whipped buttercream.",
      "Crisp Silk Dew Backdrop (#F6F9F5): Cards feel luminous and fresh against a subtle morning-light canvas.",
    ],
  },
];

export default function ThemePreviewPage() {
  const [activeThemeId, setActiveThemeId] = useState<string>("atelier-royale");
  const [viewMode, setViewMode] = useState<"single" | "compare">("single");

  const currentTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  return (
    <div className="tp-wrapper">
      {/* External Google Fonts Link */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Lora:ital,wght@1,500;1,600&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      />

      <div className="tp-container">
        {/* Header Bar */}
        <header className="tp-header">
          <div>
            <div className="tp-badge-pill">
              <span>✨</span> Lush Layers Visual Identity Laboratory
            </div>
            <h1 className="tp-title">3 Professional Color & Typography Themes</h1>
            <p className="tp-desc">
              Website-er flat bhab dur korte ebong brand-ke ultra-luxury, high-contrast, tactile o appetizing look dite 3-ti unique theme toiri kora hoyeche. Niche live preview dekhe apnar pochondo moto choose korun.
            </p>
          </div>

          <div className="tp-header-actions">
            <button
              onClick={() => setViewMode("single")}
              className={`tp-btn ${viewMode === "single" ? "tp-btn-primary" : "tp-btn-ghost"}`}
            >
              🔍 Interactive Showcase
            </button>
            <button
              onClick={() => setViewMode("compare")}
              className={`tp-btn ${viewMode === "compare" ? "tp-btn-primary" : "tp-btn-ghost"}`}
            >
              ⚖️ 3-Way Side-by-Side
            </button>
            <Link href="/" className="tp-btn tp-btn-ghost">
              ← Back to Store
            </Link>
          </div>
        </header>

        {/* Theme Selector Tabs (Single View) */}
        {viewMode === "single" && (
          <div className="tp-tabs-grid">
            {THEMES.map((theme, index) => {
              const isActive = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => setActiveThemeId(theme.id)}
                  className={`tp-tab-btn ${isActive ? "active" : ""}`}
                >
                  <div className="tp-tab-header">
                    <span className="tp-tab-tag">Option 0{index + 1}</span>
                    {isActive && <span className="tp-tab-indicator" />}
                  </div>
                  <h3 className="tp-tab-name">{theme.name}</h3>
                  <p className="tp-tab-sub">{theme.tagline}</p>
                  <div className="tp-dots-bar">
                    <span className="tp-dot" style={{ backgroundColor: theme.colors.bgMain }} title="Canvas" />
                    <span className="tp-dot" style={{ backgroundColor: theme.colors.textPrimary }} title="Ink" />
                    <span className="tp-dot" style={{ backgroundColor: theme.colors.primaryAccent }} title="Accent" />
                    <span className="tp-dot" style={{ backgroundColor: theme.colors.secondaryAccent }} title="Secondary" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            SINGLE THEME DETAILED SHOWCASE
           ========================================================================= */}
        {viewMode === "single" && (
          <main
            className="tp-canvas-frame"
            style={{
              backgroundColor: currentTheme.colors.bgMain,
              borderColor: currentTheme.colors.borderSubtle,
              color: currentTheme.colors.textPrimary,
              fontFamily: currentTheme.fontBody,
            }}
          >
            {/* Canvas Header */}
            <div className="tp-canvas-header" style={{ borderColor: currentTheme.colors.borderSubtle }}>
              <div className="tp-canvas-title-group">
                <span
                  className="tp-badge-pill"
                  style={{
                    backgroundColor: currentTheme.colors.badgeBg,
                    color: currentTheme.colors.badgeText,
                    borderColor: currentTheme.colors.borderSubtle,
                  }}
                >
                  👑 Active Theme Demo
                </span>
                <h2 style={{ fontFamily: currentTheme.fontHeading, color: currentTheme.colors.textPrimary }}>
                  {currentTheme.name}
                </h2>
                <p style={{ color: currentTheme.colors.textSecondary }}>{currentTheme.tagline}</p>
              </div>

              <div className="tp-font-tags">
                <div
                  className="tp-font-tag"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.borderSubtle,
                    color: currentTheme.colors.textPrimary,
                  }}
                >
                  <span>Aa</span>
                  <span>
                    Heading: <strong>{currentTheme.fontHeading.split(",")[0].replace(/'/g, "")}</strong>
                  </span>
                </div>
                <div
                  className="tp-font-tag"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.borderSubtle,
                    color: currentTheme.colors.textPrimary,
                  }}
                >
                  <span>Tt</span>
                  <span>
                    Body: <strong>{currentTheme.fontBody.split(",")[0].replace(/'/g, "")}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas Body: Left Hero + Right Product Card */}
            <div className="tp-canvas-body">
              {/* Left Column */}
              <div className="tp-left-col">
                {/* Hero Showcase Card */}
                <div
                  className="tp-hero-card"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.borderSubtle,
                    boxShadow: currentTheme.colors.shadowCard,
                  }}
                >
                  <span className="tp-hero-eyebrow" style={{ color: currentTheme.colors.primaryAccent }}>
                    Bespoke Pâtisserie • Kolkata & Beyond
                  </span>
                  <h3
                    className="tp-hero-heading"
                    style={{ fontFamily: currentTheme.fontHeading, color: currentTheme.colors.textPrimary }}
                  >
                    Handcrafted Confections for Life’s Most Luminous Moments.
                  </h3>
                  <p className="tp-hero-para" style={{ color: currentTheme.colors.textSecondary }}>
                    Every layer is an architectural masterpiece, whipped with single-origin cocoa, velvety cream, and delicate botanical petals. Custom sculpted to perfection by Chef Tina Baidya.
                  </p>
                  <div className="tp-hero-actions">
                    <button
                      className="tp-hero-btn-primary"
                      style={{
                        background: currentTheme.colors.ctaGradient,
                        color: currentTheme.colors.ctaText,
                        boxShadow: `0 8px 20px -4px ${currentTheme.colors.primaryAccent}66`,
                      }}
                    >
                      Explore Signature Cakes
                    </button>
                    <button
                      className="tp-hero-btn-secondary"
                      style={{
                        backgroundColor: currentTheme.colors.bgSurface,
                        borderColor: currentTheme.colors.borderAccent,
                        color: currentTheme.colors.textPrimary,
                      }}
                    >
                      Order via WhatsApp
                    </button>
                  </div>
                </div>

                {/* Typography Specimen */}
                <div
                  className="tp-type-specimen"
                  style={{
                    backgroundColor: currentTheme.colors.bgAccentMuted,
                    borderColor: currentTheme.colors.borderSubtle,
                  }}
                >
                  <div className="tp-type-row">
                    <span className="tp-type-label">Display Heading 1</span>
                    <span className="tp-type-h1" style={{ fontFamily: currentTheme.fontHeading }}>
                      Belgian Chocolate Truffle Éclair
                    </span>
                  </div>
                  <div className="tp-type-row">
                    <span className="tp-type-label">Editorial Subtitle (Italic)</span>
                    <span
                      className="tp-type-italic"
                      style={{ fontFamily: currentTheme.fontEditorial, color: currentTheme.colors.textSecondary }}
                    >
                      “Baking is love made edible — sculpted with warmth, texture, and care.”
                    </span>
                  </div>
                  <div className="tp-type-row">
                    <span className="tp-type-label">UI Body & Micro-copy</span>
                    <span className="tp-type-body" style={{ color: currentTheme.colors.textSecondary }}>
                      100% Eggless Options Available • Pure Dairy Butter • Callebaut Couverture Chocolate • Free Kolkata Delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Cake Card */}
              <div>
                <div
                  className="tp-cake-card"
                  style={{
                    backgroundColor: currentTheme.colors.bgCard,
                    borderColor: currentTheme.colors.borderSubtle,
                    boxShadow: currentTheme.colors.shadowHover,
                  }}
                >
                  <div className="tp-cake-img-wrap">
                    <Image
                      src={currentTheme.cake.image}
                      alt={currentTheme.cake.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="tp-cake-img"
                    />

                    <div className="tp-card-badge-top">
                      <span
                        className="tp-card-badge"
                        style={{
                          backgroundColor: currentTheme.colors.badgeBg,
                          color: currentTheme.colors.badgeText,
                          borderColor: currentTheme.colors.borderSubtle,
                        }}
                      >
                        {currentTheme.cake.badge}
                      </span>
                      <span className="tp-card-badge tp-eggless-badge">🌱 Eggless</span>
                    </div>

                    <button aria-label="Favorite" className="tp-card-fav-btn">
                      ♥
                    </button>

                    <div className="tp-card-img-footer">
                      <span>{currentTheme.cake.flavour}</span>
                      <span style={{ color: "#ffd54f", fontWeight: 700 }}>5.0 ★★★★★</span>
                    </div>
                  </div>

                  <div className="tp-cake-info">
                    <div>
                      <h4
                        className="tp-cake-title"
                        style={{ fontFamily: currentTheme.fontHeading, color: currentTheme.colors.textPrimary }}
                      >
                        {currentTheme.cake.name}
                      </h4>
                      <p className="tp-cake-desc" style={{ color: currentTheme.colors.textSecondary }}>
                        {currentTheme.cake.desc}
                      </p>
                    </div>

                    <div className="tp-size-row" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                      <div className="tp-size-chips">
                        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>SIZE:</span>
                        <span
                          className="tp-size-chip"
                          style={{
                            backgroundColor: currentTheme.colors.bgAccentMuted,
                            borderColor: currentTheme.colors.borderSubtle,
                            color: currentTheme.colors.textPrimary,
                          }}
                        >
                          0.5 kg
                        </span>
                        <span
                          className="tp-size-chip"
                          style={{
                            backgroundColor: currentTheme.colors.primaryAccent,
                            color: currentTheme.colors.ctaText,
                            borderColor: currentTheme.colors.primaryAccent,
                          }}
                        >
                          1 kg
                        </span>
                        <span
                          className="tp-size-chip"
                          style={{
                            backgroundColor: currentTheme.colors.bgAccentMuted,
                            borderColor: currentTheme.colors.borderSubtle,
                            color: currentTheme.colors.textPrimary,
                          }}
                        >
                          2 kg
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: currentTheme.colors.primaryAccent }}>
                        Custom Tier
                      </span>
                    </div>

                    <button className="tp-whatsapp-btn">
                      <span>💬</span>
                      <span>Order via WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Swatches Grid */}
            <div className="tp-swatches-section" style={{ borderColor: currentTheme.colors.borderSubtle }}>
              <div className="tp-section-heading" style={{ color: currentTheme.colors.textMuted }}>
                Engineered Color Palette & Token Roles
              </div>
              <div className="tp-swatches-grid">
                <div className="tp-swatch-card" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                  <div className="tp-swatch-color" style={{ backgroundColor: currentTheme.colors.bgMain }} />
                  <div className="tp-swatch-name">Canvas Base</div>
                  <div className="tp-swatch-hex">{currentTheme.colors.bgMain}</div>
                </div>

                <div className="tp-swatch-card" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                  <div className="tp-swatch-color" style={{ backgroundColor: currentTheme.colors.textPrimary }} />
                  <div className="tp-swatch-name">Primary Ink</div>
                  <div className="tp-swatch-hex">{currentTheme.colors.textPrimary}</div>
                </div>

                <div className="tp-swatch-card" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                  <div className="tp-swatch-color" style={{ backgroundColor: currentTheme.colors.primaryAccent }} />
                  <div className="tp-swatch-name">Primary Accent</div>
                  <div className="tp-swatch-hex">{currentTheme.colors.primaryAccent}</div>
                </div>

                <div className="tp-swatch-card" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                  <div className="tp-swatch-color" style={{ backgroundColor: currentTheme.colors.secondaryAccent }} />
                  <div className="tp-swatch-name">Secondary Accent</div>
                  <div className="tp-swatch-hex">{currentTheme.colors.secondaryAccent}</div>
                </div>

                <div className="tp-swatch-card" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                  <div className="tp-swatch-color" style={{ backgroundColor: currentTheme.colors.badgeBg }} />
                  <div className="tp-swatch-name">Badge Surface</div>
                  <div className="tp-swatch-hex">{currentTheme.colors.badgeBg}</div>
                </div>

                <div className="tp-swatch-card" style={{ borderColor: currentTheme.colors.borderSubtle }}>
                  <div className="tp-swatch-color" style={{ background: currentTheme.colors.goldShine }} />
                  <div className="tp-swatch-name">Gilded Foil</div>
                  <div className="tp-swatch-hex">Linear Lux</div>
                </div>
              </div>
            </div>

            {/* Why this theme kills flatness */}
            <div
              className="tp-why-box"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.borderSubtle,
              }}
            >
              <div className="tp-why-title" style={{ color: currentTheme.colors.primaryAccent }}>
                <span>💡</span> Ken ei theme website-er flat bhab ke sompurno dur kore?
              </div>
              <ul className="tp-why-grid">
                {currentTheme.whyItKillsFlatness.map((point, idx) => (
                  <li key={idx} className="tp-why-item" style={{ color: currentTheme.colors.textSecondary }}>
                    <span className="tp-check-icon">✔</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        )}

        {/* =========================================================================
            3-WAY SIDE-BY-SIDE COMPARISON VIEW
           ========================================================================= */}
        {viewMode === "compare" && (
          <div className="tp-compare-grid">
            {THEMES.map((theme, index) => (
              <div
                key={theme.id}
                className="tp-compare-card"
                style={{
                  backgroundColor: theme.colors.bgMain,
                  borderColor: theme.colors.borderAccent,
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fontBody,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Option Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      className="tp-badge-pill"
                      style={{
                        backgroundColor: theme.colors.badgeBg,
                        color: theme.colors.badgeText,
                        borderColor: theme.colors.borderSubtle,
                        margin: 0,
                      }}
                    >
                      Option 0{index + 1}
                    </span>
                    <button
                      onClick={() => {
                        setActiveThemeId(theme.id);
                        setViewMode("single");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        color: theme.colors.primaryAccent,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Full Details →
                    </button>
                  </div>

                  <div>
                    <h3 style={{ fontFamily: theme.fontHeading, color: theme.colors.textPrimary, margin: "0 0 4px 0", fontSize: 22 }}>
                      {theme.name}
                    </h3>
                    <p style={{ color: theme.colors.textSecondary, fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                      {theme.tagline}
                    </p>
                  </div>

                  {/* Mini Product Card */}
                  <div
                    className="tp-compare-mini-card"
                    style={{
                      backgroundColor: theme.colors.bgCard,
                      borderColor: theme.colors.borderSubtle,
                      boxShadow: theme.colors.shadowCard,
                    }}
                  >
                    <div className="tp-compare-mini-img-wrap">
                      <Image
                        src={theme.cake.image}
                        alt={theme.cake.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        style={{ objectFit: "cover" }}
                      />
                      <span
                        className="tp-card-badge"
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          fontSize: 10,
                          backgroundColor: theme.colors.badgeBg,
                          color: theme.colors.badgeText,
                          borderColor: theme.colors.borderSubtle,
                        }}
                      >
                        {theme.cake.badge}
                      </span>
                    </div>

                    <div className="tp-compare-mini-content">
                      <div>
                        <div style={{ fontFamily: theme.fontHeading, fontSize: 15, fontWeight: 700, color: theme.colors.textPrimary }}>
                          {theme.cake.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: theme.colors.textSecondary }}>{theme.cake.flavour}</div>
                      </div>

                      <button
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 10,
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: theme.colors.ctaGradient,
                          color: theme.colors.ctaText,
                          boxShadow: `0 4px 12px ${theme.colors.primaryAccent}40`,
                        }}
                      >
                        Order via WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Typography Pairing */}
                  <div
                    className="tp-compare-fonts-box"
                    style={{
                      backgroundColor: theme.colors.bgAccentMuted,
                      borderColor: theme.colors.borderSubtle,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ opacity: 0.6, fontSize: 10, fontFamily: "monospace" }}>HEADLINE:</span>
                      <strong>{theme.fontHeading.split(",")[0].replace(/'/g, "")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ opacity: 0.6, fontSize: 10, fontFamily: "monospace" }}>BODY/UI:</span>
                      <strong>{theme.fontBody.split(",")[0].replace(/'/g, "")}</strong>
                    </div>
                  </div>

                  {/* Palette Dots */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>Palette:</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span className="tp-dot" style={{ backgroundColor: theme.colors.bgMain }} title="Canvas" />
                      <span className="tp-dot" style={{ backgroundColor: theme.colors.textPrimary }} title="Ink" />
                      <span className="tp-dot" style={{ backgroundColor: theme.colors.primaryAccent }} title="Accent" />
                      <span className="tp-dot" style={{ backgroundColor: theme.colors.secondaryAccent }} title="Secondary" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveThemeId(theme.id);
                    setViewMode("single");
                  }}
                  className="tp-compare-select-btn"
                  style={{
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: theme.colors.borderAccent,
                    color: theme.colors.textPrimary,
                  }}
                >
                  Select & Preview Full Demo
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <footer style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "12px" }}>
          💡 <strong>Kibhabe choose korben?</strong> Apni <strong>Option 1, 2, ba 3</strong> er moddhe theke jeta pochondo hoy bollei ami apnar store-e ta apply kore debo!
        </footer>
      </div>
    </div>
  );
}
