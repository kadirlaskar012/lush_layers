import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { getCategories, getPublishedCakes } from "../../lib/serverData";
import { getCategoryIconMeta } from "../../lib/categoryIcons";
import { getOptimizedImageUrl } from "../../lib/imageHelper";
import CategoryCakeIcon from "../../components/CategoryCakeIcon";

export const revalidate = 60;

export const metadata = {
  title: "Artisanal Cake Collections • LUSH LAYERS",
  description:
    "Explore our curated collections of bespoke celebration cakes, architectural wedding tiers, bento confections, and botanical floral gateaux in Kolkata.",
};

export default async function CategoriesPage() {
  const [categories, allCakes] = await Promise.all([
    getCategories(),
    getPublishedCakes(),
  ]);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  // Default categories fallback
  const defaultList = [
    {
      id: "c-bday",
      name: "Birthday Cakes",
      slug: "birthday-cakes",
      description: "Playful designs, comic buttercream, and milestone birthday centrepieces.",
      icon: "BirthdayCandlesCake",
      color: "#FFF5F7",
      accent: "#E11D48",
    },
    {
      id: "c-tiered",
      name: "Wedding & Tiered Cakes",
      slug: "wedding-tiered-cakes",
      description: "Grand architectural multi-tier gateaux sculpted for weddings & gala receptions.",
      icon: "TieredWeddingRoyal",
      color: "#F9F9F9",
      accent: "#C89B3C",
    },
    {
      id: "c-romance",
      name: "Anniversary & Romance",
      slug: "anniversary-cakes",
      description: "Romantic velvet textures, hand-piped rosettes, and heartfelt anniversary gateaux.",
      icon: "RedVelvetHeart",
      color: "#FFF9EE",
      accent: "#B88E3E",
    },
    {
      id: "c-bento",
      name: "Bento & Petite Cakes",
      slug: "bento-petite-cakes",
      description: "Intimate lunchbox treats, minimalist Korean lettering, and cute personal sizes.",
      icon: "BentoPetiteCake",
      color: "#F4F6F8",
      accent: "#475569",
    },
    {
      id: "c-floral",
      name: "Botanical & Floral Cakes",
      slug: "botanical-floral-cakes",
      description: "Silk meringue buttercream flowers, pressed botanicals, and delicate garden motifs.",
      icon: "BotanicalFloralCake",
      color: "#FFF0F3",
      accent: "#DB2777",
    },
    {
      id: "c-choc",
      name: "Pure Belgian Chocolate",
      slug: "belgian-chocolate-cakes",
      description: "Rich dark ganaches, couverture truffles, and intense cocoa decadence.",
      icon: "ChocolateGanacheFudge",
      color: "#F6F1EA",
      accent: "#6B4423",
    },
    {
      id: "c-custom",
      name: "Custom & Theme Cakes",
      slug: "custom-theme-cakes",
      description: "Bespoke novelty sculptures, fondant artistry, and tailor-made milestone concepts.",
      icon: "CelebrationSparklerCake",
      color: "#FDF2EC",
      accent: "#EA580C",
    },
  ];

  const displayCategories = (categories && categories.length > 0 ? categories : defaultList).filter(
    (c) => !("active" in c) || c.active !== false
  );

  return (
    <PublicLayout>
      <div style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-lux">
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}>Categories</span>
          </nav>

          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 2.5rem" }}>
            <span className="cake-category-badge">
              <Sparkles size={11} style={{ color: "var(--gold-dark)" }} />
              <span>Curated Collections</span>
            </span>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 5vw, 2.4rem)",
                color: "var(--text-primary)",
                marginTop: "0.5rem",
                marginBottom: "0.6rem",
                lineHeight: 1.15,
              }}
            >
              Artisanal Cake Collections
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.55 }}>
              From grand architectural wedding tiers to delicate botanical gateaux and intimate bento confections, explore our bespoke collections handcrafted with pure single-origin ingredients.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3.5rem",
            }}
          >
            {displayCategories.map((cat) => {
              const meta = getCategoryIconMeta(cat.icon);
              const IconComponent = meta.icon;
              const bgColor = cat.color || meta.color;
              const accentColor = cat.accent || meta.accent;

              // Filter cakes for this category
              const catCakes = allCakes.filter(
                (c) =>
                  c.category_id === cat.id ||
                  c.category_slug === cat.slug ||
                  (c.category_name && c.category_name.toLowerCase().includes(cat.name.toLowerCase()))
              );

              const leadCake = catCakes[0] || allCakes[0];
              const count = catCakes.length;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${cat.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  className="group"
                >
                  <div
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 2px 8px rgba(26, 32, 24, 0.04)",
                    }}
                    className="icon-hover-lift"
                  >
                    {/* Category Cover Image Header */}
                    <div
                      style={{
                        position: "relative",
                        height: "170px",
                        background: bgColor,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {leadCake?.image_url ? (
                        <Image
                          src={getOptimizedImageUrl(leadCake.image_url, { width: 400 })}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          style={{ objectFit: "cover", opacity: 0.92 }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.92)",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                          }}
                        >
                          <CategoryCakeIcon name={cat.icon} size={48} />
                        </div>
                      )}

                      {/* Glass Overlay with Category Icon Badge */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(26, 32, 24, 0.45) 100%)",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          background: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(8px)",
                          padding: "0.28rem 0.75rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        }}
                      >
                        <CategoryCakeIcon name={cat.icon} size={18} />
                        <span>{cat.name}</span>
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "12px",
                          background: "rgba(26, 32, 24, 0.85)",
                          color: "#FFFFFF",
                          fontSize: "0.72rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                          fontWeight: 600,
                        }}
                      >
                        {count > 0 ? `${count} ${count === 1 ? "design" : "designs"}` : "Curated designs"}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: bgColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                          }}
                        >
                          <CategoryCakeIcon name={cat.icon} size={24} />
                        </div>
                        <h2
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.25rem",
                            color: "var(--text-primary)",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {cat.name}
                        </h2>
                      </div>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.82rem",
                          lineHeight: 1.5,
                          marginBottom: "1rem",
                          flex: 1,
                        }}
                      >
                        {cat.description || "Artisanal hand-sculpted bespoke confections made fresh to order."}
                      </p>

                      {/* Explore Link CTA */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--gold-dark)",
                          marginTop: "auto",
                          paddingTop: "0.75rem",
                          borderTop: "1px solid var(--border-light)",
                        }}
                      >
                        <span>Explore Collection</span>
                        <ArrowRight size={14} className="icon-hover-slide" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bespoke Theme Request Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #FAF7F0 0%, #F1E9D7 100%)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ maxWidth: "550px" }}>
              <span className="cake-category-badge">Bespoke Confections</span>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.45rem",
                  color: "var(--text-primary)",
                  marginBottom: "0.35rem",
                }}
              >
                Looking for a Custom Motif or Unlisted Theme?
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", lineHeight: 1.5 }}>
                Chef Pâtissier Tina Baidya collaborates directly with you to craft unique sculpted tiers, character figures, and customized flavour profiles tailored to your event.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link
                href="/cakes"
                className="btn-gold"
                style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
              >
                Browse All Cakes
              </Link>
              <a
                href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20Tina%20Baidya%2C%20I%20would%20like%20to%20discuss%20a%20custom%20bespoke%20cake%20theme.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp icon-hover-lift"
                style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem", gap: "0.45rem" }}
              >
                <WhatsAppIcon size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
