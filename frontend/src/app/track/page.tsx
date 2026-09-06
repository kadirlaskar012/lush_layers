"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import { trackEnquiry } from "../../lib/api";
import { Enquiry } from "../../lib/types";
import {
  Search,
  CheckCircle2,
  Clock,
  MessageCircle,
  ChefHat,
  PackageCheck,
  HeartHandshake,
  AlertCircle,
  Copy,
  Check,
  Cake,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import WhatsAppIcon from "../../components/WhatsAppIcon";

const STAGES = [
  {
    key: "New",
    title: "Enquiry Received",
    subtitle: "Logged in atelier schedule",
    icon: Clock,
  },
  {
    key: "Contacted",
    title: "Artisanal Dialogue",
    subtitle: "WhatsApp consultation active",
    icon: MessageCircle,
  },
  {
    key: "Confirmed",
    title: "Order Confirmed",
    subtitle: "Date & portion secured",
    icon: CheckCircle2,
  },
  {
    key: "Baking",
    title: "In Pastry Kitchen",
    subtitle: "Baking & sugar artistry",
    icon: ChefHat,
  },
  {
    key: "Ready",
    title: "Confection Ready",
    subtitle: "Boxed with luxury ribbon",
    icon: PackageCheck,
  },
  {
    key: "Delivered",
    title: "Delivered & Celebrated",
    subtitle: "Milestone celebrated",
    icon: HeartHandshake,
  },
];

function getStageIndex(status: string): number {
  const norm = status.toLowerCase();
  switch (norm) {
    case "new":
      return 0;
    case "contacted":
      return 1;
    case "confirmed":
      return 2;
    case "baking":
      return 3;
    case "ready":
      return 4;
    case "delivered":
    case "completed":
      return 5;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [refInput, setRefInput] = useState(initialRef);
  const [currentRef, setCurrentRef] = useState(initialRef);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  const fetchTracking = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await trackEnquiry(code);
      if (result) {
        setEnquiry(result);
        setCurrentRef(result.enquiry_number || code);
      } else {
        setEnquiry(null);
        setErrorMsg(`No confection enquiry found for reference "${code}". Please check your code or consult Tina on WhatsApp.`);
      }
    } catch (err: any) {
      setEnquiry(null);
      setErrorMsg("Unable to retrieve tracking information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      fetchTracking(initialRef);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;
    fetchTracking(refInput.trim());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeIndex = enquiry ? getStageIndex(enquiry.status) : 0;
  const isCancelled = enquiry?.status.toLowerCase() === "cancelled";

  return (
    <div style={{ paddingTop: "2rem", paddingBottom: "3.5rem" }} id="track-order-page">
      <div className="container-lux" style={{ maxWidth: "860px" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="cake-category-badge">Live Atelier Journey</span>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", color: "var(--text-primary)", fontWeight: 700, margin: "0.4rem 0 0.35rem" }}>
            Track Your Confection
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "560px", margin: "0 auto" }}>
            Follow your handcrafted cake from initial WhatsApp dialogue, through kitchen sponge baking, to final satin-ribbon delivery.
          </p>
        </div>

        {/* Tracking Search Input Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--gold-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            marginBottom: "2rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Enter enquiry reference (e.g. LL-7492 or 7492)..."
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: "2.4rem",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  width: "100%",
                }}
                id="track-reference-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !refInput.trim()}
              className="btn-gold icon-hover-slide"
              style={{
                padding: "0.6rem 1.5rem",
                fontSize: "0.86rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              id="track-search-btn"
            >
              <span>{loading ? "Locating..." : "Check Status"}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Error / Not Found Message */}
        {errorMsg && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FCD34D",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              color: "#92400E",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
            id="track-error-notice"
          >
            <AlertCircle size={22} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 700 }}>
                Reference Not Located
              </h4>
              <p style={{ margin: 0, fontSize: "0.84rem", lineHeight: 1.5 }}>
                {errorMsg}
              </p>
              <div style={{ marginTop: "0.85rem" }}>
                <a
                  href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20Tina%2C%20I%20am%20inquiring%20about%20my%20order%20status%20with%20reference%20${encodeURIComponent(refInput)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.85rem",
                    fontSize: "0.78rem",
                    textDecoration: "none",
                  }}
                >
                  <WhatsAppIcon size={14} />
                  <span>Ask Tina directly on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Enquiry Details & Stepper */}
        {enquiry && (
          <div id="track-result-container">
            {/* Top Order Summary Header */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem 1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "var(--shadow-xs)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--gold-dark)",
                      background: "var(--bg-cream)",
                      border: "1px solid var(--gold-border)",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "var(--radius-xs)",
                      letterSpacing: "0.06em",
                    }}
                    id="track-badge-ref"
                  >
                    #{enquiry.enquiry_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(enquiry.enquiry_number)}
                    title="Copy reference"
                    style={{
                      background: "none",
                      border: "none",
                      color: copied ? "#059669" : "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 700, margin: 0 }}>
                  Order for {enquiry.customer_name}
                </h2>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  Placed on {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Status Pill */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.4rem 1rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    background: isCancelled ? "#FEE2E2" : activeIndex >= 4 ? "#ECFDF5" : "var(--bg-cream)",
                    color: isCancelled ? "#991B1B" : activeIndex >= 4 ? "#047857" : "var(--gold-dark)",
                    border: `1px solid ${isCancelled ? "#FECACA" : activeIndex >= 4 ? "#A7F3D0" : "var(--gold-border)"}`,
                  }}
                  id="track-status-pill"
                >
                  Status: {enquiry.status}
                </span>
                {enquiry.delivery_date && (
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: "var(--text-muted)",
                      marginTop: "0.35rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "0.3rem",
                    }}
                  >
                    <Calendar size={13} color="var(--gold-dark)" />
                    <span>Est. Delivery: {enquiry.delivery_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stepper Card */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.75rem 1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "1.5rem", fontWeight: 700 }}>
                Preparation Timeline
              </h3>

              {isCancelled ? (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    borderRadius: "var(--radius-sm)",
                    padding: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  <AlertCircle size={28} style={{ margin: "0 auto 0.5rem" }} />
                  <h4 style={{ margin: "0 0 0.35rem", fontWeight: 700 }}>This Order Has Been Cancelled</h4>
                  <p style={{ margin: 0, fontSize: "0.84rem" }}>
                    If you believe this is a mistake or wish to reschedule, please reach out to Tina on WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="track-stepper-grid" style={{ display: "grid", gap: "1rem" }}>
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isCurrent = idx === activeIndex;
                    const isUpcoming = idx > activeIndex;
                    const IconComp = stage.icon;

                    return (
                      <div
                        key={stage.key}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "1rem",
                          position: "relative",
                          opacity: isUpcoming ? 0.45 : 1,
                        }}
                      >
                        {/* Icon Node */}
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: isCompleted
                              ? "#10B981"
                              : isCurrent
                              ? "var(--gold)"
                              : "var(--bg-cream)",
                            color: isCompleted || isCurrent ? "#FFFFFF" : "var(--text-muted)",
                            border: `2px solid ${
                              isCompleted
                                ? "#059669"
                                : isCurrent
                                ? "var(--gold-dark)"
                                : "var(--border-subtle)"
                            }`,
                            boxShadow: isCurrent ? "0 0 12px rgba(200, 155, 60, 0.4)" : "none",
                            transition: "all 0.25s ease",
                          }}
                        >
                          <IconComp size={18} />
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, paddingTop: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{
                                fontSize: "0.92rem",
                                fontWeight: isCurrent ? 700 : 600,
                                color: isCurrent
                                  ? "var(--gold-dark)"
                                  : isCompleted
                                  ? "var(--text-primary)"
                                  : "var(--text-muted)",
                              }}
                            >
                              {stage.title}
                            </span>
                            {isCurrent && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  padding: "0.15rem 0.5rem",
                                  background: "var(--bg-cream)",
                                  color: "var(--gold-dark)",
                                  border: "1px solid var(--gold-border)",
                                  borderRadius: "var(--radius-full)",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                Active Step
                              </span>
                            )}
                            {isCompleted && (
                              <span style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 600 }}>
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                            {stage.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cake Details Card */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem 1.5rem",
                marginBottom: "2rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "1rem", fontWeight: 700 }}>
                Confection Summary
              </h3>

              <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
                {enquiry.cake_image_url ? (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: "1px solid var(--border-light)",
                      background: "#FFFFFF",
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={enquiry.cake_image_url}
                      alt={enquiry.cake_name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-cream)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gold-dark)",
                      flexShrink: 0,
                    }}
                  >
                    <Cake size={32} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: "220px" }}>
                  <h4 style={{ fontSize: "1.1rem", color: "var(--text-primary)", margin: "0 0 0.25rem", fontWeight: 700 }}>
                    {enquiry.cake_name}
                  </h4>
                  <div style={{ fontSize: "0.84rem", color: "var(--gold-dark)", fontStyle: "italic", marginBottom: "0.4rem" }}>
                    Flavour: {enquiry.flavour || "Chef's Signature"}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        padding: "0.2rem 0.6rem",
                        background: "var(--bg-cream)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-full)",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      Portion / Size: {enquiry.selected_size || "1.0 kg"}
                    </span>
                  </div>
                </div>
              </div>

              {enquiry.custom_message && (
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid var(--border-light)",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--text-primary)" }}>Your Inscription & Event Notes:</strong>{" "}
                  {enquiry.custom_message}
                </div>
              )}

              {enquiry.admin_notes && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    background: "var(--bg-cream)",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--gold-border)",
                    fontSize: "0.82rem",
                    color: "var(--text-primary)",
                  }}
                >
                  <strong style={{ color: "var(--gold-dark)" }}>Note from Pastry Atelier:</strong>{" "}
                  {enquiry.admin_notes}
                </div>
              )}
            </div>

            {/* Direct WhatsApp Contact CTA */}
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                background: "linear-gradient(135deg, var(--bg-cream) 0%, var(--bg-surface) 100%)",
                border: "1px dashed var(--gold-border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <h4 style={{ fontSize: "1.05rem", color: "var(--text-primary)", margin: "0 0 0.4rem", fontWeight: 700 }}>
                Have questions or need bespoke alterations?
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto 1rem" }}>
                Chef Tina is available directly on WhatsApp to coordinate delivery timing, floral accents, and celebration details.
              </p>
              <a
                href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20Tina%2C%20I%20am%20chatting%20about%20my%20order%20%23${encodeURIComponent(enquiry.enquiry_number)}%20(${encodeURIComponent(enquiry.cake_name)}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp icon-hover-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.6rem 1.5rem",
                  fontSize: "0.86rem",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
                id="track-whatsapp-chat-btn"
              >
                <WhatsAppIcon size={16} />
                <span>Chat with Tina regarding #{enquiry.enquiry_number}</span>
              </a>
            </div>
          </div>
        )}

        {/* Empty State when no search conducted yet */}
        {!enquiry && !loading && !errorMsg && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1.5rem",
              background: "var(--bg-surface)",
              border: "1px dashed var(--border-subtle)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--bg-cream)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gold-dark)",
                marginBottom: "1rem",
              }}
            >
              <Sparkles size={26} />
            </div>
            <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", margin: "0 0 0.35rem", fontWeight: 700 }}>
              Track Your Bespoke Milestone Cake
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", maxWidth: "440px", margin: "0 auto 1.25rem", lineHeight: 1.5 }}>
              Enter your 4-digit enquiry number (e.g. <code>LL-7492</code>) received when placing an order with our atelier.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              <Link href="/cakes" className="btn-outline-gold" style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
                Browse Confections
              </Link>
              <Link href="/contact" className="btn-outline-gold" style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
                Atelier Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--text-muted)" }}>
          Loading order tracking atelier...
        </div>
      }>
        <TrackingContent />
      </Suspense>
    </PublicLayout>
  );
}
