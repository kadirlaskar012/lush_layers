"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCakes, publishCake, rejectCake } from "../../../../lib/api";
import { Cake } from "../../../../lib/types";

export default function ApprovedCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadApproved = async () => {
    try {
      const data = await getAdminCakes("approved");
      setCakes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproved();
  }, []);

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      await publishCake(id);
      loadApproved();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header - Compact */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <span className="cake-category-badge">Approved Staging</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Approved Cakes Ready for Publishing ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            These confections have passed human review and can be published live with one click.
          </p>
        </div>
        <Link href="/admin/cakes/pending" className="btn-outline-gold" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
          View Pending Queue
        </Link>
      </div>

      {cakes.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--gold-border)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>
            No approved cakes staged. Approved confections will appear here before being published live.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {cakes.map((cake) => (
            <div
              key={cake.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-xs)",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  border: "1px solid var(--border-light)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cake.image_url}
                  alt={cake.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.2rem" }}>
                {cake.name}
              </h4>
              <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.75rem" }}>
                {cake.flavour}
              </p>

              <button
                onClick={() => handlePublish(cake.id)}
                disabled={actionLoading === cake.id}
                className="btn-gold"
                style={{ width: "100%", padding: "0.45rem", fontSize: "0.8rem", justifyContent: "center" }}
              >
                🚀 Publish Live to Storefront
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
