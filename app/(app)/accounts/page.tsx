import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AccountsClient from "@/components/AccountsClient";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams?: { account?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, account_name, current_balance, highest_eod_equity, lock_status, account_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const cardStyle = { background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" };

  return (
    <div className="px-8 py-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-white text-base font-semibold tracking-tight">Accounts</h1>
            <p className="text-white/25 text-xs mt-1 tracking-wide">
              {accounts?.length ?? 0} account{accounts?.length !== 1 ? "s" : ""} connected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/accounts/new"
              className="border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Add Account
            </Link>
          </div>
        </div>

        {/* Account list + Manage modal */}
        {!accounts || accounts.length === 0 ? (
          <div className="border border-white/[0.13] rounded-2xl px-7 py-12 text-center" style={cardStyle}>
            <p className="text-white/20 text-xs uppercase tracking-[0.2em]">No accounts yet</p>
            <p className="text-white/10 text-xs mt-2 mb-5">Add your first prop account to get started.</p>
            <Link
              href="/accounts/new"
              className="inline-block border border-white/10 text-white/50 hover:text-white text-xs px-5 py-2 rounded-lg transition-colors"
            >
              Add Account
            </Link>
          </div>
        ) : (
          <AccountsClient
            accounts={accounts}
            currentAccountId={searchParams?.account}
          />
        )}

      </div>
    </div>
  );
}
