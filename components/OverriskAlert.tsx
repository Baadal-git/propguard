"use client";

import { useEffect, useState } from "react";
import { createPortal }        from "react-dom";

interface Props {
  lossAmount:   number;
  moderateRisk: number;
  onClose:      () => void;
}

export default function OverriskAlert({ lossAmount, moderateRisk, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mount portal target + lock body scroll
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";

    // Animate in next frame so transition fires
    const raf = requestAnimationFrame(() => setVisible(true));

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  const exceededPct = moderateRisk > 0
    ? Math.round(((lossAmount - moderateRisk) / moderateRisk) * 100)
    : 0;

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          9998,
          background:      "rgba(0,0,0,0.82)",
          backdropFilter:  "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity:         visible ? 1 : 0,
          transition:      "opacity 0.3s ease",
        }}
      />

      {/* ── Modal ─────────────────────────────────────────────── */}
      <div
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          transform:       visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.95)",
          zIndex:          9999,
          width:           "100%",
          maxWidth:        "420px",
          padding:         "0 16px",
          opacity:         visible ? 1 : 0,
          transition:      "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <div
          style={{
            background:   "linear-gradient(160deg, #120a0a 0%, #0d0909 100%)",
            border:       "1px solid rgba(220,38,38,0.22)",
            borderRadius: "16px",
            boxShadow:    "0 0 40px rgba(220,38,38,0.08), 0 24px 60px rgba(0,0,0,0.7)",
            padding:      "28px",
            display:      "flex",
            flexDirection: "column",
            gap:          "20px",
          }}
        >
          {/* Title */}
          <p style={{ color: "rgba(248,113,113,0.95)", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            ⚠ You Are Overrisking
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(220,38,38,0.12)" }} />

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", lineHeight: "1.7" }}>
              You recorded a loss of{" "}
              <span style={{ color: "rgba(248,113,113,0.95)", fontWeight: 600 }}>
                ${lossAmount.toLocaleString()}
              </span>
              . Your recommended moderate risk is{" "}
              <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                ${moderateRisk.toLocaleString()}
              </span>
              . You exceeded structured risk by{" "}
              <span style={{ color: "rgba(248,113,113,0.95)", fontWeight: 600 }}>
                {exceededPct}%
              </span>
              .
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", lineHeight: "1.7" }}>
              At this pace, your survival window compresses rapidly.
              Slower progression increases payout probability.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                width:        "100%",
                background:   "rgba(220,38,38,0.15)",
                border:       "1px solid rgba(220,38,38,0.3)",
                borderRadius: "8px",
                color:        "rgba(248,113,113,0.9)",
                fontSize:     "12px",
                fontWeight:   600,
                padding:      "10px 0",
                cursor:       "pointer",
                transition:   "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(220,38,38,0.15)")}
            >
              Reduce Risk Next Trade
            </button>
            <button
              onClick={onClose}
              style={{
                width:        "100%",
                background:   "transparent",
                border:       "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color:        "rgba(255,255,255,0.4)",
                fontSize:     "12px",
                fontWeight:   500,
                padding:      "10px 0",
                cursor:       "pointer",
                transition:   "color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
