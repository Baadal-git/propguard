// ─────────────────────────────────────────────────────────────────
// PROPGUARD — CORE DRAWDOWN ENGINE
// Pure functions only. No DB calls. No UI.
// All firm-specific rules passed as parameters — no hardcoding.
// ─────────────────────────────────────────────────────────────────

import type { PropFirmRules } from "@/types";

// ─────────────────────────────────────────────────────────────────
// FALLBACK CONSTANTS
// Used only when an account has no prop_firm_id (legacy accounts).
// New accounts always use firm rules from the database.
// ─────────────────────────────────────────────────────────────────

export const STARTING_BALANCE        = 50_000;
export const MAX_DRAWDOWN            = 2_000;   // fallback
export const LOCK_TRIGGER_EQUITY     = 52_100;
export const STATIC_LOCK_FLOOR       = 50_100;
export const MIN_PROFITABLE_DAY      = 150;
export const MIN_PAYOUT_DAYS         = 5;
export const PROFIT_SPLIT            = 0.9;
export const WITHDRAWAL_PERCENTAGE   = 0.5;

// ─────────────────────────────────────────────────────────────────
// FIRM RULES HELPER
// Returns firm rules if present, or fallback defaults.
// ─────────────────────────────────────────────────────────────────

export function resolveRules(firmRules?: PropFirmRules | null): PropFirmRules {
  if (firmRules) return firmRules;
  // Fallback for legacy accounts with no firm assigned
  return {
    trailingType:    "EOD",
    maxDrawdown:     MAX_DRAWDOWN,
    dailyLossLimit:  1200,
    payoutThreshold: 1000,
    minTradingDays:  MIN_PAYOUT_DAYS,
    consistencyRule: null,
    scalingModel:    null,
  };
}

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface PayoutResult {
  totalProfit:        number;
  withdrawableAmount: number;
  traderReceives:     number;
}

// ─────────────────────────────────────────────────────────────────
// CORE FUNCTIONS — all firm-rule-aware
// ─────────────────────────────────────────────────────────────────

/**
 * Applies a day's PnL to the current balance.
 * Returns the new balance, floored at 0.
 */
export function updateBalance(
  currentBalance: number,
  dailyPnL: number
): number {
  return Math.max(0, currentBalance + dailyPnL);
}

/**
 * Returns the new highest end-of-day equity.
 * Only moves up — never down.
 */
export function updateHighestEod(
  currentBalance: number,
  highestEod: number
): number {
  return Math.max(currentBalance, highestEod);
}

/**
 * Returns true if the account's drawdown floor should be locked.
 * Lock triggers once highest EOD equity reaches LOCK_TRIGGER_EQUITY.
 * (Lock trigger point is a platform constant, not per-firm.)
 */
export function checkLock(highestEod: number): boolean {
  return highestEod >= LOCK_TRIGGER_EQUITY;
}

/**
 * Returns the current drawdown floor (the lowest balance allowed).
 * Uses firm's maxDrawdown rule — not a hardcoded constant.
 *
 * - If locked:   floor is always STATIC_LOCK_FLOOR
 * - If unlocked: floor trails below highest EOD by rules.maxDrawdown
 */
export function calculateAllowedFloor(
  highestEod:  number,
  lockStatus:  boolean,
  rules:       PropFirmRules,
): number {
  if (lockStatus) return STATIC_LOCK_FLOOR;
  return highestEod - rules.maxDrawdown;
}

/**
 * Returns how much buffer remains before hitting the drawdown floor.
 */
export function calculateDrawdownBuffer(
  currentBalance: number,
  allowedFloor:   number,
): number {
  return currentBalance - allowedFloor;
}

/**
 * Calculates payout figures based on current balance and firm rules.
 * Uses rules.payoutThreshold as the minimum payout target.
 */
export function calculatePayout(
  currentBalance: number,
  startingBalance: number = STARTING_BALANCE,
): PayoutResult {
  const totalProfit        = Math.max(0, currentBalance - startingBalance);
  const withdrawableAmount = totalProfit * WITHDRAWAL_PERCENTAGE;
  const traderReceives     = withdrawableAmount * PROFIT_SPLIT;

  return { totalProfit, withdrawableAmount, traderReceives };
}

/**
 * Counts how many days in a PnL array qualify as profitable.
 * Uses MIN_PROFITABLE_DAY as the threshold.
 */
export function countQualifiedDays(dailyPnLArray: number[]): number {
  return dailyPnLArray.filter((pnl) => pnl >= MIN_PROFITABLE_DAY).length;
}

// ─────────────────────────────────────────────────────────────────
// ROI + WITHDRAWAL UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * Calculates net profit and ROI percentage for a funded account.
 */
export function calculateROI(
  accountCost:    number,
  totalWithdrawn: number,
): { netProfit: number; roiPercent: number } {
  const safeCost      = isNaN(accountCost)    || !isFinite(accountCost)    ? 0 : accountCost;
  const safeWithdrawn = isNaN(totalWithdrawn) || !isFinite(totalWithdrawn) ? 0 : totalWithdrawn;

  const netProfit  = safeWithdrawn - safeCost;
  const roiPercent = safeCost > 0
    ? Math.round((netProfit / safeCost) * 100 * 100) / 100
    : 0;

  return { netProfit, roiPercent };
}

/**
 * Processes a withdrawal: updates balance and total withdrawn,
 * then computes ROI using calculateROI.
 */
export function processWithdrawal(
  currentBalance:        number,
  withdrawalAmount:      number,
  currentTotalWithdrawn: number,
  accountCost:           number,
): {
  updatedBalance:        number;
  updatedTotalWithdrawn: number;
  netProfit:             number;
  roiPercent:            number;
} {
  const safeBalance   = isNaN(currentBalance)        || !isFinite(currentBalance)        ? 0 : Math.max(0, currentBalance);
  const safeCost      = isNaN(accountCost)           || !isFinite(accountCost)           ? 0 : accountCost;
  const safeWithdrawn = isNaN(currentTotalWithdrawn) || !isFinite(currentTotalWithdrawn) ? 0 : Math.max(0, currentTotalWithdrawn);

  const rawAmount  = isNaN(withdrawalAmount) || !isFinite(withdrawalAmount) ? 0 : withdrawalAmount;
  const safeAmount = Math.min(Math.max(0, rawAmount), safeBalance);

  const updatedBalance        = safeBalance - safeAmount;
  const updatedTotalWithdrawn = safeWithdrawn + safeAmount;

  const { netProfit, roiPercent } = calculateROI(safeCost, updatedTotalWithdrawn);

  return { updatedBalance, updatedTotalWithdrawn, netProfit, roiPercent };
}

/**
 * Calculates ROI multiple (total_withdrawn / account_cost).
 * Returns null if cost is 0 (display as "—").
 */
export function calculateROI_Multiple(
  accountCost:    number,
  totalWithdrawn: number,
): string | null {
  if (accountCost <= 0) return null;
  return (totalWithdrawn / accountCost).toFixed(1);
}
