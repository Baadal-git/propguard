import { createClient }  from "@/lib/supabase/server";
import { redirect }      from "next/navigation";
import SettingsClient    from "@/components/SettingsClient";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch or auto-create profile row
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("user_profiles").insert({ user_id: user.id });
  }

  // Fetch role
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = roleRow?.role ?? "USER";

  return (
    <div className="px-8 py-8">
      <div className="max-w-[720px] mx-auto">

        <div className="mb-8">
          <h1 className="text-white text-base font-semibold tracking-tight">Settings</h1>
          <p className="text-white/25 text-xs mt-1 font-medium tracking-wide">Profile, security and preferences</p>
        </div>

        <SettingsClient
          userId={user.id}
          email={user.email ?? ""}
          initialName={profile?.full_name ?? ""}
          initialRiskMode={profile?.default_risk_mode ?? "moderate"}
          role={role}
        />
      </div>
    </div>
  );
}
