import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicLayout from "../../../components/PublicLayout";
import CakeDetailClient from "../../../components/CakeDetailClient";
import CakeCard from "../../../components/CakeCard";
import { getCakeBySlug, getPublishedCakes } from "../../../lib/api";
import { getOptimizedImageUrl } from "../../../lib/imageHelper";
import { Sparkles } from "lucide-react";

export const revalidate = 60;

interface CakeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CakeDetailPageProps) {
  const { slug } = await params;
  const cake = await getCakeBySlug(slug);
  if (!cake) return { title: "Cake Not Found • LUSH LAYERS" };

  return {
    title: `${cake.name} • LUSH LAYERS`,
    description: cake.description || `Handcrafted ${cake.flavour} luxury cake by LUSH LAYERS. Order via WhatsApp.`,
    openGraph: {
      title: `${cake.name} • LUSH LAYERS`,
      description: cake.description,
      images: [{ url: cake.image_url }],
    },
  };
}

export default async function CakeDetailPage({ params }: CakeDetailPageProps) {
  const { slug } = await params;
  const cake = await getCakeBySlug(slug);

  if (!cake) {
    notFound();
  }

  // Related cakes in same category
  const allCakes = await getPublishedCakes({ categoryId: cake.category_id });
  const relatedCakes = allCakes.filter((c) => c.id !== cake.id).slice(0, 4);

  return (
    <PublicLayout>
      <div style={{ paddingTop: "1.5rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Compact Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/cakes" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Cakes
            </Link>
            <span>/</span>
            {cake.category_slug && (
              <>
                <Link
                  href={`/category/${cake.category_slug}`}
                  style={{ color: "var(--text-muted)", textDecoration: "none" }}
                >
                  {cake.category_name || "Category"}
                </Link>
                <span>/</span>
              </>
            )}
            <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}>{cake.name}</span>
          </nav>

          {/* Main 2-Column Showcase Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* Left: Studio White Photography Frame */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--border-subtle)",
              }}
              id="cake-photo-container"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getOptimizedImageUrl(cake.image_url, { width: 800 })}
                alt={cake.name}
                width={500}
                height={380}
                loading="eager"
                decoding="async"
                style={{
                  width: "100%",
                  maxHeight: "380px",
                  objectFit: "contain",
                }}
                id="cake-detail-image"
              />
            </div>

            {/* Right: Cake Description & Order Form (STRICTLY ZERO PRICE) */}
            <div>
              {cake.category_name && (
                <span className="cake-category-badge">{cake.category_name}</span>
              )}

              <h1
                style={{
                  fontSize: "clamp(1.5rem, 3.2vw, 2.1rem)",
                  lineHeight: 1.2,
                  marginBottom: "0.4rem",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                }}
                id="cake-title-heading"
              >
                {cake.name}
              </h1>

              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--gold-dark)",
                  fontStyle: "italic",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Sparkles size={15} color="var(--gold)" />
                <span>{cake.flavour}</span>
              </div>

              {/* Editorial Description */}
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  marginBottom: "1.25rem",
                  background: "var(--bg-surface)",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                }}
              >
                {cake.description || "An opulent bespoke centerpiece hand-sculpted for sovereign celebrations."}
              </div>

              {/* Craftsmanship Features Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.6rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    background: "var(--bg-cream)",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    Craftsmanship
                  </span>
                  <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>Bespoke Handcrafted</strong>
                </div>

                <div
                  style={{
                    background: "var(--bg-cream)",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", display: "block", fontWeight: 600 }}>
                    Enquiries & Quotes
                  </span>
                  <strong style={{ fontSize: "0.82rem", color: "var(--whatsapp)" }}>WhatsApp Discussion</strong>
                </div>
              </div>

              {/* Interactive WhatsApp Order Form (NO PRICE) */}
              <CakeDetailClient cake={cake} />
            </div>
          </div>

          {/* Related Creations */}
          {relatedCakes.length > 0 && (
            <div style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <span className="cake-category-badge">Similar Inspirations</span>
                  <h2 style={{ fontSize: "1.35rem", color: "var(--text-primary)" }}>
                    More in {cake.category_name || "This Collection"}
                  </h2>
                </div>
                <Link href="/cakes" style={{ color: "var(--gold-dark)", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
                  View All →
                </Link>
              </div>

              <div className="cake-grid-responsive">
                {relatedCakes.map((relCake) => (
                  <CakeCard key={relCake.id} cake={relCake} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
