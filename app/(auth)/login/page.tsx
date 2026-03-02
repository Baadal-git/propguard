"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">

        {/* Title */}
        <h1 className="text-white text-2xl font-semibold tracking-wide text-center mb-8">
          PropGuard
        </h1>

        {/* Card */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8">

          {/* Mode toggle */}
          <div className="flex mb-6 bg-[#1a1a1a] rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); setMessage(""); }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                mode === "login"
                  ? "bg-white text-black font-medium"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode("signup"); setMessage(""); }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                mode === "signup"
                  ? "bg-white text-black font-medium"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1a1a1a] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#1a1a1a] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-white/90 disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] border border-white/10 text-white py-2.5 rounded-lg text-sm hover:bg-[#222] disabled:opacity-50 transition-colors"
          >
            {/* Google icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Feedback message */}
          {message && (
            <p className="mt-4 text-center text-sm text-white/50">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}
