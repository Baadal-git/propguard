// ─────────────────────────────────────────────────────────────────
// PropGuard — Global TypeScript types
// ─────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id:    string;
  email: string | undefined;
}

// ── Prop Firm ─────────────────────────────────────────────────────

export interface PropFirmRules {
  trailingType:    "EOD" | "INTRADAY";
  maxDrawdown:     number;
  dailyLossLimit:  number;
  payoutThreshold: number;
  minTradingDays:  number;
  consistencyRule: number | null;
  scalingModel:    string | null;
}

export interface PropFirm {
  id:         string;
  name:       string;
  is_active:  boolean;
  rules:      PropFirmRules;
  created_at: string;
  updated_at: string;
}

// ── Account ───────────────────────────────────────────────────────

export interface Account {
  id:                  string;
  user_id:             string;
  prop_firm_id:        string | null;
  prop_firm?:          PropFirm;
  account_name:        string;
  account_type:        string;
  starting_balance:    number;
  current_balance:     number;
  highest_eod_equity:  number;
  lock_status:         boolean;
  last_eod_close_date: string | null;
  total_withdrawn:     number;
  account_cost:        number;
  created_at:          string;
}
