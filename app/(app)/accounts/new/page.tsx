import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateAccountForm from "@/components/CreateAccountForm";

export default async function NewAccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="px-8 py-8">
      <div className="max-w-[480px]">

        <div className="mb-7">
          <h1 className="text-white text-base font-semibold tracking-tight">Add Account</h1>
          <p className="text-white/25 text-xs mt-1 tracking-wide">
            Connect a new prop trading account to your dashboard.
          </p>
        </div>

        <div
          className="border border-white/[0.05] rounded-2xl px-7 py-6"
          style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" }}
        >
          <CreateAccountForm userId={user.id} />
        </div>

      </div>
    </div>
  );
}
