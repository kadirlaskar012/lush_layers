"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cake, Enquiry } from "../lib/types";
import { createEnquiry, checkPhoneEligibility } from "../lib/api";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Tag,
  Gift,
  RefreshCw,
} from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";

interface WhatsAppOrderModalProps {
  cake: Cake;
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
  initialPromoCode?: string;
}

export default function WhatsAppOrderModal({
  cake,
  isOpen,
  onClose,
  initialSize,
  initialPromoCode,
}: WhatsAppOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize ||
    (cake.available_sizes && cake.available_sizes.length > 0
      ? cake.available_sizes[0]
      : "1.0 kg (Medium)")
  );
  const [customMessage, setCustomMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);
  const [copied, setCopied] = useState(false);

  // Phone auto-detect & promo states
  const [phoneCheckStatus, setPhoneCheckStatus] = useState<
    "idle" | "checking" | "new_user" | "existing_user"
  >("idle");
  const [promoCodeInput, setPromoCodeInput] = useState(initialPromoCode || "");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    perk?: string;
    minOrder?: number;
  } | null>(null);
  const [promoNotice, setPromoNotice] = useState<{
    type: "celebration" | "warning" | "info" | "error";
    title: string;
    message: string;
    perk?: string;
  } | null>(null);

  // Auto-detect new vs returning patron on phone entry (debounced)
  useEffect(() => {
    const cleanDigits = phone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setPhoneCheckStatus("idle");
      setPromoNotice(null);
      return;
    }

    setPhoneCheckStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkPhoneEligibility(phone, promoCodeInput);
        if (result.is_new_user) {
          setPhoneCheckStatus("new_user");
          if (result.eligible && result.discount_percent) {
            setAppliedPromo({
              code: result.promo_code || "FIRST5",
              discountPercent: result.discount_percent,
              perk: result.addon_perk,
              minOrder: result.min_order_amount,
            });
            if (!promoCodeInput && result.promo_code) {
              setPromoCodeInput(result.promo_code);
            }
            setPromoNotice({
              type: "celebration",
              title: `🎉 You are eligible for ${result.discount_percent}% First-Customer Discount!`,
              message: `Welcome to LUSH LAYERS! Your ${result.discount_percent}% welcome discount (Code: ${result.promo_code || "FIRST5"}) has been automatically applied!`,
              perk: result.addon_perk
                ? `🎂 Orders above ₹${result.min_order_amount || 1000} also receive: ${result.addon_perk}!`
                : undefined,
            });
          }
        } else {
          setPhoneCheckStatus("existing_user");
          // If code is new-user-only, disallow and show warning
          if (
            result.code_status === "already_redeemed" ||
            (appliedPromo && result.promo?.is_new_user_only)
          ) {
            setAppliedPromo(null);
            setPromoNotice({
              type: "warning",
              title: "ℹ️ Welcome Back to LUSH LAYERS!",
              message:
                "Our studio recognizes your mobile number! You have already redeemed the new customer welcome offer. Welcome back!",
            });
          } else if (result.eligible && result.discount_percent) {
            setAppliedPromo({
              code: result.promo_code || "",
              discountPercent: result.discount_percent,
              perk: result.addon_perk,
              minOrder: result.min_order_amount,
            });
            setPromoNotice({
              type: "celebration",
              title: `🎉 Code ${result.promo_code} Applied!`,
              message: `${result.discount_percent}% discount applied to this booking.`,
              perk: result.addon_perk,
            });
          } else {
            setPromoNotice({
              type: "info",
              title: "ℹ️ Valued Returning Patron",
              message:
                "Welcome back! New customer welcome discount codes are not applicable for returning numbers.",
            });
          }
        }
      } catch (err) {
        console.error("Phone verification error:", err);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [phone]);

  if (!isOpen) return null;

  const bakeryWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  const handleClose = () => {
    setSubmittedEnquiry(null);
    setCopied(false);
    setError("");
    setPromoNotice(null);
    onClose();
  };

  const handleCopyRef = () => {
    if (!submittedEnquiry?.enquiry_number) return;
    navigator.clipboard.writeText(submittedEnquiry.enquiry_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    const cleanDigits = phone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setError("Please enter your 10-digit mobile number above first to verify discount eligibility.");
      return;
    }

    try {
      const result = await checkPhoneEligibility(phone, promoCodeInput.trim());
      if (result.eligible && result.discount_percent) {
        setAppliedPromo({
          code: result.promo_code || promoCodeInput.trim().toUpperCase(),
          discountPercent: result.discount_percent,
          perk: result.addon_perk,
          minOrder: result.min_order_amount,
        });
        setPromoNotice({
          type: "celebration",
          title: `🎉 Code ${result.promo_code} Applied!`,
          message: `${result.discount_percent}% discount granted!`,
          perk: result.addon_perk
            ? `🎂 Orders above ₹${result.min_order_amount || 1000} get: ${result.addon_perk}!`
            : undefined,
        });
        setError("");
      } else {
        setAppliedPromo(null);
        setPromoNotice({
          type: result.code_status === "already_redeemed" ? "warning" : "error",
          title:
            result.code_status === "already_redeemed"
              ? "ℹ️ Offer Already Redeemed"
              : "Invalid Offer Code",
          message: result.message || "This promo code is not eligible for your booking.",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your contact phone number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    let enquiry: Enquiry | null = null;
    try {
      enquiry = await createEnquiry({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        cake_name: cake.name,
        cake_image_url: cake.image_url,
        flavour: cake.flavour,
        selected_size: selectedSize,
        custom_message: customMessage.trim(),
        applied_promo_code: appliedPromo?.code,
        discount_percent: appliedPromo?.discountPercent,
        promo_perk: appliedPromo?.perk,
      });
    } catch (err) {
      console.warn("Could not save enquiry in background:", err);
    }

    const refNumber = enquiry?.enquiry_number || `LL-${Math.floor(1000 + Math.random() * 9000)}`;

    // STRICT FORMAT (ZERO PRICE + PROMO APPLIED)
    const messageLines = [
      "Hello LUSH LAYERS,",
      "",
      `*Enquiry Reference: ${refNumber}*`,
      "",
      "I would like to order/enquire about:",
      `• Confection: ${cake.name}`,
      `• Flavour: ${cake.flavour}`,
      `• Size / Tier: ${selectedSize}`,
      ...(appliedPromo
        ? [
            `• Applied Offer: ${appliedPromo.code} (${appliedPromo.discountPercent}% OFF)`,
            ...(appliedPromo.perk
              ? [`• Special Perk: ${appliedPromo.perk} (on orders > ₹${appliedPromo.minOrder || 1000})`]
              : []),
          ]
        : []),
      "",
      `• Patron Name: ${customerName.trim()}`,
      `• Contact Phone: ${phone.trim()}`,
      "",
      "Event Date / Custom Inscription:",
      customMessage.trim() || "Bespoke consultation requested",
    ];

    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/${bakeryWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    if (enquiry) {
      setSubmittedEnquiry(enquiry);
    } else {
      // Fallback object for visual confirmation
      setSubmittedEnquiry({
        id: "temp",
        enquiry_number: refNumber,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        cake_name: cake.name,
        cake_image_url: cake.image_url,
        flavour: cake.flavour,
        selected_size: selectedSize,
        applied_promo_code: appliedPromo?.code,
        discount_percent: appliedPromo?.discountPercent,
        promo_perk: appliedPromo?.perk,
        status: "New",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose} id="whatsapp-modal-overlay">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        id="whatsapp-modal"
        style={{ maxWidth: "560px" }}
      >
        <button
          className="modal-close-btn icon-hover-rotate"
          onClick={handleClose}
          aria-label="Close modal"
          id="whatsapp-modal-close-btn"
        >
          <X size={18} />
        </button>

        {submittedEnquiry ? (
          <div style={{ textAlign: "center", padding: "0.5rem 0.25rem" }} id="whatsapp-modal-success-screen">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                border: "2px solid #6EE7B7",
                color: "#059669",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.85rem",
              }}
            >
              <CheckCircle2 size={28} />
            </div>

            <span className="cake-category-badge" style={{ marginBottom: "0.35rem", display: "inline-block" }}>
              WhatsApp Consultation Dispatched
            </span>
            <h3 style={{ fontSize: "1.45rem", color: "var(--text-primary)", marginBottom: "0.35rem", fontWeight: 700 }}>
              Booking Request Registered!
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Chef Tina Baidya will review your bespoke specifications and respond on WhatsApp shortly.
            </p>

            {/* Applied Promotion Celebration Card */}
            {(submittedEnquiry.applied_promo_code || appliedPromo) && (
              <div
                style={{
                  background: "linear-gradient(135deg, #FFFDF8 0%, #FAF3E0 100%)",
                  border: "1.5px solid #E5C378",
                  borderRadius: "10px",
                  padding: "0.85rem 1rem",
                  marginBottom: "1.25rem",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold-dark)", fontWeight: 700, fontSize: "0.84rem", marginBottom: "0.25rem" }}>
                  <Sparkles size={16} />
                  <span>
                    Offer Applied: {submittedEnquiry.applied_promo_code || appliedPromo?.code} (
                    {submittedEnquiry.discount_percent || appliedPromo?.discountPercent}% Discount)
                  </span>
                </div>
                {(submittedEnquiry.promo_perk || appliedPromo?.perk) && (
                  <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                    🎂 {submittedEnquiry.promo_perk || appliedPromo?.perk} (above ₹1,000 order)
                  </div>
                )}
              </div>
            )}

            {/* Reference Number Box */}
            <div
              style={{
                background: "var(--bg-cream)",
                border: "1.5px dashed var(--gold)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                Your Unique Enquiry Reference
              </div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  fontFamily: "monospace",
                  color: "var(--gold-dark)",
                  letterSpacing: "0.08em",
                  marginBottom: "0.6rem",
                }}
                id="modal-enquiry-ref-text"
              >
                {submittedEnquiry.enquiry_number}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  style={{
                    background: copied ? "#059669" : "var(--gold)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.2s ease",
                  }}
                  id="modal-copy-ref-btn"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Reference #"}</span>
                </button>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginBottom: "1.35rem",
                padding: "0 0.5rem",
              }}
            >
              Use this reference number anytime on our website to track preparation, baking, and delivery milestones.
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline-gold"
                style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.82rem" }}
              >
                Close
              </button>
              <Link
                href={`/track?ref=${encodeURIComponent(submittedEnquiry.enquiry_number)}`}
                onClick={handleClose}
                className="btn-gold icon-hover-slide"
                style={{
                  flex: 1.4,
                  padding: "0.6rem 1rem",
                  fontSize: "0.82rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  textDecoration: "none",
                }}
                id="modal-track-order-btn"
              >
                <span>Track My Order</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.15rem" }}>
              <span className="cake-category-badge">Direct WhatsApp Enquiry</span>
              <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", marginBottom: "0.2rem", fontWeight: 700 }}>
                Order with Our Master Baker
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Share your event date and desired portion to discuss bespoke styling directly on WhatsApp.
              </p>
            </div>

            {/* Selected Cake Preview (STRICTLY NO PRICE) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.6rem 0.85rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {cake.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cake.image_url}
                    alt={cake.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "1.25rem" }}>🎂</span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--text-primary)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {cake.name}
                </h4>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gold-dark)",
                    margin: "0.15rem 0 0",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {cake.flavour}
                </p>
              </div>
            </div>

            {/* AUTO-DETECT PROMOTION NOTIFICATION POPUP */}
            {promoNotice && (
              <div
                style={{
                  padding: "0.75rem 0.9rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  background:
                    promoNotice.type === "celebration"
                      ? "linear-gradient(135deg, #FFFDF8 0%, #FEF9EC 100%)"
                      : promoNotice.type === "warning"
                      ? "#FFFBEB"
                      : "#EFF6FF",
                  border:
                    promoNotice.type === "celebration"
                      ? "1.5px solid #F59E0B"
                      : promoNotice.type === "warning"
                      ? "1px solid #FCD34D"
                      : "1px solid #BFDBFE",
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  {promoNotice.type === "celebration" ? (
                    <Sparkles size={18} style={{ color: "#D97706", flexShrink: 0, marginTop: "2px" }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: "#B45309", flexShrink: 0, marginTop: "2px" }} />
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        color: promoNotice.type === "celebration" ? "#B45309" : "#92400E",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {promoNotice.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: promoNotice.type === "celebration" ? "#78350F" : "#78350F",
                        lineHeight: 1.4,
                      }}
                    >
                      {promoNotice.message}
                    </div>
                    {promoNotice.perk && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#059669",
                          marginTop: "0.3rem",
                        }}
                      >
                        {promoNotice.perk}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#FEE2E2",
                  border: "1px solid #FECACA",
                  color: "#991B1B",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleOrder}>
              {/* Size Selector */}
              <div className="form-group" style={{ marginBottom: "0.85rem" }}>
                <label className="form-label" style={{ fontSize: "0.78rem", marginBottom: "0.35rem" }}>
                  Select Size / Tier:
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {cake.available_sizes && cake.available_sizes.length > 0 ? (
                    cake.available_sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          padding: "0.3rem 0.7rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          background: selectedSize === sz ? "var(--gold)" : "var(--bg-main)",
                          border: selectedSize === sz ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                          color: selectedSize === sz ? "#FFFFFF" : "var(--text-secondary)",
                          fontWeight: selectedSize === sz ? 600 : 500,
                        }}
                      >
                        {sz}
                      </button>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Custom portions on consultation</span>
                  )}
                </div>
              </div>

              {/* Name & Phone Inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.75rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyo Sen"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setError("");
                    }}
                    className="form-input"
                    id="modal-customer-name"
                    style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.78rem", display: "flex", justifyContent: "space-between" }}>
                    <span>Mobile Number *</span>
                    {phoneCheckStatus === "checking" && (
                      <span style={{ color: "var(--gold)", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <RefreshCw size={10} className="spin" /> checking...
                      </span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError("");
                    }}
                    className="form-input"
                    id="modal-customer-phone"
                    style={{
                      padding: "0.45rem 0.75rem",
                      fontSize: "0.82rem",
                      borderColor:
                        phoneCheckStatus === "new_user"
                          ? "#10B981"
                          : phoneCheckStatus === "existing_user"
                          ? "#F59E0B"
                          : undefined,
                    }}
                  />
                </div>
              </div>

              {/* Promo Code Input & Quick Apply Bar */}
              <div
                style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "0.55rem 0.75rem",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Tag size={15} style={{ color: "var(--gold-dark)", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Offer Code (e.g. FIRST5)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "0.8rem",
                    flex: 1,
                    outline: "none",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                />
                {appliedPromo ? (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      background: "#ECFDF5",
                      color: "#059669",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontWeight: 700,
                      border: "1px solid #A7F3D0",
                    }}
                  >
                    ✓ {appliedPromo.discountPercent}% OFF
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    style={{
                      background: "var(--gold)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                )}
              </div>

              {/* Inscription & Event Notes */}
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>
                  Custom Inscription / Date / Event Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Happy 30th Birthday plaque, deliver this Sunday, eggless..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="form-textarea"
                  id="modal-custom-message"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-outline-gold"
                  style={{ flex: 1, padding: "0.55rem 1rem", fontSize: "0.82rem" }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-whatsapp icon-hover-lift"
                  style={{
                    flex: 2,
                    padding: "0.55rem 1rem",
                    fontSize: "0.82rem",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                  id="modal-submit-whatsapp-btn"
                  disabled={isSubmitting}
                >
                  <WhatsAppIcon size={16} />
                  <span>{isSubmitting ? "Generating Ref..." : "Send Enquiry on WhatsApp"}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
