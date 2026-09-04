import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicLayout from "../../../components/PublicLayout";
import MasonryGallery from "../../../components/MasonryGallery";
import CategoryBar from "../../../components/CategoryBar";
import { getPublishedCakes, getCategories } from "../../../lib/api";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category • LUSH LAYERS" };

  return {
    title: `${category.name} Cakes • LUSH LAYERS`,
    description: category.description || `Browse handcrafted ${category.name} confections by LUSH LAYERS.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const cakes = await getPublishedCakes({ categoryId: category.id });

  return (
    <PublicLayout>
      <div style={{ paddingTop: "1.75rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/cakes" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Categories
            </Link>
            <span>/</span>
            <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}>{category.name}</span>
          </nav>

          {/* Header - Compact */}
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 1.5rem" }}>
            <span className="cake-category-badge">Curated Collection</span>
            <h1 style={{ fontSize: "1.85rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              {category.name}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              {category.description || "Artisanal hand-sculpted bespoke confections."}
            </p>
          </div>

          {/* Category Bar Navigation */}
          <div style={{ marginBottom: "1.75rem" }}>
            <CategoryBar categories={categories} activeSlug={category.slug} />
          </div>

          {/* Responsive Cake Gallery (Desktop: 4, Tablet: 3, Mobile: STRICTLY 2) */}
          <MasonryGallery
            cakes={cakes}
            emptyMessage={`No ${category.name} cakes published yet. Check other collections or enquire on WhatsApp.`}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
