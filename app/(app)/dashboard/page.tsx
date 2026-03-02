import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Header from "@/components/Header";
import CreateAccountForm from "@/components/CreateAccountForm";
import DailyPnLForm from "@/components/DailyPnLForm";
import WithdrawalForm from "@/components/WithdrawalForm";
import PayoutProjection    from "@/components/PayoutProjection";
import TradeIntelligence  from "@/components/TradeIntelligence";
import {
  checkLock,
  calculateAllowedFloor,
  calculateDrawdownBuffer,
  updateHighestEod,
  resolveRules,
  LOCK_TRIGGER_EQUITY,
} from "@/lib/drawdown";

// ── Session helpers ───────────────────────────────────────────

/** Current Date object adjusted to UTC-5 */
function getNowInUTCMinus5(): Date {
  const now    = new Date();
  const utcMs  = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 5 * 60 * 60 * 1_000);
}

/** "YYYY-MM-DD" in UTC-5 */
function getTodayInUTCMinus5(): string {
  return getNowInUTCMinus5().toISOString().split("T")[0];
}

/** True if it is at or past 16:00 UTC-5 */
function isPastEODCutoff(): boolean {
  return getNowInUTCMinus5().getHours() >= 16;
}

/**
 * Returns "HH:MM" remaining until 16:00 UTC-5.
 * Returns "00:00" if already past cutoff.
 */
