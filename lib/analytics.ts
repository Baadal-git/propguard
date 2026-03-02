// ─────────────────────────────────────────────────────────────────
// PropGuard — Trade Analytics Engine
// Pure functions. No DB calls. No UI dependencies.
// ─────────────────────────────────────────────────────────────────

export interface Trade {
  id:         string;
  pnl:        number;
  trade_tag:  string | null;
  created_at: string;
}

export interface TradeStats {
  totalTrades:  number;
  winCount:     number;
  lossCount:    number;
  winRate:      number;   // 0–100 percentage
  avgWin:       number;
  avgLoss:      number;   // always positive
  profitFactor: number;
  rrRatio:      number;
}

export interface PsychologicalRisk {
  riskScore: number;
  riskLabel: "Stable" | "Elevated" | "Risky" | "Danger";
}

// ── Trade Statistics ──────────────────────────────────────────────

export function calculateTradeStats(trades: Trade[]): TradeStats {
  const total = trades.length;
  if (total === 0) {
    return {
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      rrRatio: 0,
    };
  }

  const wins   = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);

  const winCount  = wins.length;
  const lossCount = losses.length;

  const totalWinPnl  = wins.reduce((s, t) => s + t.pnl, 0);
  const totalLossPnl = losses.reduce((s, t) => s + t.pnl, 0); // negative

  const winRate      = total > 0 ? Math.round((winCount / total) * 100) : 0;
  const avgWin       = winCount > 0 ? totalWinPnl / winCount : 0;
  const avgLoss      = lossCount > 0 ? Math.abs(totalLossPnl / lossCount) : 0;
  const profitFactor = totalLossPnl !== 0 ? totalWinPnl / Math.abs(totalLossPnl) : winCount > 0 ? 999 : 0;
  const rrRatio      = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;

  return {
    totalTrades: total,
    winCount,
    lossCount,
    winRate,
    avgWin:       Math.round(avgWin * 100) / 100,
    avgLoss:      Math.round(avgLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    rrRatio:      Math.round(rrRatio * 100) / 100,
  };
}

// ── Psychological Risk Index ──────────────────────────────────────

export function calculatePsychologicalRisk(trades: Trade[]): PsychologicalRisk {
  if (trades.length === 0) {
    return { riskScore: 100, riskLabel: "Stable" };
  }

  let score = 100;

  // ── Consecutive loss penalties ────────────────────────────────
  let streak = 0;
  for (const trade of trades) {
    if (trade.pnl < 0) {
      streak++;
      if (streak === 2) score -= 5;
      else if (streak === 3) score -= 10;
      else if (streak >= 4) score -= 20;
    } else {
      streak = 0;
    }
  }

  // ── Psychological tag penalties ───────────────────────────────
  for (const trade of trades) {
    const tag = trade.trade_tag?.trim().toLowerCase();
    if (tag === "revenge") score -= 10;
    if (tag === "fomo")    score -= 10;
  }

  const riskScore = Math.max(0, Math.min(100, score));

  const riskLabel: PsychologicalRisk["riskLabel"] =
    riskScore >= 80 ? "Stable"
    : riskScore >= 60 ? "Elevated"
    : riskScore >= 40 ? "Risky"
    : "Danger";

  return { riskScore, riskLabel };
}
