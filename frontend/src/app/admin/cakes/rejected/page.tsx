"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCakes, approveCake, deleteCake } from "../../../../lib/api";
import { Cake } from "../../../../lib/types";

export default function RejectedCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRejected = async () => {
    try {
      const data = await getAdminCakes("rejected");
      setCakes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRejected();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await approveCake(id);
      loadRejected();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this rejected cake?")) return;
    try {
      await deleteCake(id);
      loadRejected();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <span className="cake-category-badge">Rejected Archive</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Rejected Cakes Archive ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Confections archived during moderation. Restore to approved status or delete permanently.
          </p>
        </div>
      </div>

      {cakes.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-subtle)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>
            No cakes in rejected archive.
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

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={() => handleRestore(cake.id)}
                  className="btn-outline-gold"
                  style={{ flex: 1, padding: "0.4rem", fontSize: "0.78rem", justifyContent: "center" }}
                >
                  Restore to Staging
                </button>
                <button
                  onClick={() => handleDelete(cake.id)}
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    borderRadius: "var(--radius-full)",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
