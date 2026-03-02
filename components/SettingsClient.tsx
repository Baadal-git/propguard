"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId:          string;
  email:           string;
  initialName:     string;
  initialRiskMode: string;
  role:            string;
}

// ── Toast ─────────────────────────────────────────────────────────
type ToastKind = "success" | "error";
interface Toast { id: number; message: string; kind: ToastKind }
let seq = 0;

function ToastList({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  if (!toasts.length) return null;
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

export default function SettingsClient({ userId, email, initialName, initialRiskMode, role }: Props) {
  const supabase = createClient();

  // ── Profile state ────────────────────────────────────────────────
  const [name, setName]             = useState(initialName);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password state ───────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError]     = useState("");
  const [savingPwd, setSavingPwd]   = useState(false);

  // ── Preferences state ────────────────────────────────────────────
  const [riskMode, setRiskMode]         = useState(initialRiskMode);
  const [savingPrefs, setSavingPrefs]   = useState(false);

  // ── Toasts ───────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  function addToast(message: string, kind: ToastKind) {
    const id = ++seq;
    setToasts((p) => [...p, { id, message, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }
  function removeToast(id: number) { setToasts((p) => p.filter((t) => t.id !== id)); }

  // ── Shared styles ─────────────────────────────────────────────────
  const cardCls   = "relative border border-white/[0.11] rounded-2xl px-6 py-6 flex flex-col gap-5 shadow-[0_8px_28px_rgba(0,0,0,0.4)] hover:border-white/[0.18] transition-all duration-300";
  const cardStyle = { background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" };
  const inputCls  = "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const labelCls  = "text-[10px] uppercase tracking-[0.18em] text-white/25 font-medium block mb-1.5";
  const sectionLabelCls = "text-[10px] font-medium uppercase tracking-[0.2em] text-white/25";
  const dividerCls = "h-px bg-white/[0.05]";
  const btnPrimary = "bg-white text-black font-medium py-2.5 px-5 rounded-lg text-sm hover:bg-white/90 disabled:opacity-50 transition-colors";

  // ── Save profile ─────────────────────────────────────────────────
  async function saveProfile() {
    setSavingProfile(true);
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ user_id: userId, full_name: name.trim(), updated_at: new Date().toISOString() });
    setSavingProfile(false);
    if (error) { addToast("Failed to update profile.", "error"); return; }
    addToast("Profile updated successfully.", "success");
  }

  // ── Change password ──────────────────────────────────────────────
  async function changePassword() {
    setPwdError("");
    if (newPwd.length < 8) { setPwdError("New password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords do not match."); return; }

    setSavingPwd(true);
    // Re-authenticate with current password first to validate it
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPwd });
    if (signInErr) { setPwdError("Current password is incorrect."); setSavingPwd(false); return; }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (updateErr) { addToast("Failed to update password. Please try again.", "error"); return; }

    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    addToast("Password changed successfully.", "success");
  }

  // ── Save preferences ─────────────────────────────────────────────
  async function savePreferences() {
    setSavingPrefs(true);
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ user_id: userId, default_risk_mode: riskMode, updated_at: new Date().toISOString() });
    setSavingPrefs(false);
    if (error) { addToast("Failed to save preferences.", "error"); return; }
    addToast("Preferences saved.", "success");
  }

  return (
    <>
      <ToastList toasts={toasts} remove={removeToast} />

      <div className="flex flex-col gap-5">

        {/* ── Profile Card ── */}
        <div className={cardCls} style={cardStyle}>
          <p className={sectionLabelCls}>Profile</p>
          <div className={dividerCls} />

          <div className="grid grid-cols-1 gap-4">

            {/* Full Name */}
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Email — read only */}
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className={inputCls}
              />
              <p className="text-xs font-medium tracking-wide text-white/25 mt-1.5 leading-relaxed">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Role badge */}
            <div>
              <label className={labelCls}>Account Role</label>
              <div className="flex items-center gap-3 mt-0.5">
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                  role === "ADMIN"
                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                    : "bg-white/[0.05] text-white/40 border-white/[0.08]"
                }`}>
                  {role}
                </span>
                <p className="text-white/25 text-xs font-medium tracking-wide">
                  {role === "ADMIN" ? "Full admin access" : "Standard account access"}
                </p>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-1">
            <button onClick={saveProfile} disabled={savingProfile} className={btnPrimary}>
              {savingProfile ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>

        {/* ── Security Card ── */}
        <div className={cardCls} style={cardStyle}>
          <p className={sectionLabelCls}>Security</p>
          <div className={dividerCls} />

          <div className="flex flex-col gap-4">

            <div>
              <label className={labelCls}>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </div>

            {pwdError && (
              <p className="text-red-400 text-xs font-medium">{pwdError}</p>
            )}

          </div>

          <div className="flex justify-end pt-1">
            <button onClick={changePassword} disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd} className={btnPrimary}>
              {savingPwd ? "Updating…" : "Change Password"}
            </button>
          </div>
        </div>

        {/* ── Preferences Card ── */}
        <div className={cardCls} style={cardStyle}>
          <div className="flex items-start justify-between">
            <div>
              <p className={sectionLabelCls}>Preferences</p>
              <p className="text-xs font-medium tracking-wide text-white/25 mt-1.5 leading-relaxed">
                Default behaviour settings for your trading interface.
              </p>
            </div>
          </div>

          <div className={dividerCls} />

          <div>
            <label className={labelCls}>Default Risk Mode</label>
            <select
              value={riskMode}
              onChange={(e) => setRiskMode(e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer`}
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
            </select>
            <p className="text-xs font-medium tracking-wide text-white/25 mt-1.5 leading-relaxed">
              Sets the default risk suggestion shown on your dashboard.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button onClick={savePreferences} disabled={savingPrefs} className={btnPrimary}>
              {savingPrefs ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
