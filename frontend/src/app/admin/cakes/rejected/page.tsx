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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <span className="cake-category-badge">Rejected Archive</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Rejected Cakes Archive ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Cakes that were rejected during admin moderation. You can restore them to approved status or delete them.
          </p>
        </div>
      </div>

      {cakes.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-gold)" }}>
          No rejected cakes in archive.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {cakes.map((cake) => (
            <div key={cake.id} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ background: "#FFFFFF", borderRadius: "8px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cake.image_url} alt="" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.2rem" }}>{cake.name}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "1rem" }}>{cake.flavour}</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleRestore(cake.id)} className="btn-outline-gold" style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}>
                  Restore
                </button>
                <button onClick={() => handleDelete(cake.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #EF4444", color: "#F87171", borderRadius: "var(--radius-full)", padding: "0.5rem 1rem", fontSize: "0.8rem", cursor: "pointer" }}>
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
