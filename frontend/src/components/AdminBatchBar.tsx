"use client";

import React, { useState } from "react";
import { Check, CheckSquare, Trash2, X, RefreshCw, Layers } from "lucide-react";

export interface BatchActionItem {
  label: string;
  icon?: React.ReactNode;
  variant?: "gold" | "outline" | "danger" | "neutral";
  onClick: () => Promise<void> | void;
}

export interface QuickActionItem {
  label: string;
  value: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | string;
}

export interface AdminBatchBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAllSelected?: boolean;
  statusOptions?: Array<{ label: string; value: string }>;
  onApplyStatus?: (status: string) => Promise<void> | void;
  onStatusChange?: (status: string) => Promise<void> | void;
  quickActions?: QuickActionItem[];
  onDelete?: () => Promise<void> | void;
  customActions?: BatchActionItem[];
  isLoading?: boolean;
  itemLabel?: string; // e.g. "cakes", "orders", "reviews"
}

export default function AdminBatchBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  isAllSelected: explicitIsAllSelected,
  statusOptions,
  onApplyStatus,
  onStatusChange,
  quickActions,
  onDelete,
  customActions,
  isLoading = false,
  itemLabel = "items",
}: AdminBatchBarProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const isAllSelected = explicitIsAllSelected ?? (totalCount > 0 && selectedCount === totalCount);
  const handleStatusCallback = onStatusChange || onApplyStatus;

  if (selectedCount === 0) return null;

  const handleApplyStatus = async () => {
    if (!selectedStatus || !handleStatusCallback) return;
    await handleStatusCallback(selectedStatus);
    setSelectedStatus("");
  };

  const handleQuickStatus = async (val: string) => {
    if (!handleStatusCallback) return;
    await handleStatusCallback(val);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete ${selectedCount} selected ${itemLabel}? This action cannot be undone.`
      )
    ) {
      return;
    }
    await onDelete();
  };

  return (
    <div
      id="admin-batch-action-bar"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 32px)",
        maxWidth: "920px",
        background: "rgba(24, 28, 22, 0.95)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(191, 154, 62, 0.45)",
        borderRadius: "var(--radius-lg, 16px)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        padding: "0.65rem 1rem",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.6rem 0.85rem",
        animation: "slideUpBatchBar 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes slideUpBatchBar {
          from {
            opacity: 0;
            transform: translate(-50%, 18px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Left: Count Badge & Select/Clear Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #C89B3C 0%, #8F6418 100%)",
            color: "#FFFFFF",
            fontSize: "0.78rem",
            fontWeight: 700,
            padding: "0.22rem 0.65rem",
            borderRadius: "var(--radius-full, 9999px)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          <CheckSquare size={13} />
          <span>
            {selectedCount} {selectedCount === 1 ? itemLabel.replace(/s$/, "") : itemLabel} selected
          </span>
        </div>

        <button
          type="button"
          onClick={isAllSelected ? onDeselectAll : onSelectAll}
          disabled={isLoading}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#EAEAEA",
            padding: "0.25rem 0.65rem",
            borderRadius: "var(--radius-sm, 6px)",
            fontSize: "0.74rem",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
        >
          {isAllSelected ? "Deselect All" : `Select All (${totalCount})`}
        </button>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
        {/* Quick Actions Buttons */}
        {quickActions && quickActions.length > 0 && handleStatusCallback && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
            {quickActions.map((qa) => {
              const isPrimary = qa.variant === "primary";
              const isSecondary = qa.variant === "secondary";
              const isDanger = qa.variant === "danger";

              return (
                <button
                  key={qa.value}
                  type="button"
                  onClick={() => handleQuickStatus(qa.value)}
                  disabled={isLoading}
                  style={{
                    background: isPrimary
                      ? "linear-gradient(135deg, #C89B3C 0%, #8F6418 100%)"
                      : isSecondary
                      ? "rgba(197, 160, 89, 0.25)"
                      : isDanger
                      ? "rgba(239, 68, 68, 0.25)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: isPrimary
                      ? "1px solid rgba(191, 154, 62, 0.7)"
                      : isSecondary
                      ? "1px solid rgba(191, 154, 62, 0.4)"
                      : isDanger
                      ? "1px solid rgba(239, 68, 68, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                    color: isDanger ? "#FCA5A5" : "#FFFFFF",
                    padding: "0.32rem 0.65rem",
                    borderRadius: "var(--radius-sm, 6px)",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Check size={11} />
                  <span>{qa.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Status Dropdown */}
        {statusOptions && statusOptions.length > 0 && handleStatusCallback && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isLoading}
              style={{
                background: "rgba(0, 0, 0, 0.45)",
                border: "1px solid rgba(191, 154, 62, 0.4)",
                color: "#FFFFFF",
                fontSize: "0.76rem",
                padding: "0.32rem 0.55rem",
                borderRadius: "var(--radius-sm, 6px)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="" style={{ background: "#222", color: "#BBB" }}>
                Change Status to...
              </option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: "#222", color: "#FFF" }}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleApplyStatus}
              disabled={!selectedStatus || isLoading}
              style={{
                background: selectedStatus ? "var(--gold, #B88E3E)" : "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: selectedStatus ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
                padding: "0.32rem 0.7rem",
                borderRadius: "var(--radius-sm, 6px)",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: selectedStatus ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
              <span>Apply</span>
            </button>
          </div>
        )}

        {/* Custom Actions */}
        {customActions &&
          customActions.map((act, i) => (
            <button
              key={i}
              type="button"
              onClick={act.onClick}
              disabled={isLoading}
              style={{
                background:
                  act.variant === "gold"
                    ? "linear-gradient(135deg, #B88E3E 0%, #8F6418 100%)"
                    : act.variant === "danger"
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                border:
                  act.variant === "gold"
                    ? "1px solid rgba(191, 154, 62, 0.6)"
                    : act.variant === "danger"
                    ? "1px solid rgba(239, 68, 68, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.15)",
                color: act.variant === "danger" ? "#FCA5A5" : "#FFFFFF",
                padding: "0.32rem 0.7rem",
                borderRadius: "var(--radius-sm, 6px)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {act.icon}
              <span>{act.label}</span>
            </button>
          ))}

        {/* Delete Action */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            style={{
              background: "#7F1D1D",
              border: "1px solid #991B1B",
              color: "#FEE2E2",
              padding: "0.32rem 0.75rem",
              borderRadius: "var(--radius-sm, 6px)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
            title={`Delete ${selectedCount} selected items`}
          >
            <Trash2 size={12} />
            <span>Delete ({selectedCount})</span>
          </button>
        )}

        {/* Clear All Button */}
        <button
          type="button"
          onClick={onDeselectAll}
          disabled={isLoading}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            padding: "0.3rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Clear selection"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
