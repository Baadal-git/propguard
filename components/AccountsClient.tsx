"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  account_name: string;
  current_balance: number;
  highest_eod_equity: number;
  lock_status: boolean;
  account_type: string;
  created_at: string;
}

interface Props {
  accounts: Account[];
  currentAccountId?: string;
}

export default function AccountsClient({ accounts, currentAccountId }: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [manageOpen, setManageOpen]       = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);

  const cardStyle = {
    background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
  };

  const modalBg = { background: "linear-gradient(160deg, #111111 0%, #0a0a0a 100%)" };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openConfirm(acc: Account) {
    if (accounts.length <= 1) return; // guard — button is disabled anyway
    setPendingDelete(acc);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", pendingDelete.id);

    if (error) {
      showToast("Delete failed. Please try again.");
      setDeleting(false);
      setPendingDelete(null);
      return;
    }

    setDeleting(false);
    setPendingDelete(null);
    setManageOpen(false);

    const remaining = accounts.filter((a) => a.id !== pendingDelete.id);

    if (remaining.length === 0) {
      router.push("/accounts");
    } else if (currentAccountId === pendingDelete.id) {
      router.push(`/dashboard?account=${remaining[0].id}`);
    } else {
      router.refresh();
    }
  }

  const isSingleAccount = accounts.length <= 1;

  return (
    <>
      {/* ── Sub-header with Manage Accounts button ─────────── */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setManageOpen(true)}
          className="border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/15 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Manage Accounts
        </button>
      </div>

      {/* ── Account grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const balance  = Number(acc.current_balance);
          const pnl      = balance - 50000;
          const pnlColor = pnl >= 0 ? "text-emerald-400" : "text-red-400";

          return (
            <Link
              key={acc.id}
              href={`/dashboard?account=${acc.id}`}
              className="card-glow group block border border-white/[0.13] rounded-2xl px-6 py-5 hover:border-white/[0.25] transition-all duration-200"
              style={cardStyle}
            >
              {/* Account name + badges */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-[0.18em] mb-1">Account</p>
                  <p className="text-white text-sm font-semibold tracking-tight">{acc.account_name}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-medium border bg-white/[0.04] text-white/40 border-white/[0.08]">
                    {acc.account_type === "eod" ? "EOD" : "Intraday"}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${
                    acc.lock_status
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {acc.lock_status ? "Locked" : "Trailing"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/[0.05] mb-4" />

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-white/25 text-[10px] mb-1">Balance</p>
                  <p className="text-white text-base font-bold tabular-nums tracking-tight">
                    ${balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/25 text-[10px] mb-1">Total P&L</p>
                  <p className={`text-base font-bold tabular-nums tracking-tight ${pnlColor}`}>
                    {pnl >= 0 ? "+" : ""}${pnl.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-white/20 text-[10px] group-hover:text-white/40 transition-colors tracking-wide">
                Open Dashboard →
              </p>
            </Link>
          );
        })}

        {/* Add account tile */}
        <Link
          href="/accounts/new"
          className="card-glow flex flex-col items-center justify-center border border-dashed border-white/[0.14] rounded-2xl px-6 py-5 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200 min-h-[160px]"
        >
          <p className="text-white/20 text-lg mb-1">+</p>
          <p className="text-white/20 text-[11px] tracking-wide">Add Account</p>
        </Link>
      </div>

      {/* ── Manage Accounts modal ───────────────────────────── */}
      {manageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setManageOpen(false); setPendingDelete(null); } }}
        >
          <div
            className="w-full max-w-md border border-white/[0.14] rounded-2xl flex flex-col overflow-hidden"
            style={modalBg}
          >
            {/* Modal header */}
            <div className="px-7 py-5 border-b border-white/[0.1] flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">Manage Accounts</p>
                <p className="text-white/30 text-[11px] mt-0.5">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => { setManageOpen(false); setPendingDelete(null); }}
                className="text-white/25 hover:text-white/60 text-lg leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Permanent warning */}
            <div className="px-7 pt-5">
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.13)" }}
              >
                <span className="text-red-400/70 text-sm leading-none mt-px">⚠</span>
                <p className="text-red-400/75 text-[11px] leading-relaxed">
                  Deleting an account is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Account list */}
            <div className="px-7 py-5 flex flex-col gap-3">
              {isSingleAccount && (
                <p className="text-white/25 text-[11px] text-center py-1">At least one account must remain.</p>
              )}
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-white/[0.1]"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{acc.account_name}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">
                      {acc.account_type === "eod" ? "EOD" : "Intraday"} · ${Number(acc.current_balance).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => openConfirm(acc)}
                    disabled={isSingleAccount}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      background: isSingleAccount ? "transparent" : "rgba(220,38,38,0.12)",
                      border: "1px solid rgba(220,38,38,0.2)",
                      color: isSingleAccount ? "rgba(248,113,113,0.3)" : "rgba(248,113,113,0.85)",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Confirmation step — inline within modal */}
            {pendingDelete && (
              <div
                className="px-7 py-5 border-t border-white/[0.1] flex flex-col gap-4"
              >
                <div>
                  <p className="text-white text-xs font-semibold mb-1">
                    Confirm deletion of "{pendingDelete.account_name}"
                  </p>
                  <p className="text-white/35 text-[11px]">This cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPendingDelete(null)}
                    disabled={deleting}
                    className="flex-1 border border-white/[0.08] text-white/45 hover:text-white hover:border-white/20 text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-40"
                    style={{
                      background: deleting ? "rgba(220,38,38,0.3)" : "rgba(220,38,38,0.85)",
                      border: "1px solid rgba(220,38,38,0.35)",
                      color: "#fff",
                    }}
                  >
                    {deleting ? "Deleting…" : "Confirm Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-medium text-white/80 border border-white/[0.08] shadow-xl"
          style={{ background: "rgba(20,20,20,0.95)", backdropFilter: "blur(8px)" }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
