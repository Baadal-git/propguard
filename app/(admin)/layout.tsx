import { Suspense }     from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect }     from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!roleRow || roleRow.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#070707]">
      <Suspense fallback={<div className="w-[200px] flex-shrink-0" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 ml-[200px] min-h-screen">
        {children}
      </div>
    </div>
  );
}

function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] flex flex-col border-r border-white/[0.05] bg-[#070707] z-20">
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-[3px] h-5 bg-violet-400/40 rounded-full flex-shrink-0" />
          <div>
            <p className="text-white text-[13px] font-semibold tracking-tight leading-none">PropGuard</p>
            <p className="text-violet-400/50 text-[9px] mt-1 tracking-[0.18em] uppercase">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-white/20 text-[9px] uppercase tracking-[0.18em] px-3 mb-2">Admin</p>
        <a
          href="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium bg-white/[0.07] text-white transition-all duration-150"
        >
          <span className="text-white/70">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="1" width="5.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.1"/>
              <rect x="1" y="6.5" width="5.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.1"/>
              <rect x="1" y="11" width="5.5" height="3" rx="1" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M9 2.75h5M9 8.25h5M9 12.5h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
          </span>
          Prop Firms
          <span className="ml-auto w-1 h-1 rounded-full bg-white/40" />
        </a>
        <div className="mt-3 px-3"><div className="h-px bg-white/[0.05]" /></div>
        <a
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150 mt-1"
        >
          <span className="text-white/20">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M8 1.5L2 7.5M2 7.5L8 13.5M2 7.5H13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Back to App
        </a>
      </nav>

      <div className="px-5 py-4 border-t border-white/[0.05]">
        <p className="text-violet-400/30 text-[9px] tracking-widest uppercase">Admin Panel</p>
      </div>
    </aside>
  );
}
