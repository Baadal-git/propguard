import { createClient }          from "@/lib/supabase/server";
import { calculateTradeStats, calculatePsychologicalRisk } from "@/lib/analytics";
import type { Trade }            from "@/lib/analytics";

interface Props {
  accountId: string;
}

export default async function TradeIntelligence({ accountId }: Props) {
  const supabase = createClient();

  const { data: rawTrades } = await supabase
    .from("trades")
    .select("id, pnl, trade_tag, created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  const trades = (rawTrades ?? []) as Trade[];
  const stats  = calculateTradeStats(trades);
  const psych  = calculatePsychologicalRisk(trades);

  // ── Styles ─────────────────────────────────────────────────────
  const sectionLabel = "text-[10px] font-medium uppercase tracking-[0.2em] text-white/25";
  const divider      = "h-px bg-white/[0.05]";

  const scoreColour =
    psych.riskScore >= 80 ? "text-emerald-400"
    : psych.riskScore >= 60 ? "text-yellow-400"
    : psych.riskScore >= 40 ? "text-orange-400"
    : "text-red-400";

  const scoreGlow =
    psych.riskScore >= 80 ? "0 0 20px rgba(52,211,153,0.3)"
    : psych.riskScore >= 60 ? "0 0 20px rgba(250,204,21,0.25)"
    : psych.riskScore >= 40 ? "0 0 20px rgba(251,146,60,0.3)"
    : "0 0 20px rgba(248,113,113,0.4)";

  const labelBadge =
    psych.riskScore >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : psych.riskScore >= 60 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    : psych.riskScore >= 40 ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
    : "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <div
      className="relative border border-white/[0.11] rounded-2xl px-6 py-6 flex flex-col gap-5 shadow-[0_8px_28px_rgba(0,0,0,0.4)] hover:border-white/[0.18] transition-all duration-300"
      style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className={sectionLabel}>Trade Intelligence</p>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${labelBadge}`}>
          {psych.riskLabel}
        </span>
      </div>

      <div className={divider} />

      {stats.totalTrades === 0 ? (
        <p className="text-white/20 text-xs font-medium tracking-wide text-center py-4">
          No trades logged yet. Submit your first PnL to see analytics.
        </p>
      ) : (
        <>
          {/* Psychological Risk Score — hero number */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/30 text-xs mb-0.5">Psychological Risk Index</p>
              <p className="text-xs font-medium tracking-wide text-white/25 leading-relaxed">
                Behavioural pattern analysis
              </p>
            </div>
            <p
              className={`text-[2.5rem] font-bold tabular-nums tracking-tighter leading-none ${scoreColour}`}
              style={{ textShadow: scoreGlow }}
            >
              {psych.riskScore}
            </p>
          </div>

          <div className={divider} />

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">

            <div className="flex items-center justify-between col-span-2">
              <div>
                <p className="text-white/30 text-xs mb-0.5">Win Rate</p>
                <p className="text-xs font-medium tracking-wide text-white/25 leading-relaxed">
                  {stats.winCount}W / {stats.lossCount}L — {stats.totalTrades} trades
                </p>
              </div>
              <p className={`text-lg font-bold tabular-nums tracking-tight ${
                stats.winRate >= 55 ? "text-emerald-400"
                : stats.winRate >= 45 ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {stats.winRate}%
              </p>
            </div>

            <div className={`col-span-2 ${divider}`} />

            {/* Avg Win */}
            <div>
              <p className="text-white/30 text-xs mb-1">Avg Win</p>
              <p className="text-emerald-400 text-sm font-semibold tabular-nums"
                 style={{ textShadow: "0 0 12px rgba(52,211,153,0.25)" }}>
                +${stats.avgWin.toLocaleString()}
              </p>
            </div>

            {/* Avg Loss */}
            <div>
              <p className="text-white/30 text-xs mb-1">Avg Loss</p>
              <p className="text-red-400 text-sm font-semibold tabular-nums"
                 style={{ textShadow: "0 0 12px rgba(248,113,113,0.25)" }}>
                -${stats.avgLoss.toLocaleString()}
              </p>
            </div>

            <div className={`col-span-2 ${divider}`} />

            {/* Profit Factor */}
            <div>
              <p className="text-white/30 text-xs mb-1">Profit Factor</p>
              <p className={`text-sm font-semibold tabular-nums ${
                stats.profitFactor >= 1.5 ? "text-emerald-400"
                : stats.profitFactor >= 1 ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {stats.profitFactor === 999 ? "∞" : stats.profitFactor.toFixed(2)}
              </p>
            </div>

            {/* R:R Ratio */}
            <div>
              <p className="text-white/30 text-xs mb-1">R:R Ratio</p>
              <p className={`text-sm font-semibold tabular-nums ${
                stats.rrRatio >= 1.5 ? "text-emerald-400"
                : stats.rrRatio >= 1 ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {stats.rrRatio === 999 ? "∞" : `${stats.rrRatio.toFixed(2)}R`}
              </p>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
