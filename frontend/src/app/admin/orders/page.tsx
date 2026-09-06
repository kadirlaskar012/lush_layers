"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getEnquiries, updateEnquiryStatus, updateEnquiryDetails, deleteEnquiry } from "../../../lib/api";
import { Enquiry } from "../../../lib/types";
import {
  RotateCw,
  CheckCircle2,
  ClipboardList,
  Cake,
  Trash2,
  ArrowUpRight,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  X,
} from "lucide-react";
import WhatsAppIcon from "../../../components/WhatsAppIcon";

export default function AdminOrdersPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Modal State
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [editForm, setEditForm] = useState<{
    selected_size: string;
    delivery_date: string;
    admin_notes: string;
    status: string;
    flavour: string;
  }>({
    selected_size: "",
    delivery_date: "",
    admin_notes: "",
    status: "New",
    flavour: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Copied Enquiry Number feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getEnquiries(statusFilter === "all" ? undefined : statusFilter, undefined, 200);
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
      const updated = await updateEnquiryStatus(enquiryId, newStatus);
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

  const handleOpenEditModal = (enq: Enquiry) => {
    setEditingEnquiry(enq);
    setEditForm({
      selected_size: enq.selected_size || "1.0 kg",
      delivery_date: enq.delivery_date || "",
      admin_notes: enq.admin_notes || "",
      status: enq.status,
      flavour: enq.flavour || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnquiry) return;
    setIsSavingEdit(true);
    try {
      const updated = await updateEnquiryDetails(editingEnquiry.id, editForm);
      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === editingEnquiry.id ? { ...enq, ...editForm, status: editForm.status as any } : enq))
      );
      setFeedback(`Enquiry #${editingEnquiry.enquiry_number} details updated!`);
      setTimeout(() => setFeedback(null), 3000);
      setEditingEnquiry(null);
    } catch (err: any) {
      alert(err.message || "Failed to update enquiry details");
    } finally {
      setIsSavingEdit(false);
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

  const handleCopyRef = (refText: string, id: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
      case "contacted":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
      case "confirmed":
        return { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" };
      case "baking":
        return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
      case "ready":
        return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
      case "delivered":
      case "completed":
        return { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" };
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
      (e.enquiry_number && e.enquiry_number.toLowerCase().includes(q)) ||
      e.customer_name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      e.cake_name.toLowerCase().includes(q) ||
      (e.flavour && e.flavour.toLowerCase().includes(q)) ||
      (e.selected_size && e.selected_size.toLowerCase().includes(q))
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
          <span className="cake-category-badge">Customer Dialogue & Confection Lifecycle</span>
          <h1 style={{ fontSize: "1.45rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.1rem 0" }}>
            Orders & Enquiries Management ({enquiries.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Manage incoming orders by Enquiry Reference, update cake size/portions, schedule delivery dates, and advance preparation stages.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={loadEnquiries} className="btn-outline-gold icon-hover-rotate" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.35rem" }}>
            <RotateCw size={13} />
            <span>Refresh</span>
          </button>
          <Link href="/track" target="_blank" className="btn-outline-gold icon-hover-slide" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.3rem" }}>
            <span>Live Tracker</span>
            <ExternalLink size={13} />
          </Link>
          <Link href="/admin" className="btn-outline-gold icon-hover-slide" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.3rem" }}>
            <span>Dashboard</span>
            <ArrowUpRight size={13} />
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
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <CheckCircle2 size={15} />
          <span>{feedback}</span>
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
          {["all", "New", "Contacted", "Confirmed", "Baking", "Ready", "Delivered", "Cancelled"].map((st) => (
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
              id={`filter-pill-${st.toLowerCase()}`}
            >
              {st === "all" ? "All Orders" : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: "250px" }}>
          <input
            type="text"
            placeholder="Search by Enquiry # (e.g. LL-7492), name, phone, cake..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", width: "100%" }}
            id="admin-orders-search-input"
          />
        </div>
      </div>

      {/* Orders Table */}
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
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--bg-cream)",
              border: "1px solid var(--border-subtle)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.6rem",
              color: "var(--gold-dark)",
            }}
          >
            <ClipboardList size={24} />
          </div>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
            No orders or enquiries found
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            {searchQuery ? "No confections match your search term." : "When patrons enquire via WhatsApp, customer enquiries will appear here."}
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
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Enquiry Ref #</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Patron & Date</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Contact WhatsApp</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Confection</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Size / Portion</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Est. Delivery</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Preparation Status</th>
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
                      {/* Enquiry Ref Number with Copy & Track link */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 800,
                              color: "var(--gold-dark)",
                              background: "var(--bg-cream)",
                              border: "1px solid var(--gold-border)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "var(--radius-xs)",
                              fontSize: "0.82rem",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {enq.enquiry_number || `#${enq.id.slice(0, 8)}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRef(enq.enquiry_number || enq.id, enq.id)}
                            title="Copy reference"
                            style={{
                              background: "none",
                              border: "none",
                              color: copiedId === enq.id ? "#059669" : "var(--text-muted)",
                              cursor: "pointer",
                              padding: "2px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {copiedId === enq.id ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                          <Link
                            href={`/track?ref=${encodeURIComponent(enq.enquiry_number || enq.id)}`}
                            target="_blank"
                            title="Open Customer Tracker"
                            style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}
                            className="icon-hover-lift"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </td>

                      {/* Customer & Timestamp */}
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
                            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(enq.customer_name)}%2C%20this%20is%20Chef%20Tina%20from%20LUSH%20LAYERS%20regarding%20order%20${encodeURIComponent(enq.enquiry_number || "")}%20(${encodeURIComponent(enq.cake_name)}).`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--whatsapp)",
                              textDecoration: "none",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                            className="icon-hover-pulse"
                          >
                            <WhatsAppIcon size={14} />
                            <span>{enq.phone}</span>
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>{enq.phone}</span>
                        )}
                      </td>

                      {/* Cake & Flavour */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--gold-dark)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Cake size={13} color="var(--gold-dark)" />
                          <span>{enq.cake_name}</span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                          {enq.flavour || "Chef's Signature"}
                        </div>
                      </td>

                      {/* Size / Portion */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              padding: "0.15rem 0.55rem",
                              background: "var(--bg-cream)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-full)",
                              color: "var(--text-primary)",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {enq.selected_size || "1.0 kg"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(enq)}
                            title="Edit Portion Size"
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--gold-dark)",
                              cursor: "pointer",
                              padding: "2px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Estimated Delivery Date */}
                      <td style={{ padding: "0.65rem 0.85rem" }}>
                        {enq.delivery_date ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--text-primary)", fontWeight: 500, fontSize: "0.76rem" }}>
                            <Calendar size={12} color="var(--gold-dark)" />
                            <span>{enq.delivery_date}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(enq)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.74rem",
                              fontStyle: "italic",
                              textDecoration: "underline",
                            }}
                          >
                            + Set Date
                          </button>
                        )}
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
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            outline: "none",
                          }}
                          id={`status-select-${enq.id}`}
                        >
                          <option value="New">1. New Enquiry</option>
                          <option value="Contacted">2. Contacted</option>
                          <option value="Confirmed">3. Confirmed</option>
                          <option value="Baking">4. In Pastry Kitchen (Baking)</option>
                          <option value="Ready">5. Ready for Handover</option>
                          <option value="Delivered">6. Delivered / Celebrated</option>
                          <option value="Cancelled">✕ Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.65rem 0.85rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <button
                            onClick={() => handleOpenEditModal(enq)}
                            title="Edit Order Details & Kitchen Notes"
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--gold-dark)",
                              cursor: "pointer",
                              padding: "0.25rem",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            className="icon-hover-lift"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(enq.id)}
                            disabled={actionLoading === enq.id}
                            title="Delete enquiry"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              padding: "0.25rem",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            className="icon-hover-lift"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingEnquiry && (
        <div
          className="modal-overlay"
          onClick={() => setEditingEnquiry(null)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px" }}
          >
            <button
              className="modal-close-btn"
              onClick={() => setEditingEnquiry(null)}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: "1.25rem" }}>
              <span className="cake-category-badge">Admin Order Management</span>
              <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", margin: "0.3rem 0 0.15rem", fontWeight: 700 }}>
                Edit Order #{editingEnquiry.enquiry_number}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Update portion size, schedule delivery dates, and post kitchen notes visible on the live tracker.
              </p>
            </div>

            <form onSubmit={handleSaveEdit}>
              {/* Portion / Size */}
              <div className="form-group" style={{ marginBottom: "0.85rem" }}>
                <label className="form-label">Order Portion / Size (koto size order):</label>
                <input
                  type="text"
                  value={editForm.selected_size}
                  onChange={(e) => setEditForm({ ...editForm, selected_size: e.target.value })}
                  placeholder="e.g. 1.0 kg, 2.0 kg, 2 Tier Petite, 3 Tier Grand..."
                  className="form-input"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.84rem" }}
                  required
                />
              </div>

              {/* Delivery Date */}
              <div className="form-group" style={{ marginBottom: "0.85rem" }}>
                <label className="form-label">Estimated Delivery / Celebration Date:</label>
                <input
                  type="text"
                  value={editForm.delivery_date}
                  onChange={(e) => setEditForm({ ...editForm, delivery_date: e.target.value })}
                  placeholder="e.g. 2026-09-18, Next Saturday 5 PM..."
                  className="form-input"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.84rem" }}
                />
              </div>

              {/* Status */}
              <div className="form-group" style={{ marginBottom: "0.85rem" }}>
                <label className="form-label">Order Preparation Stage:</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="form-input"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.84rem", fontWeight: 600 }}
                >
                  <option value="New">1. New Enquiry</option>
                  <option value="Contacted">2. Artisanal Dialogue (Contacted)</option>
                  <option value="Confirmed">3. Order Confirmed</option>
                  <option value="Baking">4. In Pastry Kitchen (Baking & Artistry)</option>
                  <option value="Ready">5. Confection Ready for Handover</option>
                  <option value="Delivered">6. Delivered / Celebrated</option>
                  <option value="Cancelled">✕ Cancelled</option>
                </select>
              </div>

              {/* Kitchen / Atelier Notes */}
              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Atelier Notes for Customer (shown on tracker):</label>
                <textarea
                  rows={2}
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                  placeholder="e.g. Belgian chocolate sponge baked. Sugar florals currently hand-sculpted."
                  className="form-textarea"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.84rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingEnquiry(null)}
                  className="btn-outline-gold"
                  style={{ flex: 1, padding: "0.55rem 1rem", fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="btn-gold"
                  style={{ flex: 1.5, padding: "0.55rem 1rem", fontSize: "0.82rem", justifyContent: "center" }}
                >
                  {isSavingEdit ? "Saving..." : "Save Order Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
