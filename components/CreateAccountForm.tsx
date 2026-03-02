"use client";

import { useState, useEffect } from "react";
import { createClient }        from "@/lib/supabase/client";
import { useRouter }           from "next/navigation";
import type { PropFirm }       from "@/types";

interface Props {
  userId: string;
}

export default function CreateAccountForm({ userId }: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [accountName, setAccountName]       = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [highestEod, setHighestEod]         = useState("");
  const [accountType, setAccountType]       = useState("intraday");
  const [accountCost, setAccountCost]       = useState("");
  const [propFirmId, setPropFirmId]         = useState("");
  const [firms, setFirms]                   = useState<PropFirm[]>([]);
  const [loadingFirms, setLoadingFirms]     = useState(true);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");

  // Fetch active prop firms on mount
  useEffect(() => {
    async function fetchFirms() {
      const { data } = await supabase
        .from("prop_firms")
        .select("*")
        .eq("is_active", true)
        .eq("is_archived", false)
        .order("name", { ascending: true });
      setFirms(data ?? []);
      setLoadingFirms(false);
    }
    fetchFirms();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsedBalance = parseFloat(currentBalance);
    const parsedHighest = highestEod !== ""
      ? parseFloat(highestEod)
      : parsedBalance;

    if (isNaN(parsedBalance) || parsedBalance <= 0) {
      setError("Please enter a valid current balance.");
      setLoading(false);
      return;
    }

    const parsedCost = parseFloat(accountCost);
    if (isNaN(parsedCost) || parsedCost < 0) {
      setError("Please enter a valid account cost (0 or greater).");
      setLoading(false);
      return;
    }

    if (!propFirmId) {
      setError("Please select a prop firm.");
      setLoading(false);
      return;
    }

    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        user_id:            userId,
        prop_firm_id:       propFirmId,
        account_name:       accountName.trim(),
        account_type:       accountType,
        account_cost:       parsedCost,
        starting_balance:   50000,
        current_balance:    parsedBalance,
        highest_eod_equity: parsedHighest,
        lock_status:        false,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard?account=${newAccount.id}`);
  }

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/30 transition-colors";
  const labelCls = "text-white/40 text-xs block mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left mb-6">

      {/* Account Name */}
      <div>
        <label className={labelCls}>Account Name</label>
        <input
          type="text"
          placeholder="e.g. Lucid 50K"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      {/* Prop Firm — required */}
      <div>
        <label className={labelCls}>Prop Firm</label>
        <select
          value={propFirmId}
          onChange={(e) => setPropFirmId(e.target.value)}
          required
          disabled={loadingFirms}
          className={`${inputCls} appearance-none cursor-pointer`}
        >
          <option value="">
            {loadingFirms ? "Loading firms…" : "Select a prop firm"}
          </option>
          {firms.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Current Balance */}
      <div>
        <label className={labelCls}>Current Balance ($)</label>
        <input
          type="number"
          placeholder="e.g. 50000"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(e.target.value)}
          required
          min={0}
          step="0.01"
          className={inputCls}
        />
      </div>

      {/* Highest EOD Equity (optional) */}
      <div>
        <label className={labelCls}>
          Highest EOD Equity ($){" "}
          <span className="text-white/20">(optional — defaults to current balance)</span>
        </label>
        <input
          type="number"
          placeholder="e.g. 50000"
          value={highestEod}
          onChange={(e) => setHighestEod(e.target.value)}
          min={0}
          step="0.01"
          className={inputCls}
        />
      </div>

      {/* Account Cost */}
      <div>
        <label className={labelCls}>Account Cost ($)</label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={accountCost}
          onChange={(e) => setAccountCost(e.target.value)}
          required
          min={0}
          step="0.01"
          className={inputCls}
        />
      </div>

      {/* Account Type */}
      <div>
        <label className={labelCls}>Account Type</label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          required
          className={`${inputCls} appearance-none cursor-pointer`}
        >
          <option value="intraday">Intraday</option>
          <option value="eod">End of Day (EOD)</option>
        </select>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading || loadingFirms}
        className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 disabled:opacity-50 transition-colors mt-1"
      >
        {loading ? "Creating…" : "Create Account"}
      </button>

    </form>
  );
}
