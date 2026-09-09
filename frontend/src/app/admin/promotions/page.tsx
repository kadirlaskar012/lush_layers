"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Tag,
  Percent,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  Eye,
  ShieldCheck,
  Gift,
  ArrowRight,
  Crown,
  Award,
  RefreshCw,
} from "lucide-react";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/lib/api";
import { Promotion } from "@/lib/types";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  useBodyScrollLock(isCreatingNew || !!editingPromo);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formBadge, setFormBadge] = useState("Special Offer");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEdition, setFormEdition] = useState("Seasonal Harvest Selection");
  const [formPromoCode, setFormPromoCode] = useState("");
  const [formDiscountPercent, setFormDiscountPercent] = useState(5);
  const [formMinOrderAmount, setFormMinOrderAmount] = useState(1000);
  const [formAddonPerk, setFormAddonPerk] = useState("Complimentary Addon Mini Cake");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsNewUserOnly, setFormIsNewUserOnly] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(data);
    } catch (e) {
      console.error("Failed to load promotions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setIsCreatingNew(true);
    setFormTitle("First Customer Celebration");
    setFormBadge("First Customer Discount 5%");
    setFormTagline("Above ₹1000 bill user will get 5% discount and an addon cake");
    setFormDescription("Enjoy an exclusive 5% welcome discount on your initial luxury confection booking, plus an exquisite complimentary artisan addon cake when order exceeds ₹1,000.");
    setFormEdition("First Customer Special Welcome Edition");
    setFormPromoCode("FIRST5");
    setFormDiscountPercent(5);
    setFormMinOrderAmount(1000);
    setFormAddonPerk("Complimentary Addon Mini Cake");
    setFormImageUrl("");
    setFormIsNewUserOnly(true);
    setFormIsActive(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setIsCreatingNew(false);
    setFormTitle(promo.title || "");
    setFormBadge(promo.badge || "Special Offer");
    setFormTagline(promo.tagline || "");
    setFormDescription(promo.description || "");
    setFormEdition(promo.edition || "");
    setFormPromoCode(promo.promo_code || "");
    setFormDiscountPercent(promo.discount_percent ?? 5);
    setFormMinOrderAmount(promo.min_order_amount ?? 1000);
    setFormAddonPerk(promo.addon_perk || "");
    setFormImageUrl(promo.image_url || "");
    setFormIsNewUserOnly(Boolean(promo.is_new_user_only));
    setFormIsActive(Boolean(promo.is_active));
  };

  const closeModal = () => {
    setEditingPromo(null);
    setIsCreatingNew(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Try local FastAPI endpoint
      const res = await fetch("http://localhost:8000/api/promotions/upload-poster", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormImageUrl(data.image_url);
        setStatusMessage("Poster image uploaded successfully!");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        // Fallback: Read as base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setFormImageUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn("Upload error, falling back to FileReader:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Please enter a title.");
      return;
    }
    if (!formPromoCode.trim()) {
      alert("Please enter a promo code.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Promotion> = {
        title: formTitle.trim(),
        badge: formBadge.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        edition: formEdition.trim(),
        promo_code: formPromoCode.trim().toUpperCase(),
        discount_percent: Number(formDiscountPercent) || 0,
        min_order_amount: Number(formMinOrderAmount) || 0,
        addon_perk: formAddonPerk.trim(),
        image_url: formImageUrl.trim() || undefined,
        is_new_user_only: formIsNewUserOnly,
        is_active: formIsActive,
      };

      if (isCreatingNew) {
        const created = await createPromotion(payload);
        if (created) {
          setStatusMessage("Promotional poster created successfully!");
          closeModal();
          fetchPromos();
        } else {
          alert("Failed to create promotion. Please try again.");
        }
      } else if (editingPromo) {
        const updated = await updatePromotion(editingPromo.id, payload);
        if (updated) {
          setStatusMessage("Promotional poster updated successfully!");
          closeModal();
          fetchPromos();
        } else {
          alert("Failed to update promotion.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete offer "${title}"?`)) return;
    try {
      const ok = await deletePromotion(id);
      if (ok) {
        setStatusMessage("Offer deleted successfully.");
        fetchPromos();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      const updated = await updatePromotion(promo.id, {
        is_active: !promo.is_active,
      });
      if (updated) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, is_active: !promo.is_active } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = promotions.filter((p) => Boolean(p.is_active)).length;
  const newCustomerCount = promotions.filter((p) => Boolean(p.is_new_user_only)).length;

  return (
    <div className="admin-page-container" style={{ padding: "1.75rem 2rem 3rem" }}>
      {/* Toast Notification */}
      {statusMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background: "#10B981",
            color: "#FFFFFF",
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--gold-soft)",
                color: "var(--gold-dark)",
              }}
            >
              <Percent size={18} />
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Promotional Offers & Homepage Posters
            </h1>
          </div>
          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", margin: 0 }}>
            Configure custom designed posters, discount codes, min-order perks, and new customer auto-detection for the homepage banner.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={fetchPromos}
            className="admin-btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 0.9rem", fontSize: "0.84rem" }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="btn-gold"
            style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.6rem 1.25rem", fontSize: "0.86rem" }}
          >
            <Plus size={16} />
            <span>Add Poster / Offer</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="admin-stat-card" style={{ borderTop: "3px solid #10B981" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Active Banner Posters
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {activeCount} <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 400 }}>of {promotions.length}</span>
          </div>
          <div style={{ fontSize: "0.76rem", color: "#059669", marginTop: "0.2rem" }}>
            Displayed on Homepage Rotator
          </div>
        </div>

        <div className="admin-stat-card" style={{ borderTop: "3px solid #C5983A" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            New Customer Welcome Offers
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {newCustomerCount}
          </div>
          <div style={{ fontSize: "0.76rem", color: "#B88E3E", marginTop: "0.2rem" }}>
            Auto-detected on first enquiry
          </div>
        </div>

        <div className="admin-stat-card" style={{ borderTop: "3px solid #8B5CF6" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Special Perks & Addons
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            ₹1,000+
          </div>
          <div style={{ fontSize: "0.76rem", color: "#6D28D9", marginTop: "0.2rem" }}>
            Complimentary Addon Mini Cake perk
          </div>
        </div>
      </div>

      {/* Posters Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
          <RefreshCw size={24} className="spin" style={{ margin: "0 auto 0.75rem" }} />
          <div>Loading promotional posters...</div>
        </div>
      ) : promotions.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-subtle)",
            borderRadius: "14px",
            padding: "3.5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <Sparkles size={36} style={{ color: "var(--gold)", margin: "0 auto 0.85rem" }} />
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
            No Promotional Posters Configured
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "460px", margin: "0 auto 1.25rem" }}>
            Create your first customized poster with discount percentage (e.g. 5%), promo code, and complimentary addon cake perk.
          </p>
          <button type="button" onClick={openCreateModal} className="btn-gold" style={{ padding: "0.55rem 1.25rem" }}>
            <Plus size={16} />
            <span>Create First Offer Poster</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {promotions.map((promo) => (
            <div
              key={promo.id}
              style={{
                background: "var(--bg-surface)",
                border: `1.5px solid ${promo.is_active ? "rgba(197, 152, 58, 0.4)" : "var(--border-subtle)"}`,
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: promo.is_active ? "0 4px 18px rgba(197, 152, 58, 0.08)" : "none",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.25s ease",
              }}
            >
              {/* Optional Custom Poster Image Preview */}
              {promo.image_url ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "170px",
                    background: "#0D1117",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "12px",
                      right: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(6px)",
                        color: "#F6E7B9",
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "5px",
                        border: "1px solid rgba(246, 231, 185, 0.3)",
                        fontWeight: 600,
                      }}
                    >
                      🎨 Custom Poster Artwork
                    </span>
                    <span
                      style={{
                        background: promo.is_active ? "#10B981" : "#6B7280",
                        color: "#FFFFFF",
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "10px",
                        fontWeight: 600,
                      }}
                    >
                      {promo.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "0.85rem 1.15rem",
                    background: "linear-gradient(135deg, #FFFDF8 0%, #FAF4E8 100%)",
                    borderBottom: "1px solid rgba(197, 152, 58, 0.15)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={14} style={{ color: "var(--gold)" }} />
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--gold-dark)" }}>
                      {promo.badge || "Storefront Poster"}
                    </span>
                  </div>
                  <span
                    style={{
                      background: promo.is_active ? "#ECFDF5" : "#F3F4F6",
                      color: promo.is_active ? "#059669" : "#6B7280",
                      fontSize: "0.72rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "10px",
                      fontWeight: 600,
                      border: `1px solid ${promo.is_active ? "#A7F3D0" : "#E5E7EB"}`,
                    }}
                  >
                    {promo.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              )}

              {/* Card Body */}
              <div style={{ padding: "1.15rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    {promo.title}
                  </h3>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #B88E3E 0%, #8F6418 100%)",
                      color: "#FFFFFF",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "0.86rem",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {promo.discount_percent}% OFF
                  </div>
                </div>

                {promo.tagline && (
                  <p style={{ fontSize: "0.8rem", color: "var(--gold-dark)", fontStyle: "italic", margin: "0 0 0.5rem" }}>
                    {promo.tagline}
                  </p>
                )}

                {promo.description && (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: "0 0 0.85rem", flex: 1 }}>
                    {promo.description}
                  </p>
                )}

                {/* Promo Code & Conditions Bar */}
                <div
                  style={{
                    background: "var(--bg-main)",
                    borderRadius: "8px",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    marginBottom: "1rem",
                    fontSize: "0.78rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Promo Code:</span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "var(--gold-dark)",
                        letterSpacing: "0.05em",
                        background: "rgba(197, 152, 58, 0.12)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      {promo.promo_code}
                    </span>
                  </div>

                  {promo.addon_perk && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#059669" }}>
                      <span>Perk (₹{promo.min_order_amount || 1000}+):</span>
                      <span style={{ fontWeight: 600 }}>{promo.addon_perk}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Eligibility:</span>
                    <span style={{ fontWeight: 600, color: promo.is_new_user_only ? "#B88E3E" : "var(--text-primary)" }}>
                      {promo.is_new_user_only ? "✨ New Customers Only" : "🌐 All Patrons"}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "auto" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(promo)}
                    className="admin-btn-secondary"
                    style={{
                      flex: 1,
                      fontSize: "0.78rem",
                      padding: "0.45rem",
                      color: promo.is_active ? "#B45309" : "#059669",
                    }}
                  >
                    {promo.is_active ? "Pause Poster" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(promo)}
                    className="admin-btn-secondary"
                    style={{ padding: "0.45rem 0.75rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(promo.id, promo.title)}
                    className="admin-btn-secondary"
                    style={{ padding: "0.45rem 0.65rem", color: "#DC2626" }}
                    title="Delete offer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(isCreatingNew || editingPromo) && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-surface)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "1.75rem",
              boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
              border: "1px solid var(--border-subtle)",
              position: "relative",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "0.85rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {isCreatingNew ? "Create New Promotional Poster & Code" : "Edit Promotional Poster"}
                </h2>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0" }}>
                  Customize the banner text, discount %, promo code, and poster artwork image.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  padding: "0.3rem",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div
              style={{
                background: "linear-gradient(180deg, #EDF5EA 0%, #E1EFE0 100%)",
                border: "1px solid #D0E3CA",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "#2E5E2C", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                👁️ Live Banner Preview (How patrons will see this on Homepage)
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #FFFDF8 0%, #FAF4E8 50%, #F5ECDD 100%)",
                  border: "1px solid rgba(197, 152, 58, 0.35)",
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                  position: "relative",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {formImageUrl && (
                  <img
                    src={formImageUrl}
                    alt="Poster preview"
                    style={{
                      width: "120px",
                      height: "85px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1.5px solid var(--gold)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.3rem" }}>
                    <span
                      style={{
                        background: "rgba(197, 152, 58, 0.15)",
                        color: "var(--gold-dark)",
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontWeight: 700,
                      }}
                    >
                      {formBadge || "Special Offer"}
                    </span>
                    <span
                      style={{
                        background: "linear-gradient(135deg, #B88E3E 0%, #8F6418 100%)",
                        color: "#FFFFFF",
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontWeight: 700,
                      }}
                    >
                      {formDiscountPercent}% OFF • Code: {formPromoCode || "FIRST5"}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.25rem" }}>
                    {formTitle || "Poster Title"}
                  </h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 0.4rem", lineHeight: 1.4 }}>
                    {formDescription || formTagline || "Confection description and promo details"}
                  </p>
                  {formAddonPerk && (
                    <div style={{ fontSize: "0.74rem", color: "#059669", fontWeight: 600 }}>
                      🎂 Perk: {formAddonPerk} (on orders &gt; ₹{formMinOrderAmount})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Title */}
                <div style={{ gridColumn: "span 2" }}>
                  <label className="admin-form-label">
                    Poster Title <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. First Customer Welcome & Celebration"
                    className="admin-form-input"
                  />
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="admin-form-label">Ribbon Badge Text</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. First Customer Discount 5%"
                    className="admin-form-input"
                  />
                </div>

                {/* Edition Subtitle */}
                <div>
                  <label className="admin-form-label">Edition Subtitle</label>
                  <input
                    type="text"
                    value={formEdition}
                    onChange={(e) => setFormEdition(e.target.value)}
                    placeholder="e.g. 2026 Special Offer"
                    className="admin-form-input"
                  />
                </div>

                {/* Promo Code */}
                <div>
                  <label className="admin-form-label">
                    Promo Code (Auto-Uppercased) <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPromoCode}
                    onChange={(e) => setFormPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FIRST5"
                    className="admin-form-input"
                    style={{ textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 }}
                  />
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="admin-form-label">
                    Discount Percentage (%) <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formDiscountPercent}
                    onChange={(e) => setFormDiscountPercent(Number(e.target.value))}
                    className="admin-form-input"
                  />
                </div>

                {/* Min Order Bill Amount */}
                <div>
                  <label className="admin-form-label">Min Bill for Addon Perk (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formMinOrderAmount}
                    onChange={(e) => setFormMinOrderAmount(Number(e.target.value))}
                    placeholder="1000"
                    className="admin-form-input"
                  />
                </div>

                {/* Addon Perk */}
                <div>
                  <label className="admin-form-label">Complimentary Addon Perk</label>
                  <input
                    type="text"
                    value={formAddonPerk}
                    onChange={(e) => setFormAddonPerk(e.target.value)}
                    placeholder="e.g. Complimentary Addon Mini Cake"
                    className="admin-form-input"
                  />
                </div>

                {/* Tagline */}
                <div style={{ gridColumn: "span 2" }}>
                  <label className="admin-form-label">Tagline (Highlighted Italic)</label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Above 1000 bill user will get 5% discount and an addon cake"
                    className="admin-form-input"
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: "span 2" }}>
                  <label className="admin-form-label">Full Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Full copy explaining ingredients, celebration theme, and offer details..."
                    className="admin-form-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Custom Poster Image Upload / URL */}
                <div style={{ gridColumn: "span 2" }}>
                  <label className="admin-form-label">Custom Poster Artwork Image</label>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. /media/processed/poster.webp or https://...)"
                      className="admin-form-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="admin-btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}
                    >
                      <Upload size={14} />
                      <span>{uploadingImage ? "Uploading..." : "Upload Poster"}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                    You can upload your own custom designed poster file, and it will be framed in gold on the storefront banner!
                  </div>
                </div>

                {/* Checkboxes: New User Only & Active */}
                <div
                  style={{
                    gridColumn: "span 2",
                    display: "flex",
                    gap: "2rem",
                    background: "var(--bg-main)",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.84rem" }}>
                    <input
                      type="checkbox"
                      checked={formIsNewUserOnly}
                      onChange={(e) => setFormIsNewUserOnly(e.target.checked)}
                      style={{ width: "17px", height: "17px", accentColor: "var(--gold)" }}
                    />
                    <div>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>
                        New Customer Only (First Order Auto-Apply)
                      </strong>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                        Auto-detects when new mobile number is typed during enquiry. Rejects returning numbers.
                      </span>
                    </div>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.84rem" }}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      style={{ width: "17px", height: "17px", accentColor: "var(--gold)" }}
                    />
                    <div>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>Active on Storefront</strong>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                        Visible on homepage animated poster rotator.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="admin-btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold"
                  disabled={isSaving}
                  style={{ minWidth: "120px" }}
                >
                  {isSaving ? "Saving..." : isCreatingNew ? "Create Offer Poster" : "Update Poster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
