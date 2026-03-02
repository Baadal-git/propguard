"use client";

import { useState }     from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter }    from "next/navigation";
import { updateBalance } from "@/lib/drawdown";
import OverriskAlert   from "@/components/OverriskAlert";

interface Props {
  accountId:        string;
  currentBalance:   number;
  moderateRisk:     number;
  accountType:      string;
  highestEodEquity: number;
  firmMaxDrawdown:  number;
}

const TRADE_TAGS = ["", "Revenge", "FOMO", "Planned", "Oversize", "Other"];

export default function DailyPnLForm({
  accountId,
  currentBalance,
  moderateRisk,
  accountType,
  highestEodEquity,
  firmMaxDrawdown,
}: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const isIntraday = accountType === "intraday";

  const [pnl, setPnl]                       = useState("");
  const [highestBalance, setHighestBalance] = useState("");
  const [tradeTag, setTradeTag]             = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [alertLoss, setAlertLoss]           = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const pnlAmount = parseFloat(pnl);
    if (isNaN(pnlAmount)) {
      setError("Please enter a valid number.");
      setLoading(false);
      return;
    }

    let parsedHighest: number | null = null;
    if (isIntraday) {
      parsedHighest = parseFloat(highestBalance);
      if (isNaN(parsedHighest) || parsedHighest <= 0) {
        setError("Highest Balance During Trade is required for intraday accounts.");
        setLoading(false);
        return;
      }
    }

    // ── 1. Insert trade record ─────────────────────────────────────
    const { error: tradeErr } = await supabase.from("trades").insert({
      account_id:            accountId,
      pnl:                   pnlAmount,
      highest_balance_input: parsedHighest,
      trade_tag:             tradeTag || null,
    });

    if (tradeErr) {
      setError(tradeErr.message);
      setLoading(false);
      return;
    }

    // ── 2. Update account balance + intraday trailing ──────────────
    const newBalance = updateBalance(currentBalance, pnlAmount);

    const newHighestEod = isIntraday
      ? Math.max(highestEodEquity, parsedHighest!)
      : highestEodEquity;

    const updatePayload: Record<string, unknown> = { current_balance: newBalance };
    if (isIntraday) updatePayload.highest_eod_equity = newHighestEod;

    const { error: updateError } = await supabase
      .from("accounts")
      .update(updatePayload)
      .eq("id", accountId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // ── 3. Insert daily_pnl record (preserved for EOD logic) ───────
    const today = new Date().toISOString().split("T")[0];
    const { error: insertError } = await supabase
      .from("daily_pnl")
      .insert({ account_id: accountId, date: today, pnl_amount: pnlAmount });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setPnl("");
    setTradeTag("");
    if (isIntraday) setHighestBalance("");

    // ── 4. Overrisk check ──────────────────────────────────────────
    const absLoss   = Math.abs(pnlAmount);
    const threshold = moderateRisk * 1.35;

    if (pnlAmount < 0 && absLoss >= threshold) {
      setAlertLoss(absLoss);
      setLoading(false);
    } else {
      setLoading(false);
      router.refresh();
    }
  }

  function handleAlertClose() {
    setAlertLoss(null);
    router.refresh();
  }

  const pnlValue   = parseFloat(pnl);
  const isPositive = !isNaN(pnlValue) && pnlValue > 0;
  const isNegative = !isNaN(pnlValue) && pnlValue < 0;
  const inputBase  = "w-full bg-[#1a1a1a] border text-white placeholder-white/20 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors";

  return (
    <>
      {alertLoss !== null && (
        <OverriskAlert lossAmount={alertLoss} moderateRisk={moderateRisk} onClose={handleAlertClose} />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* PnL */}
        <div>
          <label className="text-white/40 text-xs block mb-1">Today&apos;s PnL ($)</label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g. 320 or -150"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              required
              step="0.01"
              className={`${inputBase} ${
                isPositive ? "border-green-500/40 focus:border-green-500/60"
                : isNegative ? "border-red-500/40 focus:border-red-500/60"
                : "border-white/10 focus:border-white/30"
              }`}
            />
            {pnl !== "" && !isNaN(pnlValue) && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-white/30"
              }`}>
                {isPositive ? "▲" : isNegative ? "▼" : "—"}
              </span>
            )}
          </div>
        </div>

        {/* Intraday: highest balance */}
        {isIntraday && (
          <div>
            <label className="text-white/40 text-xs block mb-1">Highest Balance During Trade ($)</label>
            <input
              type="number"
              placeholder="e.g. 51,400"
              value={highestBalance}
              onChange={(e) => setHighestBalance(e.target.value)}
              required
              min={0}
              step="0.01"
              className={`${inputBase} border-white/10 focus:border-white/30`}
            />
            <p className="text-xs font-medium tracking-wide text-white/25 mt-1 leading-relaxed">
              Required for live trailing accounts.
            </p>
          </div>
        )}

        {/* Trade Tag */}
        <div>
          <label className="text-white/40 text-xs block mb-1">Trade Tag <span className="text-white/20">(optional)</span></label>
          <select
            value={tradeTag}
            onChange={(e) => setTradeTag(e.target.value)}
            className={`${inputBase} border-white/10 focus:border-white/30 appearance-none cursor-pointer`}
          >
            {TRADE_TAGS.map((tag) => (
              <option key={tag} value={tag}>{tag || "— None —"}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Submit PnL"}
        </button>
      </form>
    </>
  );
}
