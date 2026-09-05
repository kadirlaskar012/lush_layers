"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getProcessingJobs, retryProcessingJob } from "../../../lib/api";
import { ProcessingJob } from "../../../lib/types";
import { Clock, Zap } from "lucide-react";

export default function BulkUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchJobs = async () => {
    try {
      const data = await getProcessingJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const allowed = Array.from(files).filter((f) =>
      /\.(jpg|jpeg|png|webp|avif|heic)$/i.test(f.name)
    );
    setSelectedFiles(allowed);
    setUploadMessage(`${allowed.length} image(s) selected and ready for queue.`);
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadMessage("Uploading to parallel background queue...");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const resp = await fetch(`${backendUrl}/api/upload/bulk`, {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Bulk upload failed");
      }
      const res = await resp.json();
      setUploadMessage(`Success! Queued ${res.total_queued} images for processing.`);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchJobs();
    } catch (err: any) {
      setUploadMessage(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    const ok = await retryProcessingJob(jobId);
    if (ok) {
      fetchJobs();
    } else {
      alert("Could not retry job. Please check backend.");
    }
  };

  // Job counts
  const totalJobs = jobs.length;
  const processingCount = jobs.filter(
    (j) => j.status === "queued" || j.status === "processing" || j.status === "image_processed" || j.status === "ai_processing" || j.status === "uploading"
  ).length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  return (
    <div id="bulk-upload-view">
      {/* Top Header - Compact */}
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
          <span className="cake-category-badge">Parallel Engine</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Bulk Confection Ingestion & Queue
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/cakes/pending" className="btn-gold icon-hover-lift" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Clock size={14} />
            <span>Review Pending ({completedCount})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row - Compact */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <div className="admin-stat-card">
          <div className="admin-stat-val">{totalJobs}</div>
          <div className="admin-stat-lbl">Total Uploads</div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: "3px solid #F59E0B" }}>
          <div className="admin-stat-val" style={{ color: "#D97706" }}>{processingCount}</div>
          <div className="admin-stat-lbl">In Processing</div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: "3px solid #10B981" }}>
          <div className="admin-stat-val" style={{ color: "#059669" }}>{completedCount}</div>
          <div className="admin-stat-lbl">Completed</div>
        </div>
        <div className="admin-stat-card" style={{ borderTop: "3px solid #EF4444" }}>
          <div className="admin-stat-val" style={{ color: "#DC2626" }}>{failedCount}</div>
          <div className="admin-stat-lbl">Failed</div>
        </div>
      </div>

      {/* Compact Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: isDragOver ? "var(--bg-cream)" : "var(--bg-surface)",
          border: `2px dashed ${isDragOver ? "var(--gold)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-md)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "1.25rem",
          transition: "all 0.2s",
          boxShadow: "var(--shadow-xs)",
        }}
        id="bulk-upload-dropzone"
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
          id="file-upload-input"
        />

        <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>📤</div>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.25rem", fontWeight: 600 }}>
          Drag & Drop 20+ Cake Images Here
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
          Supports JPG, PNG, WEBP, AVIF. Automatic rembg background removal & studio white compositing.
        </p>
        <button
          type="button"
          className="btn-outline-gold"
          style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
        >
          Select Images from Disk
        </button>
      </div>

      {/* Selected Files & Start Upload Action */}
      {selectedFiles.length > 0 && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div>
            <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
              {selectedFiles.length} files staged for upload
            </strong>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
              Total payload: {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setSelectedFiles([])}
              style={{
                background: "var(--bg-cream)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                padding: "0.4rem 0.8rem",
                fontSize: "0.78rem",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              Clear
            </button>
            <button
              onClick={handleStartUpload}
              disabled={isUploading}
              className="btn-gold icon-hover-lift"
              style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              id="start-bulk-upload-btn"
            >
              {isUploading ? "Queueing..." : (
                <>
                  <Zap size={14} />
                  <span>Start Parallel Processing</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {uploadMessage && (
        <div
          style={{
            padding: "0.6rem 0.95rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1.25rem",
            background: uploadMessage.startsWith("Error") ? "#FEE2E2" : "#D1FAE5",
            border: `1px solid ${uploadMessage.startsWith("Error") ? "#FECACA" : "#A7F3D0"}`,
            color: uploadMessage.startsWith("Error") ? "#991B1B" : "#065F46",
            fontSize: "0.82rem",
            fontWeight: 500,
          }}
        >
          {uploadMessage}
        </div>
      )}

      {/* Real-Time Processing Jobs Queue */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: 600 }}>
            Live Background Processing Stream
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Worker Semaphore: 3 Parallel Tasks
          </span>
        </div>

        {jobs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", padding: "1.5rem 0", textAlign: "center" }}>
            No jobs in queue. Drag & drop images above to start.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "var(--bg-main)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.65rem 0.85rem",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {job.file_name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                      ({job.original_size_bytes ? `${Math.round(job.original_size_bytes / 1024)} KB` : ""})
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "var(--radius-full)",
                        background:
                          job.status === "completed"
                            ? "#D1FAE5"
                            : job.status === "failed"
                            ? "#FEE2E2"
                            : "#FEF3C7",
                        color:
                          job.status === "completed"
                            ? "#065F46"
                            : job.status === "failed"
                            ? "#991B1B"
                            : "#92400E",
                      }}
                    >
                      {job.status} ({job.progress}%)
                    </span>

                    {job.status === "failed" && (
                      <button
                        onClick={() => handleRetry(job.id)}
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-xs)",
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.45rem",
                          cursor: "pointer",
                          color: "var(--gold-dark)",
                          fontWeight: 600,
                        }}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "5px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${job.progress}%`,
                      height: "100%",
                      background:
                        job.status === "completed"
                          ? "#10B981"
                          : job.status === "failed"
                          ? "#EF4444"
                          : "var(--gold)",
                      transition: "width 0.25s ease",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
