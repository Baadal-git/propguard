import LogoutButton from "@/components/LogoutButton";

interface Props {
  email: string;
}

export default function Header({ email }: Props) {
  return (
    <header className="w-full border-b border-white/[0.05] bg-black/30 backdrop-blur-xl px-8 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">

        {/* Left — brand */}
        <div className="flex items-center gap-4">
          <div className="w-[3px] h-7 bg-white/15 rounded-full" />
          <div>
            <p className="text-white text-base font-semibold tracking-tight leading-none">
              PropGuard
            </p>
            <p className="text-white/20 text-[10px] mt-[5px] tracking-[0.2em] uppercase font-medium">
              Prop Trading Dashboard
            </p>
          </div>
        </div>

        {/* Right — user + sign out */}
        <div className="flex items-center gap-7">
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <p className="text-white/25 text-[11px] tracking-wide">{email}</p>
            <p className="text-white/12 text-[9px] tracking-widest uppercase">Trader</p>
          </div>
          <LogoutButton />
        </div>

      </div>
    </header>
  );
}