function getCountdownToEOD(): string {
  const now        = getNowInUTCMinus5();
  const cutoff     = new Date(now);
  cutoff.setHours(16, 0, 0, 0);

  const diffMs     = cutoff.getTime() - now.getTime();
  if (diffMs <= 0) return "00:00";

  const totalMins  = Math.floor(diffMs / 60_000);
  const hours      = Math.floor(totalMins / 60);
  const mins       = totalMins % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { account?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ── Multi-account: resolve accountId from URL ─────────────────
  const accountId = searchParams?.account;

  if (!accountId) {
    // No account param — find first account and redirect
    const { data: firstAccount } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (firstAccount?.id) {
      redirect(`/dashboard?account=${firstAccount.id}`);
    }

    // No accounts exist → send to accounts page to create one
    redirect("/accounts");
  }

  // accountId is present — load it directly (no conditional, no maybeSingle)
  const { data: account } = await supabase
    .from("accounts")
    .select("*, prop_firm:prop_firms(*)")
    .eq("id", accountId)
    .eq("user_id", user!.id)   // security: ensure account belongs to this user
    .single();

  // ── Automatic EOD close (runs once per day at 4PM UTC-5) ─────
  if (account) {
    const todayStr           = getTodayInUTCMinus5();
    const alreadyClosedToday = account.last_eod_close_date === todayStr;

    if (isPastEODCutoff() && !alreadyClosedToday) {
      const currentBalance = Number(account.current_balance);
      const highestEod     = Number(account.highest_eod_equity);
      const newHighestEod  = updateHighestEod(currentBalance, highestEod);
      const newLockStatus  = checkLock(newHighestEod);

      await supabase
        .from("accounts")
        .update({
          highest_eod_equity:  newHighestEod,
          lock_status:         newLockStatus,
          last_eod_close_date: todayStr,
        })
        .eq("id", account.id);

      account.highest_eod_equity  = newHighestEod;
      account.lock_status         = newLockStatus;
      account.last_eod_close_date = todayStr;
    }
  }

  // ── Session status (computed once, server-side) ───────────────
  const sessionClosed  = isPastEODCutoff();
  const countdown      = getCountdownToEOD();           // "HH:MM" or "00:00"
  const eodClosedToday = account?.last_eod_close_date === getTodayInUTCMinus5();

  // ── Resolve firm rules (or fallback for legacy accounts) ─────
  const firmRules = resolveRules(account?.prop_firm?.rules ?? null);

  // ── Derived drawdown values ───────────────────────────────────
  let lockStatus       = false;
  let allowedFloor     = 0;
  let drawdownBuffer   = 0;
  let maxLossRemaining = 0;
  let lockProgress     = 0;
  let lockProgressPct  = 0;

  if (account) {
    const currentBalance = Number(account.current_balance);
    const highestEod     = Number(account.highest_eod_equity);

    lockStatus       = checkLock(highestEod);
    allowedFloor     = calculateAllowedFloor(highestEod, lockStatus, firmRules);
    drawdownBuffer   = calculateDrawdownBuffer(currentBalance, allowedFloor);
    maxLossRemaining = currentBalance - allowedFloor;

    const startingPoint = Number(account.starting_balance);
    const triggerGap    = LOCK_TRIGGER_EQUITY - startingPoint;
    const earnedToward  = Math.min(highestEod - startingPoint, triggerGap);
    lockProgress        = Math.max(0, LOCK_TRIGGER_EQUITY - highestEod);
    lockProgressPct     = Math.min(100, Math.round((earnedToward / triggerGap) * 100));
  }

  const bufferColour =
    drawdownBuffer > 1000
      ? "text-green-400"
      : drawdownBuffer > 500
      ? "text-yellow-400"
      : "text-red-400";

  const maxLossColour =
    maxLossRemaining >= 1000
      ? "text-green-400"
      : maxLossRemaining >= 500
      ? "text-yellow-400"
      : "text-red-400";

  // ── Risk suggestion ───────────────────────────────────────────
  const is50kAccount     = Number(account?.starting_balance) === 50000;
  const conservativeRisk = is50kAccount ? 250 : maxLossRemaining * 0.02;

  // ── Survival-based moderate risk ─────────────────────────────
  // moderateRisk = remainingDrawdown / 6 target trades, floor $300
  const remainingPercent   = firmRules.maxDrawdown > 0 ? drawdownBuffer / firmRules.maxDrawdown : 0;
  const targetSurvivalTrades = 6;
  const rawModerateRisk    = drawdownBuffer / targetSurvivalTrades;
  const moderateRisk       = Math.max(300, Math.round(rawModerateRisk));
  const survivalTrades     = moderateRisk > 0 ? Math.floor(drawdownBuffer / moderateRisk) : 0;

  const highBreachRisk   = maxLossRemaining < 500;
  const moderateBreaches = moderateRisk > maxLossRemaining;
  const blowUpRiskPct    = maxLossRemaining > 0
    ? Math.round((moderateRisk / maxLossRemaining) * 100)
    : 100;

  // Card depth system — primary (left) darker, secondary (right) slightly lighter
  const cardPrimary   = "relative border border-white/[0.13] rounded-2xl px-5 py-5 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/[0.22] hover:-translate-y-px transition-all duration-300";
  const cardSecondary = "relative border border-white/[0.11] rounded-2xl px-5 py-5 flex flex-col gap-4 shadow-[0_8px_28px_rgba(0,0,0,0.4)] hover:border-white/[0.18] hover:-translate-y-px transition-all duration-300";
  const card          = cardSecondary; // default alias
  const cardPrimaryStyle = { background: "linear-gradient(160deg, #111111 0%, #0a0a0a 100%)" };
  const cardSecondaryStyle = { background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" };
  const sectionLabel  = "text-[10px] font-medium uppercase tracking-[0.2em] text-white/25";
  const divider       = "h-px bg-white/[0.05]";

  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      <Header email={user!.email!} />

      <main className="px-8 py-8">

      {/* ── No account state ── */}
      {!account ? (
        <div className="max-w-sm mx-auto bg-white/[0.03] border border-white/[0.12] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="mb-6">
            <p className="text-white font-semibold text-sm mb-1.5">Create your Lucid account</p>
            <p className="text-white/35 text-xs leading-relaxed">Enter your account details to get started.</p>
          </div>
          <CreateAccountForm userId={user!.id} />
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto flex flex-col gap-5">

          {/* ══════════════════════════════════════════════════
              ROW 1 — Account Status (full width summary card)
          ══════════════════════════════════════════════════ */}
          <div className={`${cardPrimary} card-glow`} style={cardPrimaryStyle}>
            <div className="flex items-start justify-between">
              <div>
                <p className={sectionLabel}>Account</p>
                <p className="text-white text-base font-semibold mt-1 tracking-tight">
                  {account.account_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-3 py-1 rounded-full font-medium border ${
                  account.account_type === "eod"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {account.account_type === "eod" ? "EOD" : "Intraday"}
                </span>
                <span className={`text-[11px] font-medium px-3 py-1 rounded-full border ${
                  lockStatus
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {lockStatus ? "Locked ✓" : "Trailing"}
                </span>
              </div>
            </div>

            <div className={divider} />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className={sectionLabel}>Current Balance</p>
                <p className="text-white text-[2rem] font-bold tabular-nums mt-2 tracking-tighter leading-none"
                   style={{ textShadow: "0 0 40px rgba(255,255,255,0.12), 0 0 80px rgba(255,255,255,0.04)" }}>
                  ${Number(account.current_balance).toLocaleString()}
                </p>
              </div>
              <div>
                <p className={sectionLabel}>Highest EOD Equity</p>
                <p className="text-white/50 text-[2rem] font-bold tabular-nums mt-2 tracking-tighter leading-none">
                  ${Number(account.highest_eod_equity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              ROW 2 — Drawdown Engine + Risk Suggestion (side by side)
          ══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── Drawdown Engine ── */}
            <div className={`${cardPrimary} card-glow`} style={cardPrimaryStyle}>
              <p className={sectionLabel}>Drawdown Engine</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-xs mb-2">Allowed Floor</p>
                  <p className="text-white text-lg font-bold tabular-nums tracking-tight">
                    ${allowedFloor.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-2">Drawdown Buffer</p>
                  <p className={`text-2xl font-bold tabular-nums tracking-tight ${bufferColour}`}
                     style={{ textShadow: drawdownBuffer > 1000 ? "0 0 16px rgba(52,211,153,0.25)" : drawdownBuffer > 500 ? "0 0 16px rgba(250,204,21,0.2)" : "0 0 16px rgba(248,113,113,0.25)" }}>
                    ${drawdownBuffer.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={divider} />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/30 text-xs mb-0.5">Max Loss Remaining</p>
                  <p className="text-xs font-medium tracking-wide text-white/40 leading-relaxed">Before account breach</p>
                </div>
                <p className={`text-2xl font-bold tabular-nums tracking-tight ${maxLossColour}`}
                   style={{ textShadow: maxLossRemaining < 500 ? "0 0 20px rgba(248,113,113,0.3)" : maxLossRemaining < 1000 ? "0 0 20px rgba(250,204,21,0.2)" : "0 0 20px rgba(52,211,153,0.2)" }}>
                  ${maxLossRemaining.toLocaleString()}
                </p>
              </div>

              <div className={divider} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/30 text-xs">Safety Lock Progress</p>
                  {lockStatus ? (
                    <span className="text-yellow-400 text-xs font-semibold">Locked ✓</span>
                  ) : (
                    <span className="text-xs">
                      <span className="text-emerald-400 font-medium tabular-nums">${lockProgress.toLocaleString()}</span>
                      <span className="text-white/30 font-normal"> remaining</span>
                    </span>
                  )}
                </div>
                <div className="w-full bg-white/[0.05] rounded-full h-px">
                  <div
                    className={`h-px rounded-full transition-all duration-700 ${
                      lockStatus ? "bg-yellow-400" : "bg-white/30"
                    }`}
                    style={{ width: `${lockProgressPct}%` }}
                  />
                </div>
                <p className="text-[9px] mt-1 text-right tabular-nums"><span className="text-amber-400/70 font-medium">{lockProgressPct}%</span><span className="text-white/35 font-medium"> to $52,100</span></p>
              </div>
            </div>

            {/* ── Risk Suggestion ── */}
            <div className={`${card} h-full`} style={cardSecondaryStyle}>
              <p className={sectionLabel}>Risk Suggestion</p>

              {highBreachRisk ? (
                <div className="flex items-start gap-3 rounded-xl px-4 py-3.5"
                     style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)", boxShadow: "0 0 20px rgba(220,38,38,0.08), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                  <span className="text-red-400/80 text-sm mt-px leading-none" style={{ textShadow: "0 0 8px rgba(248,113,113,0.5)" }}>⚠</span>
                  <p className="text-red-400/80 text-xs leading-relaxed tracking-wide">
                    High breach risk. Reduce position size immediately.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/35 text-xs mb-0.5">
                        Conservative {is50kAccount ? "(Fixed)" : "(2%)"}
                      </p>
                      <p className="text-xs font-medium tracking-wide text-white/40 leading-relaxed">Lower risk per trade</p>
                    </div>
                    <p className="text-emerald-400 text-sm font-semibold tabular-nums"
                       style={{ textShadow: "0 0 12px rgba(52,211,153,0.3)" }}>
                      ${conservativeRisk.toFixed(2)}
                    </p>
                  </div>

                  <div className={divider} />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/35 text-xs mb-0.5">
                          Moderate (Survival)
                        </p>
                        <p className="text-xs font-medium tracking-wide text-white/40 leading-relaxed">Standard risk per trade</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold tabular-nums ${
                          moderateBreaches ? "text-red-400" : "text-yellow-400"
                        }`}>
                          ${moderateRisk.toLocaleString()}
                        </p>
                        <p className="text-white/20 text-[10px] mt-0.5 uppercase tracking-[0.12em]">Survival Capacity</p>
                        <p className={`text-[13px] font-semibold tabular-nums mt-0.5 ${
                          survivalTrades >= 6
                            ? "text-emerald-400"
                            : survivalTrades >= 4
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}>
                          {survivalTrades} trades
                        </p>
                      </div>
                    </div>
                    {moderateBreaches ? (
                      <p className="risk-warning text-[12.5px] font-semibold text-red-400/90 leading-relaxed tracking-wide"
                        style={{ textShadow: "0 0 12px rgba(248,113,113,0.55), 0 0 28px rgba(248,113,113,0.2)" }}>
                        ⚠ This trade size would immediately breach your account.
                      </p>
                    ) : (
                      <p className="risk-warning text-[12.5px] font-semibold text-red-400/75 leading-relaxed tracking-wide"
                        style={{ textShadow: "0 0 10px rgba(248,113,113,0.4), 0 0 24px rgba(248,113,113,0.15)" }}>
                        Exceeding moderate risk increases your chance of blowing up by {blowUpRiskPct}%
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ══════════════════════════════════════════════════
              ROW 3 — Payout Projection (full width)
          ══════════════════════════════════════════════════ */}
          <PayoutProjection
            highestEodEquity={Number(account.highest_eod_equity)}
            lockStatus={lockStatus}
            startingBalance={Number(account.starting_balance)}
          />

          {/* ══════════════════════════════════════════════════
              ROW 4 — Daily PnL + Withdrawal (side by side)
          ══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── Daily PnL ── */}
            <div className={card} style={cardSecondaryStyle}>
              <div className="flex items-center justify-between">
                <p className={sectionLabel}>Daily PnL</p>
                {sessionClosed ? (
                  <p className="text-xs font-medium tracking-wide text-blue-400/70">Day closed at 4PM UTC-5</p>
                ) : (
                  <p className="text-xs font-medium tracking-wide text-white/40">
                    Closes in{" "}
                    <span className="text-white/50 font-semibold tabular-nums">{countdown}</span>
                  </p>
                )}
              </div>
              <DailyPnLForm
                accountId={account.id}
                currentBalance={Number(account.current_balance)}
                moderateRisk={moderateRisk}
                accountType={account.account_type}
                highestEodEquity={Number(account.highest_eod_equity)}
                firmMaxDrawdown={firmRules.maxDrawdown}
              />
            </div>

            {/* ── Withdrawal ── */}
            <div className={card} style={cardSecondaryStyle}>
              <p className={sectionLabel}>Withdrawal</p>
              <WithdrawalForm
                accountId={account.id}
                currentBalance={Number(account.current_balance)}
                totalWithdrawn={Number((account as any).total_withdrawn ?? 0)}
                accountCost={Number((account as any).account_cost ?? 0)}
              />
            </div>

          </div>

          {/* ══════════════════════════════════════════════════
              ROW 5 — Trade Intelligence (full width)
          ══════════════════════════════════════════════════ */}
          <TradeIntelligence accountId={account.id} />

        </div>
      )}

      </main>
    </div>
  );
}
