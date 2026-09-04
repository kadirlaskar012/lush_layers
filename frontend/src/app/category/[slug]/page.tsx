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
      <div style={{ paddingTop: "3.5rem", paddingBottom: "6rem" }}>
        <div className="container-lux">
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "2rem",
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
            <span style={{ color: "var(--gold-light)" }}>{category.name}</span>
          </nav>

          {/* Category Header */}
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem" }}>
            <span className="cake-category-badge">Bespoke Category</span>
            <h1 style={{ fontSize: "3rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
              {category.name}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.8" }}>
              {category.description || "Artisanal boutique creations baked to perfection."}
            </p>
          </div>

          {/* Horizontal Category Bar */}
          <div style={{ marginBottom: "3rem" }}>
            <CategoryBar categories={categories} activeSlug={category.slug} />
          </div>

          {/* Masonry Gallery of Published Cakes */}
          <MasonryGallery
            cakes={cakes}
            emptyMessage={`No ${category.name} creations currently published. Please enquire via WhatsApp for custom designs.`}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
