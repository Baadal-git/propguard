"use client";

import { useState } from "react";

interface Props {
  highestEodEquity: number;
  lockStatus:       boolean;
  startingBalance:  number;
}

export default function PayoutProjection({ highestEodEquity, lockStatus, startingBalance }: Props) {
  const [plannedProfit, setPlannedProfit] = useState(250);

  const is50kAccount    = startingBalance === 50000;
  const profitSplit     = 0.5;
  const requiredProfitMin = 1000 / profitSplit;   // $2,000 gross to net $1,000
  const requiredProfitMax = 2000 / profitSplit;   // $4,000 gross to net $2,000
  const daysToMin       = Math.ceil(requiredProfitMin / plannedProfit);
  const daysToMax       = Math.ceil(requiredProfitMax / plannedProfit);

  const sectionLabel = "text-[10px] font-medium uppercase tracking-[0.18em] text-white/30";
  const divider      = "h-px bg-white/[0.07]";

  return (
    <div className="relative border border-white/[0.11] rounded-2xl px-5 py-5 flex flex-col gap-4 shadow-[0_8px_28px_rgba(0,0,0,0.4)] hover:border-white/[0.18] hover:-translate-y-px transition-all duration-300"
         style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" }}>

      <div>
        <p className={sectionLabel}>Payout Projection</p>
        <p className="text-xs font-medium tracking-wide text-white/40 leading-relaxed mt-1">Based on consistent daily profit target.</p>
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/30 text-xs">Planned Daily Profit</p>
          <span className="text-white text-sm font-bold tabular-nums">
            ${plannedProfit.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={plannedProfit}
          onChange={(e) => setPlannedProfit(Number(e.target.value))}
          className="w-full h-px rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${((plannedProfit - 50) / 1950) * 100}%, rgba(255,255,255,0.08) ${((plannedProfit - 50) / 1950) * 100}%, rgba(255,255,255,0.08) 100%)`,
            accentColor: "white",
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-white/30 text-[10px]">$50</span>
          <span className="text-white/30 text-[10px]">$2,000</span>
        </div>
      </div>

      <div className={divider} />

      {is50kAccount ? (
        <div className="flex flex-col gap-4">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/30 text-xs mb-0.5">Days to $1,000 Withdrawal</p>
              <p className="text-xs font-medium tracking-wide text-white/40 leading-relaxed">Minimum payout threshold</p>
            </div>
            <p className="text-amber-400 text-lg font-bold tabular-nums tracking-tight"
               style={{ textShadow: "0 0 16px rgba(251,191,36,0.25)" }}>
              {daysToMin}
              <span className="text-amber-400/40 text-xs font-normal ml-1">days</span>
            </p>
          </div>

          <div className={divider} />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/30 text-xs mb-0.5">Days to $2,000 Withdrawal</p>
              <p className="text-xs font-medium tracking-wide text-white/40 leading-relaxed">Maximum payout threshold</p>
            </div>
            <p className="text-emerald-400 text-lg font-bold tabular-nums tracking-tight"
               style={{ textShadow: "0 0 20px rgba(52,211,153,0.3)" }}>
              {daysToMax}
              <span className="text-emerald-400/30 text-xs font-normal ml-1">days</span>
            </p>
          </div>

        </div>
      ) : lockStatus ? (
        <div className="flex items-center gap-3 bg-yellow-500/8 border border-yellow-500/15 rounded-xl px-4 py-3.5">
          <span className="text-yellow-400 text-sm">✓</span>
          <p className="text-yellow-400/90 text-xs">Account already secured.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs">Days to $1,000 Withdrawal</p>
            <p className="text-amber-400 text-lg font-bold tabular-nums">
              {daysToMin}
              <span className="text-amber-400/40 text-xs font-normal ml-1">days</span>
            </p>
          </div>
          <div className={divider} />
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs">Days to $2,000 Withdrawal</p>
            <p className="text-emerald-400 text-lg font-bold tabular-nums">
              {daysToMax}
              <span className="text-emerald-400/30 text-xs font-normal ml-1">days</span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
