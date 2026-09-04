import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicLayout from "../../../components/PublicLayout";
import CakeDetailClient from "../../../components/CakeDetailClient";
import MasonryGallery from "../../../components/MasonryGallery";
import { getCakeBySlug, getPublishedCakes } from "../../../lib/api";

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
  const relatedCakes = allCakes.filter((c) => c.id !== cake.id).slice(0, 3);

  return (
    <PublicLayout>
      <div style={{ paddingTop: "2.5rem", paddingBottom: "6rem" }}>
        <div className="container-lux">
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "2.5rem",
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
            <span style={{ color: "var(--gold-light)" }}>{cake.name}</span>
          </nav>

          {/* Main Showcase Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* Left: Studio White Photography Frame */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                padding: "3rem 2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
                border: "1px solid var(--border-gold)",
                position: "sticky",
                top: "110px",
              }}
              id="cake-photo-container"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cake.image_url}
                alt={cake.name}
                style={{
                  width: "100%",
                  maxHeight: "560px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.15))",
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
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  lineHeight: 1.2,
                  marginBottom: "1rem",
                  color: "var(--text-primary)",
                }}
                id="cake-title-heading"
              >
                {cake.name}
              </h1>

              <div
                style={{
                  fontSize: "1.15rem",
                  color: "var(--gold-light)",
                  fontFamily: "var(--font-editorial)",
                  fontStyle: "italic",
                  marginBottom: "1.75rem",
                }}
              >
                Flavour Harmony: <strong>{cake.flavour}</strong>
              </div>

              {/* Editorial Description */}
              <div
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.8",
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                  borderLeft: "3px solid var(--gold)",
                  paddingLeft: "1.25rem",
                }}
              >
                <p>{cake.description}</p>
              </div>

              {/* Cake Highlights */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Craftsmanship
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 500, marginTop: "0.2rem" }}>
                    Bespoke Handcrafted
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Enquiries & Quotes
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "var(--gold-light)", fontWeight: 500, marginTop: "0.2rem" }}>
                    WhatsApp Discussion
                  </div>
                </div>
              </div>

              {/* Interactive Client Component for Order & WhatsApp Enquiry */}
              <CakeDetailClient cake={cake} />
            </div>
          </div>

          {/* Related Creations */}
          {relatedCakes.length > 0 && (
            <div style={{ marginTop: "7rem" }}>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <span className="cake-category-badge">Similar Inspirations</span>
                <h3 style={{ fontSize: "2rem", color: "var(--text-primary)" }}>
                  You May Also Admire
                </h3>
              </div>
              <MasonryGallery cakes={relatedCakes} />
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
