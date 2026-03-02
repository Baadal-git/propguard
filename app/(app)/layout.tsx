import { Suspense }    from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect }    from "next/navigation";
import Sidebar         from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch role — non-blocking: missing row means USER
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = roleRow?.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-[#070707]">
      <Suspense fallback={<div className="w-[200px] flex-shrink-0" />}>
        <Sidebar isAdmin={isAdmin} />
      </Suspense>
      <div className="flex-1 ml-[200px] min-h-screen">
        {children}
      </div>
    </div>
  );
}
