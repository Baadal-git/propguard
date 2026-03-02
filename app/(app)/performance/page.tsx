import { createClient } from "@/lib/supabase/server";
import { redirect }      from "next/navigation";

export default async function PerformancePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, account_name, account_cost, total_withdrawn")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // ── Aggregates ────────────────────────────────────────────────
  const totalInvested  = (accounts ?? []).reduce((s, a) => s + Number(a.account_cost),    0);
  const totalWithdrawn = (accounts ?? []).reduce((s, a) => s + Number(a.total_withdrawn), 0);
  const netProfit      = totalWithdrawn - totalInvested;
  const overallMultiple = totalInvested > 0
    ? (totalWithdrawn / totalInvested).toFixed(1)
    : null;

  // ── Per-account ROI multiple ──────────────────────────────────
  const rows = (accounts ?? []).map((a) => {
    const cost      = Number(a.account_cost);
    const withdrawn = Number(a.total_withdrawn);
    const np        = withdrawn - cost;
    const multiple  = cost > 0 ? (withdrawn / cost).toFixed(1) : null;
    return { ...a, netProfit: np, roiMultiple: multiple };
  });

  // ── Shared styles ─────────────────────────────────────────────
  const cardBase   = "border border-white/[0.11] rounded-2xl px-6 py-5";
  const cardStyle  = { background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" };
  const labelCls   = "text-[10px] font-medium uppercase tracking-[0.2em] text-white/25";
  const divider    = "h-px bg-white/[0.05]";

  function multipleColor(m: string | null) {
    if (!m) return "text-white/25";
    const v = parseFloat(m);
    if (v > 1)  return "text-emerald-400";
    if (v < 1)  return "text-red-400";
    return "text-white/40";
  }

  function multipleGlow(m: string | null) {
    if (!m) return "none";
    const v = parseFloat(m);
    if (v > 1) return "0 0 14px rgba(52,211,153,0.25)";
    if (v < 1) return "0 0 14px rgba(248,113,113,0.25)";
    return "none";
  }

  // Keep netProfit colour helpers for net profit column
  function profitColor(n: number) {
    if (n > 0) return "text-emerald-400";
    if (n < 0) return "text-red-400";
    return "text-white/40";
  }

  function profitGlow(n: number) {
    if (n > 0) return "0 0 14px rgba(52,211,153,0.25)";
    if (n < 0) return "0 0 14px rgba(248,113,113,0.25)";
    return "none";
  }

  return (
    <div className="px-8 py-8">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* Page header */}
        <div>
          <h1 className="text-white text-base font-semibold tracking-tight">Capital Performance</h1>
          <p className="text-white/25 text-xs mt-1 tracking-wide">ROI across all funded accounts</p>
        </div>

        {/* ── Section 1: Summary card ─────────────────────────── */}
        <div className={cardBase} style={cardStyle}>
          <p className={labelCls}>Overall Summary</p>

          <div className={`${divider} mt-4 mb-4`} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            <div>
              <p className="text-white/25 text-[10px] mb-1">Total Invested</p>
              <p className="text-white text-lg font-bold tabular-nums tracking-tight">
                ${totalInvested.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-white/25 text-[10px] mb-1">Total Withdrawn</p>
              <p className="text-white text-lg font-bold tabular-nums tracking-tight">
                ${totalWithdrawn.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-white/25 text-[10px] mb-1">Net Profit</p>
              <p
                className={`text-lg font-bold tabular-nums tracking-tight ${profitColor(netProfit)}`}
                style={{ textShadow: profitGlow(netProfit) }}
              >
                {netProfit >= 0 ? "+" : ""}${netProfit.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-white/25 text-[10px] mb-1">Overall ROI</p>
              <p
                className={`text-lg font-bold tabular-nums tracking-tight ${multipleColor(overallMultiple)}`}
                style={{ textShadow: multipleGlow(overallMultiple) }}
              >
                {overallMultiple !== null ? `${overallMultiple}x` : "—"}
              </p>
            </div>

          </div>
        </div>

        {/* ── Section 2: Per-account breakdown ────────────────── */}
        <div className={cardBase} style={cardStyle}>
          <p className={labelCls}>Account Breakdown</p>

          <div className={`${divider} mt-4 mb-1`} />

          {rows.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-8">No accounts found.</p>
          ) : (
            <div className="flex flex-col">
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4 px-3 py-2.5">
                <p className={labelCls}>Account</p>
                <p className={`${labelCls} text-right`}>Cost</p>
                <p className={`${labelCls} text-right`}>Withdrawn</p>
                <p className={`${labelCls} text-right`}>Net Profit</p>
                <p className={`${labelCls} text-right`}>ROI Multiple</p>
              </div>

              <div className={divider} />

              {/* Table rows */}
              {rows.map((row, i) => (
                <div key={row.id}>
                  <div className="grid grid-cols-5 gap-4 px-3 py-3 items-center">
                    {/* Account name */}
                    <p className="text-white text-xs font-medium truncate">{row.account_name}</p>

                    {/* Cost */}
                    <p className="text-white/50 text-xs tabular-nums text-right">
                      ${Number(row.account_cost).toLocaleString()}
                    </p>

                    {/* Withdrawn */}
                    <p className="text-white/50 text-xs tabular-nums text-right">
                      ${Number(row.total_withdrawn).toLocaleString()}
                    </p>

                    {/* Net Profit */}
                    <p
                      className={`text-xs font-semibold tabular-nums text-right ${profitColor(row.netProfit)}`}
                      style={{ textShadow: profitGlow(row.netProfit) }}
                    >
                      {row.netProfit >= 0 ? "+" : ""}${row.netProfit.toLocaleString()}
                    </p>

                    {/* ROI Multiple */}
                    <p
                      className={`text-xs font-semibold tabular-nums text-right ${multipleColor(row.roiMultiple)}`}
                      style={{ textShadow: multipleGlow(row.roiMultiple) }}
                    >
                      {row.roiMultiple !== null ? `${row.roiMultiple}x` : "—"}
                    </p>
                  </div>

                  {/* Row divider — skip after last */}
                  {i < rows.length - 1 && <div className={divider} />}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
