"use client";

import Link        from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    label: "Dashboard",
    href:  "/dashboard",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1h5.5v5.5H1V1zm7.5 0H14v5.5H8.5V1zM1 8.5h5.5V14H1V8.5zm7.5 0H14V14H8.5V8.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Accounts",
    href:  "/accounts",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 1a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2 13.5C2 11 4.5 9 7.5 9s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Add Account",
    href:  "/accounts/new",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Performance",
    href:  "/performance",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 11.5L5 7l3 3 5-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href:  "/settings",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.3 1.5l-.4 1.6a5 5 0 0 0-1.3.75l-1.6-.5-1.2 2 1.2 1.1a5 5 0 0 0 0 1.5L1.8 9l1.2 2 1.6-.5a5 5 0 0 0 1.3.76l.4 1.6h2.4l.4-1.6a5 5 0 0 0 1.3-.76l1.6.5 1.2-2-1.2-1.1a5 5 0 0 0 0-1.5L13.2 5l-1.2-2-1.6.5A5 5 0 0 0 9.1 3.1l-.4-1.6H6.3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <circle cx="7.5" cy="7.5" r="1.75" stroke="currentColor" strokeWidth="1.1"/>
      </svg>
    ),
  },
];

interface Props {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] flex flex-col border-r border-white/[0.05] bg-[#070707] z-20">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-[3px] h-5 bg-white/20 rounded-full flex-shrink-0" />
          <div>
            <p className="text-white text-[13px] font-semibold tracking-tight leading-none">PropGuard</p>
            <p className="text-white/20 text-[9px] mt-1 tracking-[0.18em] uppercase">Prop Desk</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-white/20 text-[9px] uppercase tracking-[0.18em] px-3 mb-2">Navigation</p>
        {nav.map(({ label, href, icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-white/[0.07] text-white"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              <span className={`flex-shrink-0 transition-colors duration-150 ${isActive ? "text-white/70" : "text-white/25 group-hover:text-white/50"}`}>
                {icon}
              </span>
              {label}
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-white/40" />
              )}
            </Link>
          );
        })}

        {/* Admin link — only for ADMIN users */}
        {isAdmin && (
          <>
            <div className="mx-3 my-2 h-px bg-white/[0.05]" />
            <p className="text-white/15 text-[9px] uppercase tracking-[0.18em] px-3 mb-1">Admin</p>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 group ${
                pathname.startsWith("/admin")
                  ? "bg-violet-500/[0.12] text-violet-300"
                  : "text-white/30 hover:text-violet-300/80 hover:bg-violet-500/[0.07]"
              }`}
            >
              <span className={`flex-shrink-0 transition-colors duration-150 ${pathname.startsWith("/admin") ? "text-violet-400/70" : "text-white/20 group-hover:text-violet-400/50"}`}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="1" width="5.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                  <rect x="1" y="6.5" width="5.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                  <rect x="1" y="11" width="5.5" height="3" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                  <path d="M9 2.75h5M9 8.25h5M9 12.5h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
              </span>
              Prop Firms
              {pathname.startsWith("/admin") && (
                <span className="ml-auto w-1 h-1 rounded-full bg-violet-400/50" />
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.05]">
        <p className="text-white/15 text-[9px] tracking-widest uppercase">v0.1 — MVP</p>
      </div>

    </aside>
  );
}
