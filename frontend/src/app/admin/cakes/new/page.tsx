"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCategories, createCake } from "@/lib/api";
import { Category, Cake } from "@/lib/types";
import {
  ArrowLeft,
  UploadCloud,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Wand2,
  Layers,
  Tag,
  Eye,
  RefreshCw,
} from "lucide-react";

const POPULAR_FLAVOURS = [
  "Vanilla Bean Mascarpone",
  "Belgian Dark Chocolate Ganache",
  "Red Velvet Cream Cheese",
  "Butterscotch Crunch",
  "Black Forest Gateau",
  "Fresh Strawberry & Cream",
  "Lotus Biscoff Caramel",
  "Royal Rasmalai Fusion",
  "Espresso Tiramisu",
  "Pistachio Rose Glaze",
];

const DEFAULT_SIZES = ["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"];

export default function NewCakePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [flavour, setFlavour] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [availableSizes, setAvailableSizes] = useState<string[]>(DEFAULT_SIZES);
  const [customSizeInput, setCustomSizeInput] = useState("");

  // Media
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [whiteBackground, setWhiteBackground] = useState(true);

  // Publishing & Curation
  const [status, setStatus] = useState<"approved" | "published" | "pending">("approved");
  const [isHero, setIsHero] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isInspiration, setIsInspiration] = useState(false);
  const [isSeasonal, setIsSeasonal] = useState(false);

  // Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCake, setSuccessCake] = useState<Cake | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories(true);
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadData();
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!/\.(jpg|jpeg|png|webp|avif|heic)$/i.test(file.name)) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WEBP, HEIC)");
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    setImagePreviewUrl(blobUrl);

    // Auto-suggest name if empty
    if (!name) {
      const clean = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (!clean.toLowerCase().startsWith("img") && !clean.toLowerCase().startsWith("chatgpt")) {
        setName(clean);
      }
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl("");
    setManualImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!availableSizes.includes(trimmed)) {
      setAvailableSizes([...availableSizes, trimmed]);
    }
    setCustomSizeInput("");
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setAvailableSizes(availableSizes.filter((s) => s !== sizeToRemove));
  };

  const handleAutoDescription = () => {
    const flavText = flavour.trim() || "single-origin cocoa and Madagascar vanilla";
    const nameText = name.trim() || "Artisanal Gateau";
    const selectedCat = categories.find((c) => c.id === categoryId)?.name || "Handcrafted Cake";
    const generated = `An exquisite ${selectedCat.toLowerCase()} layered with velvety ${flavText}, sculpted with silky whipped buttercream and gilded with delicate edible accents. Freshly handcrafted by Chef Tina Baidya with pure dairy butter and 100% eggless options.`;
    setDescription(generated);
  };

  const resetForm = () => {
    setName("");
    setFlavour("");
    setDescription("");
    handleRemoveImage();
    setAvailableSizes(DEFAULT_SIZES);
    setStatus("approved");
    setIsHero(false);
    setIsTrending(false);
    setIsInspiration(false);
    setIsSeasonal(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (andAddAnother: boolean = false) => {
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter a cake title/name.");
      return;
    }

    if (!selectedFile && !manualImageUrl.trim()) {
      setErrorMessage("Please upload a cake photo or enter an image URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      let created: Cake;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("name", trimmedName);
        formData.append("flavour", flavour.trim() || "Vanilla Bean");
        if (categoryId) formData.append("category_id", categoryId);
        formData.append("description", description.trim());
        formData.append("available_sizes", JSON.stringify(availableSizes));
        formData.append("status", status);
        formData.append("is_hero", String(isHero));
        formData.append("is_trending", String(isTrending));
        formData.append("is_inspiration", String(isInspiration));
        formData.append("is_seasonal", String(isSeasonal));
        formData.append("white_background", String(whiteBackground));

        created = await createCake(formData);
      } else {
        const payload = {
          name: trimmedName,
          flavour: flavour.trim() || "Vanilla Bean",
          category_id: categoryId || undefined,
          description: description.trim(),
          image_url: manualImageUrl.trim(),
          available_sizes: availableSizes,
          status,
          is_hero: isHero,
          is_trending: isTrending,
          is_inspiration: isInspiration,
          is_seasonal: isSeasonal,
          white_background: whiteBackground,
        };

        created = await createCake(payload);
      }

      setSuccessCake(created);

      if (andAddAnother) {
        resetForm();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Redirect after brief feedback
        setTimeout(() => {
          router.push(`/admin/cakes`);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to create cake. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const activeDisplayImage = imagePreviewUrl || manualImageUrl.trim() || "/images/placeholder-cake.webp";

  return (
    <div id="admin-new-cake-view" style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
            <Link
              href="/admin/cakes"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to Catalog</span>
            </Link>
            <span style={{ fontSize: "0.75rem", color: "var(--border-subtle)" }}>/</span>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--gold-dark)",
                background: "var(--bg-cream)",
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Fast Creation
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.45rem",
              color: "var(--text-primary)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Add New Confection
          </h1>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Fill the details below to stage or publish a handcrafted cake directly to the catalog.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            href="/admin/cakes"
            className="btn-outline-gold"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="btn-gold"
            style={{
              padding: "0.45rem 1.15rem",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="spin-slow" />
                <span>Saving Confection...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Save & Finish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successCake && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.84rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Successfully created!</strong> &ldquo;{successCake.name}&rdquo; (#{successCake.display_id || successCake.id.slice(0, 6)}) has been added.
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href={`/cakes/${successCake.slug}`}
              target="_blank"
              style={{
                fontSize: "0.78rem",
                color: "#065F46",
                textDecoration: "underline",
                fontWeight: 600,
              }}
            >
              View on Website ↗
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Preview Right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Input Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Card 1: Essential Cake Details */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Layers size={17} style={{ color: "var(--gold-primary)" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Confection Profile
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {/* Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cake Title / Name <span style={{ color: "#E11D48" }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Belgian Dark Chocolate Ganache Gateau"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    fontSize: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Category <span style={{ color: "#E11D48" }}>*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isLoadingCategories}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    fontSize: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Flavour */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Flavour Notes <span style={{ color: "#E11D48" }}>*</span>
                </label>
                <input
                  type="text"
                  value={flavour}
                  onChange={(e) => setFlavour(e.target.value)}
                  placeholder="e.g. Belgian Chocolate, Fresh Strawberry, Madagascar Vanilla"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    fontSize: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                {/* Flavour Quick Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.45rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", alignSelf: "center" }}>
                    Quick pick:
                  </span>
                  {POPULAR_FLAVOURS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFlavour(f)}
                      style={{
                        background: flavour === f ? "var(--gold-light)" : "var(--bg-cream)",
                        border: `1px solid ${flavour === f ? "var(--gold-primary)" : "var(--border-subtle)"}`,
                        borderRadius: "var(--radius-full)",
                        padding: "0.15rem 0.5rem",
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Artisanal Description & Notes
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDescription}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--gold-dark)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <Wand2 size={12} />
                    <span>Auto-Compose Description</span>
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the layers, cream, textures, and occasion suitability..."
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    fontSize: "0.85rem",
                    lineHeight: "1.45",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Portions & Sizes */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
              <Tag size={17} style={{ color: "var(--gold-primary)" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Available Weight & Portions
              </h2>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.75rem" }}>
              {availableSizes.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "var(--bg-cream)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(s)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Remove size"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Size */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSize();
                  }
                }}
                placeholder="Add custom size (e.g. 1.5 kg, 2-Tier)..."
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.8rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleAddSize}
                style={{
                  background: "var(--bg-cream)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Card 3: Status & Curation Placements */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
              <Sparkles size={17} style={{ color: "var(--gold-primary)" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Publishing & Storefront Placements
              </h2>
            </div>

            {/* Status Segmented Control */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "0.45rem",
                  color: "var(--text-secondary)",
                }}
              >
                Initial Catalog Status
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.45rem",
                }}
              >
                {[
                  { id: "published", label: "🚀 Live on Store", desc: "Instant storefront publish" },
                  { id: "approved", label: "✨ Staged (Approved)", desc: "Ready in master catalog" },
                  { id: "pending", label: "⏳ Pending Review", desc: "Quality inspection queue" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id as any)}
                    style={{
                      background: status === s.id ? "var(--bg-card)" : "var(--bg-cream)",
                      border: `1.5px solid ${status === s.id ? "var(--gold-primary)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "0.55rem 0.4rem",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                      boxShadow: status === s.id ? "var(--shadow-xs)" : "none",
                    }}
                  >
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {s.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Curation Badges Checkboxes */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "0.45rem",
                  color: "var(--text-secondary)",
                }}
              >
                Special Spotlight Features (Optional)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {[
                  { label: "🌟 Hero Carousel", checked: isHero, setChecked: setIsHero },
                  { label: "🔥 Trending Spotlight", checked: isTrending, setChecked: setIsTrending },
                  { label: "🎨 Inspiration Wall", checked: isInspiration, setChecked: setIsInspiration },
                  { label: "❄️ Seasonal Feature", checked: isSeasonal, setChecked: setIsSeasonal },
                ].map((item) => (
                  <label
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      background: item.checked ? "var(--gold-light)" : "transparent",
                      padding: "0.4rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${item.checked ? "var(--gold-primary)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.setChecked(e.target.checked)}
                      style={{ cursor: "pointer", accentColor: "var(--gold-primary)" }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Photo Upload & Live Store Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Photo Upload Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ImageIcon size={17} style={{ color: "var(--gold-primary)" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Cake Imagery <span style={{ color: "#E11D48" }}>*</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setUseUrlMode(!useUrlMode)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--gold-dark)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {useUrlMode ? "Switch to File Upload" : "Paste URL instead"}
              </button>
            </div>

            {useUrlMode ? (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    marginBottom: "0.35rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Hosted Image URL (Cloudinary / CDN / Web)
                </label>
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/.../cake.webp"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    fontSize: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <div>
                {/* Drag and drop upload zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragOver ? "var(--gold-primary)" : "var(--border-subtle)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "1.75rem 1rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragOver ? "var(--gold-light)" : "var(--bg-card)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "var(--bg-cream)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.75rem",
                      color: "var(--gold-primary)",
                    }}
                  >
                    <UploadCloud size={22} />
                  </div>

                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {selectedFile ? selectedFile.name : "Click to select or drag photo here"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Supports JPG, PNG, WEBP, HEIC • Auto-compressed to high-res WebP
                  </div>
                </div>

                {/* Studio background toggle */}
                <div style={{ marginTop: "0.75rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={whiteBackground}
                      onChange={(e) => setWhiteBackground(e.target.checked)}
                      style={{ cursor: "pointer", accentColor: "var(--gold-primary)" }}
                    />
                    <span>
                      Apply <strong>Studio Background & Contact Shadow</strong> (Automated studio staging)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Clear Image Button */}
            {(selectedFile || manualImageUrl) && (
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  marginTop: "0.6rem",
                  background: "none",
                  border: "none",
                  color: "#E11D48",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <X size={13} />
                <span>Remove current photo</span>
              </button>
            )}
          </div>

          {/* Live Storefront Preview Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Eye size={17} style={{ color: "var(--gold-primary)" }} />
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Live Storefront Card Preview
              </h2>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.85rem" }}>
              Real-time representation of how customers will see this confection on the website.
            </p>

            {/* Mock Storefront Cake Card */}
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* Image Frame */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#FAFAF8",
                  overflow: "hidden",
                }}
              >
                {imagePreviewUrl || manualImageUrl ? (
                  <Image
                    src={activeDisplayImage}
                    alt={name || "Cake Preview"}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{ objectFit: "contain", padding: "12px" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      gap: "0.5rem",
                    }}
                  >
                    <ImageIcon size={36} strokeWidth={1.3} />
                    <span style={{ fontSize: "0.8rem" }}>Upload a photo to see live card</span>
                  </div>
                )}

                {/* Badges on Image */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    display: "flex",
                    gap: "0.35rem",
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.92)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-full)",
                      padding: "0.2rem 0.55rem",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "var(--gold-dark)",
                    }}
                  >
                    {selectedCategoryObj?.name || "Bespoke Cake"}
                  </span>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.9)",
                      color: "#FFFFFF",
                      borderRadius: "var(--radius-full)",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    🌱 Eggless
                  </span>
                </div>

                {isHero && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      background: "var(--gold-primary)",
                      color: "#FFFFFF",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.15rem 0.45rem",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    ★ Hero Showcase
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--gold-dark)", fontWeight: 700, textTransform: "uppercase" }}>
                  {flavour || "Flavour Profile"}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: "0.25rem 0 0.4rem",
                    lineHeight: 1.3,
                  }}
                >
                  {name || "Untitled Confection"}
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    margin: "0 0 0.75rem",
                    lineHeight: 1.45,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description || "Add description in the form to see gourmet tasting notes appear here..."}
                </p>

                {/* Available Sizes preview */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.85rem" }}>
                  {availableSizes.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "var(--bg-cream)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.15rem 0.4rem",
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Order Button Mock */}
                <div
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gold-primary)",
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  Enquire via WhatsApp
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fast Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="btn-gold"
              style={{
                width: "100%",
                padding: "0.7rem",
                fontSize: "0.88rem",
                fontWeight: 700,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="spin-slow" />
                  <span>Processing & Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Save Confection to Catalog</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="btn-outline-gold"
              style={{
                width: "100%",
                padding: "0.65rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              <Plus size={15} />
              <span>Save & Add Another Cake</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
