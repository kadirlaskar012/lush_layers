"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getEnquiries, updateEnquiryStatus, deleteEnquiry } from "../../../lib/api";
import { Enquiry } from "../../../lib/types";

export default function AdminOrdersPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getEnquiries(statusFilter === "all" ? undefined : statusFilter, 200);
      setEnquiries(data);
    } catch (err: any) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    setActionLoading(enquiryId);
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus as any } : e))
      );
      setFeedback(`Status updated to "${newStatus}"!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (enquiryId: string) => {
    if (!confirm("Are you sure you want to remove this enquiry record?")) return;
    setActionLoading(enquiryId);
    try {
      await deleteEnquiry(enquiryId);
      setEnquiries((prev) => prev.filter((e) => e.id !== enquiryId));
      setFeedback("Enquiry deleted.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete enquiry");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
      case "contacted":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
      case "confirmed":
        return { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
      case "completed":
        return { bg: "#ECFDF5", text: "#047857", border: "#6EE7B7" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
      default:
        return { bg: "var(--bg-cream)", text: "var(--text-secondary)", border: "var(--border-subtle)" };
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      e.customer_name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      e.cake_name.toLowerCase().includes(q) ||
      (e.flavour && e.flavour.toLowerCase().includes(q))
    );
  });

  return (
    <div id="admin-orders-view">
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.65rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Customer Dialogue</span>
          <h1 style={{ fontSize: "1.45rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.1rem 0" }}>
            Orders & Enquiries Management ({enquiries.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Incoming WhatsApp orders and bespoke consultation records. Update fulfillment stages directly.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={loadEnquiries} className="btn-outline-gold" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem" }}>
            🔄 Refresh
          </button>
          <Link href="/admin" className="btn-outline-gold" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem" }}>
            Dashboard ↗
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.5rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "#D1FAE5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            fontSize: "0.82rem",
            marginBottom: "1rem",
            fontWeight: 500,
          }}
        >
          ✓ {feedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem 1rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {/* Status Pills */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {["all", "New", "Contacted", "Confirmed", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "var(--gold)" : "var(--bg-cream)",
                border: statusFilter === st ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                color: statusFilter === st ? "#FFFFFF" : "var(--text-secondary)",
                padding: "0.28rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: statusFilter === st ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {st === "all" ? "All Enquiries" : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: "220px" }}>
          <input
            type="text"
            placeholder="Search customer, phone, cake..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", width: "100%" }}
          />
        </div>
      </div>

      {/* Orders Table - Compact & Responsive */}
      {filteredEnquiries.length === 0 && !isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            background: "var(--bg-surface)",
            border: "1px dashed var(--gold-border)",
            borderRadius: "var(--radius-md)",
            marginTop: "1rem",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
            No orders or enquiries found
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            When patrons order via WhatsApp, customer enquiries will appear here for status tracking.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.82rem",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-cream)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Contact Phone</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Confection & Flavour</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Portion Tier</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Custom Message / Date</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enq) => {
                  const badge = getStatusBadge(enq.status);
                  const cleanPhone = enq.phone.replace(/[^0-9]/g, "");

                  return (
                    <tr
                      key={enq.id}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        transition: "background 0.15s",
                      }}
                      className="admin-table-row"
                    >
                      {/* Customer */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{enq.customer_name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {new Date(enq.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Phone with WhatsApp Link */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(enq.customer_name)}%2C%20this%20is%20LUSH%20LAYERS%20confectionery%20atelier%20regarding%20your%20enquiry%20for%20the%20${encodeURIComponent(enq.cake_name)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--whatsapp)",
                              textDecoration: "none",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <span>💬</span>
                            <span>{enq.phone}</span>
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>{enq.phone}</span>
                        )}
                      </td>

                      {/* Cake & Flavour */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--gold-dark)" }}>🎂 {enq.cake_name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                          {enq.flavour}
                        </div>
                      </td>

                      {/* Size */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "0.15rem 0.5rem",
                            background: "var(--bg-cream)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-full)",
                            color: "var(--text-primary)",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {enq.selected_size}
                        </span>
                      </td>

                      {/* Custom Message */}
                      <td style={{ padding: "0.65rem 0.85rem", maxWidth: "220px" }}>
                        <div
                          style={{
                            fontSize: "0.76rem",
                            color: enq.custom_message ? "var(--text-primary)" : "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={enq.custom_message || "None"}
                        >
                          {enq.custom_message || "—"}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          disabled={actionLoading === enq.id}
                          style={{
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            borderRadius: "var(--radius-full)",
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.65rem 0.85rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(enq.id)}
                          disabled={actionLoading === enq.id}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#EF4444",
                            fontSize: "0.76rem",
                            cursor: "pointer",
                            padding: "0.2rem 0.4rem",
                          }}
                          title="Delete enquiry"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
