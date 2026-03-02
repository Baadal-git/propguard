"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PropFirm, PropFirmRules } from "@/types";

interface Props {
  initialFirms: PropFirm[];
}

const EMPTY_RULES: PropFirmRules = {
  trailingType:    "EOD",
  maxDrawdown:     2000,
  dailyLossLimit:  1000,
  payoutThreshold: 1000,
  minTradingDays:  5,
  consistencyRule: null,
  scalingModel:    null,
};

function emptyFirm(): Partial<PropFirm> & { rules: PropFirmRules } {
  return { name: "", is_active: true, rules: { ...EMPTY_RULES } };
}

// ── Toast ──────────────────────────────────────────────────────────
type ToastKind = "success" | "error";
interface Toast { id: number; message: string; kind: ToastKind }

let toastSeq = 0;

function ToastList({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium border shadow-xl ${
            t.kind === "success"
              ? "bg-emerald-950/90 border-emerald-500/25 text-emerald-300"
              : "bg-red-950/90 border-red-500/25 text-red-300"
          }`}
          style={{ backdropFilter: "blur(12px)" }}
        >
          <span>{t.kind === "success" ? "✓" : "✕"}</span>
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-40 hover:opacity-70 text-sm leading-none">×</button>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────
function DeleteModal({
  firm,
  onCancel,
  onConfirm,
  loading,
}: {
  firm: PropFirm;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className="fixed z-50 w-full max-w-sm rounded-2xl px-7 py-7 flex flex-col gap-5"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(160deg, #120a0a 0%, #0d0909 100%)",
          border: "1px solid rgba(220,38,38,0.22)",
          boxShadow: "0 0 40px rgba(220,38,38,0.07), 0 24px 60px rgba(0,0,0,0.7)",
        }}
      >
        <p className="text-white text-sm font-semibold tracking-tight">Delete Prop Firm?</p>
        <div className="h-px bg-red-500/[0.12]" />
        <div className="flex flex-col gap-2">
          <p className="text-white/60 text-xs leading-relaxed">
            You are about to archive{" "}
            <span className="text-white font-semibold">{firm.name}</span>.
            This action cannot be undone.
          </p>
          <p className="text-white/35 text-xs leading-relaxed">
            Firms with linked accounts cannot be deleted. Archived firms are
            hidden from account creation but existing accounts remain unaffected.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 text-xs font-medium py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-xs font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
            style={{
              background: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "rgba(248,113,113,0.9)",
            }}
          >
            {loading ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function FirmsTable({ initialFirms }: Props) {
  const supabase = createClient();

  const [firms, setFirms]             = useState<PropFirm[]>(initialFirms);
  const [editing, setEditing]         = useState<(Partial<PropFirm> & { rules: PropFirmRules }) | null>(null);
  const [isNew, setIsNew]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropFirm | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [toasts, setToasts]           = useState<Toast[]>([]);

  // ── Toast helpers ────────────────────────────────────────────────
  function addToast(message: string, kind: ToastKind) {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => removeToast(id), 4000);
  }
  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Styles ───────────────────────────────────────────────────────
  const inputCls  = "w-full bg-[#111] border border-white/[0.08] text-white placeholder-white/20 rounded-lg px-3 py-2 text-xs outline-none focus:border-white/25 transition-colors";
  const labelCls  = "text-[10px] uppercase tracking-[0.15em] text-white/30 block mb-1";
  const cardStyle = { background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" };

  // ── Edit / add helpers ───────────────────────────────────────────
  function openNew() { setIsNew(true); setEditing(emptyFirm()); setFormError(""); }
  function openEdit(firm: PropFirm) { setIsNew(false); setEditing({ ...firm, rules: { ...firm.rules } }); setFormError(""); }
  function cancel() { setEditing(null); setFormError(""); }
  function setField(field: keyof PropFirm, value: unknown) {
    setEditing((prev) => prev ? { ...prev, [field]: value } : prev);
  }
  function setRule(key: keyof PropFirmRules, value: unknown) {
    setEditing((prev) => prev ? { ...prev, rules: { ...prev.rules, [key]: value } } : prev);
  }

  async function toggleActive(firm: PropFirm) {
    const { error: err } = await supabase
      .from("prop_firms")
      .update({ is_active: !firm.is_active, updated_at: new Date().toISOString() })
      .eq("id", firm.id);
    if (!err) setFirms((prev) => prev.map((f) => f.id === firm.id ? { ...f, is_active: !firm.is_active } : f));
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setFormError("");

    const { name, is_active, rules } = editing;

    if (!name?.trim()) { setFormError("Firm name is required."); setSaving(false); return; }
    if (!rules.maxDrawdown || rules.maxDrawdown <= 0) { setFormError("Max drawdown must be greater than 0."); setSaving(false); return; }
    if (!rules.payoutThreshold || rules.payoutThreshold <= 0) { setFormError("Payout threshold must be greater than 0."); setSaving(false); return; }

    const payload = { name: name.trim(), is_active: is_active ?? true, rules, updated_at: new Date().toISOString() };

    if (isNew) {
      const { data, error: err } = await supabase.from("prop_firms").insert(payload).select("*").single();
      if (err) { setFormError(err.message); setSaving(false); return; }
      setFirms((prev) => [...prev, data as PropFirm]);
    } else {
      const { data, error: err } = await supabase.from("prop_firms").update(payload).eq("id", editing.id!).select("*").single();
      if (err) { setFormError(err.message); setSaving(false); return; }
      setFirms((prev) => prev.map((f) => f.id === editing.id ? data as PropFirm : f));
    }

    setSaving(false);
    setEditing(null);
  }

  // ── Delete flow ──────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    // 1. Check for linked accounts
    const { count, error: countErr } = await supabase
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .eq("prop_firm_id", deleteTarget.id);

    if (countErr) {
      addToast("Error checking linked accounts.", "error");
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }

    if ((count ?? 0) > 0) {
      addToast("Firm cannot be deleted because accounts are linked to it.", "error");
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }

    // 2. Soft delete — set is_archived = true
    const { error: archiveErr } = await supabase
      .from("prop_firms")
      .update({ is_archived: true, is_active: false, updated_at: new Date().toISOString() })
      .eq("id", deleteTarget.id);

    if (archiveErr) {
      addToast("Failed to delete firm. Please try again.", "error");
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }

    // 3. Remove from local table immediately
    setFirms((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    addToast("Prop Firm deleted successfully.", "success");
    setDeleting(false);
    setDeleteTarget(null);
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <ToastList toasts={toasts} remove={removeToast} />

      {deleteTarget && (
        <DeleteModal
          firm={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}

      <div className="flex flex-col gap-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-base font-semibold tracking-tight">Prop Firms</h1>
            <p className="text-white/25 text-xs mt-1">{firms.length} firm{firms.length !== 1 ? "s" : ""} configured</p>
          </div>
          <button
            onClick={openNew}
            className="border border-white/[0.1] text-white/50 hover:text-white hover:border-white/25 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Firm
          </button>
        </div>

        {/* Table */}
        <div className="border border-white/[0.11] rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_80px_100px] gap-3 px-5 py-3 border-b border-white/[0.06]">
            {["Firm", "Trailing", "Max DD", "Daily Limit", "Payout", "Min Days", "Consistency", "Status", ""].map((h) => (
              <p key={h} className="text-[9px] uppercase tracking-[0.18em] text-white/25 font-medium">{h}</p>
            ))}
          </div>

          {firms.length === 0 && (
            <p className="text-white/20 text-xs text-center py-10">No firms yet. Add your first firm.</p>
          )}

          {firms.map((firm, i) => (
            <div
              key={firm.id}
              className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_80px_100px] gap-3 px-5 py-3.5 items-center ${i < firms.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <p className="text-white text-xs font-medium truncate">{firm.name}</p>
              <p className="text-white/50 text-xs tabular-nums">{firm.rules.trailingType}</p>
              <p className="text-white/50 text-xs tabular-nums">${firm.rules.maxDrawdown.toLocaleString()}</p>
              <p className="text-white/50 text-xs tabular-nums">${firm.rules.dailyLossLimit.toLocaleString()}</p>
              <p className="text-amber-400/80 text-xs tabular-nums">${firm.rules.payoutThreshold.toLocaleString()}</p>
              <p className="text-white/50 text-xs tabular-nums">{firm.rules.minTradingDays}d</p>
              <p className="text-white/50 text-xs tabular-nums">
                {firm.rules.consistencyRule !== null ? `${firm.rules.consistencyRule}%` : "—"}
              </p>
              <button
                onClick={() => toggleActive(firm)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                  firm.is_active
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
                    : "bg-white/[0.03] text-white/25 border-white/[0.08] hover:bg-white/[0.06]"
                }`}
              >
                {firm.is_active ? "Active" : "Inactive"}
              </button>
              {/* Actions */}
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(firm)} className="text-xs text-white/30 hover:text-white/70 transition-colors font-medium">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(firm)} className="text-xs text-red-400/30 hover:text-red-400/70 transition-colors font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit form */}
        {editing && (
          <div className="border border-white/[0.13] rounded-2xl px-6 py-6 flex flex-col gap-5" style={{ background: "linear-gradient(160deg, #111111 0%, #0a0a0a 100%)" }}>

            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-semibold">{isNew ? "Add New Firm" : `Edit — ${editing.name}`}</p>
              <button onClick={cancel} className="text-white/25 hover:text-white/60 text-lg leading-none transition-colors">×</button>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className={labelCls}>Firm Name</label>
                <input type="text" placeholder="e.g. Apex Trader Funding" value={editing.name ?? ""} onChange={(e) => setField("name", e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Trailing Type</label>
                <select value={editing.rules.trailingType} onChange={(e) => setRule("trailingType", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                  <option value="EOD">EOD (End of Day)</option>
                  <option value="INTRADAY">Intraday</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Max Drawdown ($)</label>
                <input type="number" min={0} placeholder="e.g. 3000" value={editing.rules.maxDrawdown} onChange={(e) => setRule("maxDrawdown", Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Daily Loss Limit ($)</label>
                <input type="number" min={0} placeholder="e.g. 1000" value={editing.rules.dailyLossLimit} onChange={(e) => setRule("dailyLossLimit", Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Payout Threshold ($)</label>
                <input type="number" min={0} placeholder="e.g. 1000" value={editing.rules.payoutThreshold} onChange={(e) => setRule("payoutThreshold", Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Min Trading Days</label>
                <input type="number" min={0} placeholder="e.g. 5" value={editing.rules.minTradingDays} onChange={(e) => setRule("minTradingDays", Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Consistency Rule (% — optional)</label>
                <input type="number" min={0} max={100} placeholder="e.g. 30 or leave blank" value={editing.rules.consistencyRule ?? ""} onChange={(e) => setRule("consistencyRule", e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Scaling Model (optional)</label>
                <input type="text" placeholder="e.g. standard or leave blank" value={editing.rules.scalingModel ?? ""} onChange={(e) => setRule("scalingModel", e.target.value === "" ? null : e.target.value)} className={inputCls} />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setField("is_active", e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-white/[0.08] peer-checked:bg-emerald-500/30 rounded-full border border-white/[0.1] peer-checked:border-emerald-500/30 transition-colors relative">
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${editing.is_active ? "translate-x-4 bg-emerald-400" : "bg-white/20"}`} />
                  </div>
                </label>
                <span className="text-xs text-white/40 font-medium">
                  {editing.is_active ? "Active — visible in account creation" : "Inactive — hidden from users"}
                </span>
              </div>

            </div>

            {formError && <p className="text-red-400 text-xs">{formError}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={cancel} className="border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 text-xs font-medium px-5 py-2.5 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="bg-white text-black text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors">
                {saving ? "Saving…" : isNew ? "Create Firm" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
