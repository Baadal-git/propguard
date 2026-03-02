"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { processWithdrawal } from "@/lib/drawdown";

interface Props {
  accountId:       string;
  currentBalance:  number;
  totalWithdrawn:  number;
  accountCost:     number;
}

export default function WithdrawalForm({
  accountId,
  currentBalance,
  totalWithdrawn,
  accountCost,
}: Props) {
  const router   = useRouter();
  const supabase = createClient();

  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      setLoading(false);
      return;
    }

    if (withdrawalAmount > currentBalance) {
      setError(`Cannot withdraw more than current balance ($${currentBalance.toLocaleString()}).`);
      setLoading(false);
      return;
    }

    // Core logic — pure, no side effects
    const {
      updatedBalance,
      updatedTotalWithdrawn,
      // netProfit and roiPercent computed but not displayed yet
    } = processWithdrawal(
      currentBalance,
      withdrawalAmount,
      totalWithdrawn,
      accountCost,
    );

    // Persist updated balance and total withdrawn to Supabase
    const { error: updateError } = await supabase
      .from("accounts")
      .update({
        current_balance: updatedBalance,
        total_withdrawn: updatedTotalWithdrawn,
      })
      .eq("id", accountId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setAmount("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-white/40 text-xs block mb-1">
          Withdrawal Amount ($)
        </label>
        <input
          type="number"
          placeholder="e.g. 1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={0.01}
          step="0.01"
          className="w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing…" : "Log Withdrawal"}
      </button>
    </form>
  );
}
