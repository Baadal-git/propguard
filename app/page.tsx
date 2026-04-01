'use client';

import { useEffect } from 'react';

export default function Home() {
  const landingHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PropGuard — The Ultimate Prop Trading Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            bg: '#0a0a0a',
            surface: '#111111',
            card: '#141414',
            border: '#1e1e1e',
            muted: '#2a2a2a',
            cyan: { DEFAULT: '#00e5ff', dim: '#00b8cc', glow: 'rgba(0,229,255,0.12)', faint: 'rgba(0,229,255,0.04)' },
            blue: { accent: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
            green: { tick: '#00ff94', dim: '#00cc77' },
            text: { primary: '#f0f0f0', secondary: '#9a9a9a', tertiary: '#555555' },
          },
          fontFamily: {
            display: ['Syne', 'sans-serif'],
            mono: ['DM Mono', 'monospace'],
            body: ['Inter', 'sans-serif'],
          },
          animation: {
            'fade-up': 'fadeUp 0.7s ease forwards',
            'fade-in': 'fadeIn 0.6s ease forwards',
            'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
            'ticker': 'ticker 20s linear infinite',
            'shimmer': 'shimmer 2.5s linear infinite',
            'glow-pulse': 'glowPulse 3s ease-in-out infinite',
          },
          keyframes: {
            fadeUp: { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
            fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
            ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
            shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
            glowPulse: { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 0.9 } },
          },
        },
      },
    };
  </script>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { background: #0a0a0a; color: #f0f0f0; font-family: 'Inter', sans-serif; overflow-x: hidden; }
 
    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
 
    /* Noise overlay */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      background-size: 256px 256px;
      opacity: 0.4;
    }
 
    .font-display { font-family: 'Syne', sans-serif; }
    .font-mono { font-family: 'DM Mono', monospace; }
 
    /* Hero glow blobs */
    .glow-blob {
      position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
      animation: glowPulse 4s ease-in-out infinite;
    }
 
    /* Card glow on hover */
    .feature-card {
      border: 1px solid #1e1e1e;
      background: #111111;
      transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
      position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: ''; position: absolute; inset: 0; border-radius: inherit;
      background: radial-gradient(circle at 30% 30%, rgba(0,229,255,0.04), transparent 60%);
      opacity: 0; transition: opacity 0.3s ease;
    }
    .feature-card:hover { border-color: #00e5ff33; transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,229,255,0.06); }
    .feature-card:hover::before { opacity: 1; }
 
    /* Step connector line */
    .step-connector { flex: 1; height: 1px; background: linear-gradient(90deg, #1e1e1e 0%, #00e5ff44 50%, #1e1e1e 100%); }
 
    /* Ticker */
    .ticker-wrapper { overflow: hidden; }
    .ticker-track { display: flex; width: max-content; animation: ticker 28s linear infinite; }
    .ticker-track:hover { animation-play-state: paused; }
 
    /* Shimmer skeleton */
    .shimmer {
      background: linear-gradient(90deg, #1a1a1a 0%, #252525 50%, #1a1a1a 100%);
      background-size: 800px 100%; animation: shimmer 2.5s linear infinite;
    }
 
    /* Pricing glow border */
    .price-card-featured {
      border: 1px solid rgba(0,229,255,0.3);
      box-shadow: 0 0 60px rgba(0,229,255,0.08), inset 0 1px 0 rgba(0,229,255,0.1);
    }
 
    /* Scroll reveal */
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }
    .reveal-delay-6 { transition-delay: 0.6s; }
 
    /* Nav blur */
    .navbar-blur { backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); }
 
    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, #00e5ff 60%, #3b82f6 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
 
    /* CTA button primary */
    .btn-primary {
      background: linear-gradient(135deg, #00e5ff 0%, #0099cc 100%);
      color: #0a0a0a; font-weight: 600; letter-spacing: -0.01em;
      transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 0 20px rgba(0,229,255,0.3);
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 40px rgba(0,229,255,0.5); }
 
    .btn-secondary {
      border: 1px solid #2a2a2a; color: #9a9a9a;
      transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
    }
    .btn-secondary:hover { border-color: #444; color: #f0f0f0; background: #141414; }
 
    /* Dashboard mock */
    .dash-bar { border-radius: 2px; transition: height 0.3s ease; }
 
    /* Testimonial card */
    .testimonial-card { border: 1px solid #1a1a1a; background: #111111; transition: border-color 0.3s ease; }
    .testimonial-card:hover { border-color: #2a2a2a; }
 
    /* Logo gradient */
    .logo-text {
      background: linear-gradient(135deg, #ffffff 0%, #00e5ff 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
 
    /* Divider */
    .section-divider { height: 1px; background: linear-gradient(90deg, transparent 0%, #1e1e1e 20%, #1e1e1e 80%, transparent 100%); }
 
    /* Tag pill */
    .tag-pill { background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.18); color: #00e5ff; }
 
    /* Risk meter */
    @keyframes fillBar { from { width: 0; } to { width: var(--fill); } }
    .risk-fill { animation: fillBar 1.5s ease forwards; }
 
    /* Green dot pulse */
    .status-dot { width: 7px; height: 7px; background: #00ff94; border-radius: 50%; }
    .status-dot::after {
      content: ''; position: absolute; inset: -4px; border-radius: 50%;
      background: rgba(0,255,148,0.25); animation: pulse 2s ease infinite;
    }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.8); opacity: 0; } }
  </style>
</head>
<body class="relative">
 
<!-- ─── TICKER BAR ─────────────────────────────────────────────────── -->
<div class="relative z-50 border-b border-[#141414] bg-[#080808] py-2 overflow-hidden">
  <div class="ticker-wrapper">
    <div class="ticker-track font-mono text-xs text-[#444]">
      <span class="mx-8 text-green-500">ES1! <span class="text-[#00ff94]">+0.34%</span> 5,847.25</span>
      <span class="mx-8">NQ1! <span class="text-[#00ff94]">+0.51%</span> 20,412.50</span>
      <span class="mx-8 text-red-400">RTY1! <span class="text-red-400">-0.12%</span> 2,084.10</span>
      <span class="mx-8">YM1! <span class="text-[#00ff94]">+0.28%</span> 43,215.00</span>
      <span class="mx-8">CL1! <span class="text-[#00ff94]">+0.87%</span> 78.42</span>
      <span class="mx-8 text-red-400">GC1! <span class="text-red-400">-0.19%</span> 2,341.60</span>
      <span class="mx-8">6E1! <span class="text-[#00ff94]">+0.22%</span> 1.0834</span>
      <span class="mx-8">BTC <span class="text-[#00ff94]">+2.14%</span> 68,412.00</span>
      <span class="mx-8">FTSE 100 <span class="text-[#00ff94]">+0.45%</span> 8,124.30</span>
      <span class="mx-8">DAX <span class="text-[#00ff94]">+0.63%</span> 18,732.50</span>
      <!-- duplicate for seamless loop -->
      <span class="mx-8 text-green-500">ES1! <span class="text-[#00ff94]">+0.34%</span> 5,847.25</span>
      <span class="mx-8">NQ1! <span class="text-[#00ff94]">+0.51%</span> 20,412.50</span>
      <span class="mx-8 text-red-400">RTY1! <span class="text-red-400">-0.12%</span> 2,084.10</span>
      <span class="mx-8">YM1! <span class="text-[#00ff94]">+0.28%</span> 43,215.00</span>
      <span class="mx-8">CL1! <span class="text-[#00ff94]">+0.87%</span> 78.42</span>
      <span class="mx-8 text-red-400">GC1! <span class="text-red-400">-0.19%</span> 2,341.60</span>
      <span class="mx-8">6E1! <span class="text-[#00ff94]">+0.22%</span> 1.0834</span>
      <span class="mx-8">BTC <span class="text-[#00ff94]">+2.14%</span> 68,412.00</span>
    </div>
  </div>
</div>
 
<!-- ─── NAVBAR ─────────────────────────────────────────────────────── -->
<nav id="navbar" class="sticky top-0 z-40 border-b border-[#141414] navbar-blur bg-[#0a0a0aCC] transition-all duration-300">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
 
      <!-- Logo -->
      <a href="#" class="flex items-center gap-2.5 group">
        <div class="relative w-7 h-7 flex-shrink-0">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <path d="M14 2L4 7v7c0 5.25 4.27 10.17 10 11.38C19.73 24.17 24 19.25 24 14V7L14 2z" fill="url(#shieldGrad)" opacity="0.9"/>
            <path d="M10 13.5l3 3 6-6" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="shieldGrad" x1="4" y1="2" x2="24" y2="25" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00e5ff"/>
                <stop offset="1" stop-color="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute inset-0 rounded-full bg-cyan-500/20 blur-md group-hover:bg-cyan-500/30 transition-all"></div>
        </div>
        <span class="logo-text font-display font-700 text-lg tracking-tight">PropGuard</span>
      </a>
 
      <!-- Desktop Links -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-sm text-[#666] hover:text-[#f0f0f0] transition-colors duration-200 font-body">Features</a>
        <a href="#solutions" class="text-sm text-[#666] hover:text-[#f0f0f0] transition-colors duration-200 font-body">Solutions</a>
        <a href="#pricing" class="text-sm text-[#666] hover:text-[#f0f0f0] transition-colors duration-200 font-body">Pricing</a>
        <a href="#" class="text-sm text-[#666] hover:text-[#f0f0f0] transition-colors duration-200 font-body">Docs</a>
      </div>
 
      <!-- CTAs -->
      <div class="flex items-center gap-3">
        <a href="#" class="hidden sm:block text-sm text-[#666] hover:text-[#f0f0f0] transition-colors duration-200 px-3 py-2">Login</a>
        <a href="#" class="btn-primary font-display text-sm px-5 py-2.5 rounded-lg">Get Started →</a>
        <!-- Mobile menu button -->
        <button id="mobileMenuBtn" class="md:hidden p-2 text-[#666] hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
 
    <!-- Mobile Menu -->
    <div id="mobileMenu" class="hidden md:hidden pb-4 border-t border-[#141414] mt-2 pt-4">
      <div class="flex flex-col gap-3">
        <a href="#features" class="text-sm text-[#666] hover:text-[#f0f0f0] py-1">Features</a>
        <a href="#solutions" class="text-sm text-[#666] hover:text-[#f0f0f0] py-1">Solutions</a>
        <a href="#pricing" class="text-sm text-[#666] hover:text-[#f0f0f0] py-1">Pricing</a>
        <a href="#" class="text-sm text-[#666] hover:text-[#f0f0f0] py-1">Docs</a>
        <a href="#" class="text-sm text-[#666] hover:text-[#f0f0f0] py-1">Login</a>
      </div>
    </div>
  </div>
</nav>
 
<!-- ─── HERO ───────────────────────────────────────────────────────── -->
<section class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-24">
 
  <!-- Glow blobs -->
  <div class="glow-blob w-[600px] h-[400px] bg-cyan-500/10 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4" style="animation-delay:0s;"></div>
  <div class="glow-blob w-[400px] h-[400px] bg-blue-500/8 top-1/3 left-1/4" style="animation-delay:1.5s;"></div>
  <div class="glow-blob w-[300px] h-[300px] bg-cyan-400/6 bottom-1/4 right-1/4" style="animation-delay:0.8s;"></div>
 
  <!-- Grid lines decoration -->
  <div class="absolute inset-0 z-0 opacity-[0.025]" style="background-image: linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px); background-size: 80px 80px;"></div>
 
  <div class="relative z-10 max-w-5xl mx-auto text-center">
 
    <!-- Tag -->
    <div class="inline-flex items-center gap-2 tag-pill text-xs font-mono px-4 py-1.5 rounded-full mb-8 reveal">
      <span class="relative status-dot inline-block"></span>
      <span>Live · 1,400+ traders protected</span>
    </div>
 
    <!-- Headline -->
    <h1 class="font-display font-800 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tighter mb-8 reveal reveal-delay-1">
      <span class="block text-[#f0f0f0]">Trade with</span>
      <span class="block gradient-text">discipline.</span>
      <span class="block text-[#f0f0f0]">Scale with</span>
      <span class="block gradient-text">confidence.</span>
    </h1>
 
    <!-- Sub-headline -->
    <p class="max-w-2xl mx-auto text-lg sm:text-xl text-[#666] leading-relaxed mb-12 reveal reveal-delay-2 font-body">
      PropGuard gives prop traders a unified command center — track accounts across all major firms, monitor drawdowns in real-time, and protect your funded status with intelligent rule-based guardrails.
    </p>
 
    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 reveal reveal-delay-3">
      <a href="#" class="btn-primary font-display w-full sm:w-auto px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        Open Dashboard
      </a>
      <a href="#dashboard" class="btn-secondary w-full sm:w-auto px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2 font-body">
        <svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Watch Demo
      </a>
    </div>
 
    <!-- Social proof strip -->
    <div class="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-[#3a3a3a] reveal reveal-delay-4 font-mono">
      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff94]"></span>FTMO Compatible</span>
      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff94]"></span>MyFundedFutures</span>
      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff94]"></span>Apex Trader</span>
      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff94]"></span>TopStep</span>
      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff94]"></span>E8 Markets</span>
      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff94]"></span>The Funded Trader</span>
    </div>
  </div>
 
  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#333] reveal reveal-delay-5">
    <span class="font-mono text-xs tracking-[0.2em] uppercase">Scroll</span>
    <div class="w-px h-12 bg-gradient-to-b from-[#333] to-transparent"></div>
  </div>
</section>
 
<!-- ─── STATS BAR ──────────────────────────────────────────────────── -->
<div class="section-divider"></div>
<div class="bg-[#0d0d0d] py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="text-center reveal">
        <div class="font-display font-800 text-3xl sm:text-4xl text-[#f0f0f0] tracking-tighter" data-count="1400">1,400+</div>
        <div class="font-body text-sm text-[#555] mt-1">Active Traders</div>
      </div>
      <div class="text-center reveal reveal-delay-1">
        <div class="font-display font-800 text-3xl sm:text-4xl gradient-text tracking-tighter">$2.8M+</div>
        <div class="font-body text-sm text-[#555] mt-1">Funded Capital Tracked</div>
      </div>
      <div class="text-center reveal reveal-delay-2">
        <div class="font-display font-800 text-3xl sm:text-4xl text-[#f0f0f0] tracking-tighter">12</div>
        <div class="font-body text-sm text-[#555] mt-1">Prop Firms Supported</div>
      </div>
      <div class="text-center reveal reveal-delay-3">
        <div class="font-display font-800 text-3xl sm:text-4xl gradient-text tracking-tighter">99.9%</div>
        <div class="font-body text-sm text-[#555] mt-1">Uptime SLA</div>
      </div>
    </div>
  </div>
</div>
<div class="section-divider"></div>
 
<!-- ─── FEATURES ───────────────────────────────────────────────────── -->
<section id="features" class="relative py-28 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
 
    <div class="max-w-2xl mb-20 reveal">
      <span class="font-mono text-xs text-[#00e5ff] tracking-[0.2em] uppercase block mb-4">Features</span>
      <h2 class="font-display font-700 text-4xl sm:text-5xl text-[#f0f0f0] tracking-tight leading-tight mb-6">Everything a prop trader needs.<br><span class="text-[#444]">Nothing they don't.</span></h2>
      <p class="font-body text-[#555] text-lg leading-relaxed">Built from the ground up by prop traders who understand the rules, the risk, and the grind. One dashboard to rule them all.</p>
    </div>
 
    <div id="solutions" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 
      <!-- Feature cards -->
      <div class="feature-card p-6 rounded-2xl reveal">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Multi-Account Management</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Manage unlimited funded, evaluation, and live accounts from a single unified view. FTMO, MyFundedFutures, Apex, TopStep, and more.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal reveal-delay-1">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Real-Time P&L Tracking</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Live profit and loss visualization across all accounts. Daily, weekly, and total cumulative P&L with breakdown by instrument and session.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal reveal-delay-2">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Drawdown & Risk Control</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Live daily drawdown, trailing drawdown, and max drawdown meters. Color-coded alerts before you breach firm limits — never lose a funded account silently.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal reveal-delay-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">EOD Data & Journaling</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">End-of-day summaries auto-generated from your trades. Add notes, tag setups, review execution quality, and spot behavioral patterns over time.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal reveal-delay-4">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Performance Analytics</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Win rate, profit factor, average R:R, best/worst sessions. Identify your edge statistically and eliminate the leaks killing your consistency.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal reveal-delay-5">
        <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-[#00ff94]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Withdrawal Tracker</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Schedule, log, and track payouts from each firm. Know exactly when you're eligible, what you've withdrawn historically, and your net profit after splits.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Rule Compliance Engine</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Firm-specific rule sets encoded per account. Consistency rule violations, news trading blocks, minimum trading days — PropGuard watches so you don't have to.</p>
      </div>
 
      <div class="feature-card p-6 rounded-2xl reveal reveal-delay-1">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </div>
        <h3 class="font-display font-600 text-base text-[#f0f0f0] mb-2">Smart Alerts & Discipline Tools</h3>
        <p class="font-body text-sm text-[#555] leading-relaxed">Pre-trade checklists, revenge-trading cooldown timers, daily loss circuit-breakers, and SMS/email alerts. Build discipline into your workflow structurally.</p>
      </div>
 
    </div>
  </div>
</section>
 
<!-- ─── HOW IT WORKS ───────────────────────────────────────────────── -->
<div class="section-divider"></div>
<section class="py-28 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d]">
  <div class="max-w-7xl mx-auto">
 
    <div class="text-center max-w-2xl mx-auto mb-20 reveal">
      <span class="font-mono text-xs text-[#00e5ff] tracking-[0.2em] uppercase block mb-4">How It Works</span>
      <h2 class="font-display font-700 text-4xl sm:text-5xl text-[#f0f0f0] tracking-tight">Up and running in minutes.</h2>
      <p class="font-body text-[#555] text-lg mt-4">No CSV uploads. No manual entry. Just connect, configure, and trade with full clarity.</p>
    </div>
 
    <div class="relative flex flex-col md:flex-row items-start gap-8 md:gap-0">
 
      <!-- Step 1 -->
      <div class="relative flex-1 reveal">
        <div class="flex flex-col items-center text-center px-6">
          <div class="relative mb-6">
            <div class="w-14 h-14 rounded-2xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center">
              <span class="font-mono text-sm text-[#00e5ff]">01</span>
            </div>
            <div class="absolute -inset-2 rounded-2xl bg-cyan-500/5 blur-md"></div>
          </div>
          <h3 class="font-display font-600 text-lg text-[#f0f0f0] mb-3">Connect Your Firm</h3>
          <p class="font-body text-sm text-[#555] leading-relaxed max-w-xs">Select your prop firm from our list of 12+ integrations and enter your credentials. PropGuard pulls your account data securely via read-only API tokens.</p>
        </div>
      </div>
 
      <div class="hidden md:flex items-center pt-7 px-2">
        <div class="step-connector w-16"></div>
        <svg class="w-3 h-3 text-[#00e5ff44] -ml-1" fill="currentColor" viewBox="0 0 10 10"><path d="M5 0l5 5-5 5V0z"/></svg>
      </div>
 
      <!-- Step 2 -->
      <div class="relative flex-1 reveal reveal-delay-1">
        <div class="flex flex-col items-center text-center px-6">
          <div class="relative mb-6">
            <div class="w-14 h-14 rounded-2xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center">
              <span class="font-mono text-sm text-[#00e5ff]">02</span>
            </div>
            <div class="absolute -inset-2 rounded-2xl bg-cyan-500/5 blur-md"></div>
          </div>
          <h3 class="font-display font-600 text-lg text-[#f0f0f0] mb-3">Configure Rules & Alerts</h3>
          <p class="font-body text-sm text-[#555] leading-relaxed max-w-xs">Set your firm-specific drawdown thresholds, enable smart alerts, configure discipline tools, and tailor the dashboard to your exact trading style and goals.</p>
        </div>
      </div>
 
      <div class="hidden md:flex items-center pt-7 px-2">
        <div class="step-connector w-16"></div>
        <svg class="w-3 h-3 text-[#00e5ff44] -ml-1" fill="currentColor" viewBox="0 0 10 10"><path d="M5 0l5 5-5 5V0z"/></svg>
      </div>
 
      <!-- Step 3 -->
      <div class="relative flex-1 reveal reveal-delay-2">
        <div class="flex flex-col items-center text-center px-6">
          <div class="relative mb-6">
            <div class="w-14 h-14 rounded-2xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center">
              <span class="font-mono text-sm text-[#00e5ff]">03</span>
            </div>
            <div class="absolute -inset-2 rounded-2xl bg-cyan-500/5 blur-md"></div>
          </div>
          <h3 class="font-display font-600 text-lg text-[#f0f0f0] mb-3">Trade With Clarity</h3>
          <p class="font-body text-sm text-[#555] leading-relaxed max-w-xs">Open PropGuard alongside your trading platform. Watch live P&L, drawdown status, and compliance indicators update tick-by-tick throughout your session.</p>
        </div>
      </div>
 
      <div class="hidden md:flex items-center pt-7 px-2">
        <div class="step-connector w-16"></div>
        <svg class="w-3 h-3 text-[#00e5ff44] -ml-1" fill="currentColor" viewBox="0 0 10 10"><path d="M5 0l5 5-5 5V0z"/></svg>
      </div>
 
      <!-- Step 4 -->
      <div class="relative flex-1 reveal reveal-delay-3">
        <div class="flex flex-col items-center text-center px-6">
          <div class="relative mb-6">
            <div class="w-14 h-14 rounded-2xl bg-[#111] border border-[#00e5ff33] flex items-center justify-center" style="box-shadow: 0 0 20px rgba(0,229,255,0.1);">
              <span class="font-mono text-sm text-[#00e5ff]">04</span>
            </div>
            <div class="absolute -inset-2 rounded-2xl bg-cyan-500/8 blur-md"></div>
          </div>
          <h3 class="font-display font-600 text-lg text-[#f0f0f0] mb-3">Review & Improve</h3>
          <p class="font-body text-sm text-[#555] leading-relaxed max-w-xs">After market close, review your EOD summary, journal your trades, analyze performance stats, and let PropGuard surface insights you'd otherwise miss.</p>
        </div>
      </div>
    </div>
  </div>
</section>
<div class="section-divider"></div>
 
<!-- ─── DASHBOARD PREVIEW ──────────────────────────────────────────── -->
<section id="dashboard" class="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
 
  <div class="glow-blob w-[500px] h-[300px] bg-cyan-500/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
 
  <div class="max-w-7xl mx-auto relative z-10">
    <div class="text-center max-w-2xl mx-auto mb-16 reveal">
      <span class="font-mono text-xs text-[#00e5ff] tracking-[0.2em] uppercase block mb-4">Dashboard</span>
      <h2 class="font-display font-700 text-4xl sm:text-5xl text-[#f0f0f0] tracking-tight">Your command center.</h2>
      <p class="font-body text-[#555] text-lg mt-4">Every number that matters, in one place, at a glance.</p>
    </div>
 
    <!-- Dashboard Mock UI -->
    <div class="reveal rounded-2xl border border-[#1a1a1a] overflow-hidden" style="box-shadow: 0 40px 120px rgba(0,229,255,0.06), 0 0 0 1px rgba(0,229,255,0.05);">
 
      <!-- Window bar -->
      <div class="bg-[#0e0e0e] border-b border-[#1a1a1a] px-5 py-3 flex items-center gap-3">
        <div class="flex gap-2">
          <div class="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
          <div class="w-3 h-3 rounded-full bg-[#febc2e]"></div>
          <div class="w-3 h-3 rounded-full bg-[#28c840]"></div>
        </div>
        <div class="flex-1 mx-8 bg-[#161616] rounded-md h-6 flex items-center px-4">
          <span class="font-mono text-xs text-[#333]">propguard.app/dashboard</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs font-mono text-[#444]">
          <span class="relative status-dot inline-block"></span>
          <span class="text-[#00ff94]">Live</span>
        </div>
      </div>
 
      <div class="bg-[#0c0c0c] p-4 sm:p-6">
        <div class="grid grid-cols-12 gap-4">
 
          <!-- Left sidebar mock -->
          <div class="col-span-2 hidden lg:flex flex-col gap-2">
            <div class="shimmer h-4 rounded w-3/4 mb-4"></div>
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg bg-cyan-500/8 border border-cyan-500/15">
              <div class="w-3 h-3 rounded bg-[#00e5ff]/60"></div>
              <div class="h-2.5 rounded bg-[#00e5ff]/30 flex-1"></div>
            </div>
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#141414]">
              <div class="w-3 h-3 rounded bg-[#333]"></div>
              <div class="h-2.5 rounded bg-[#222] flex-1"></div>
            </div>
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#141414]">
              <div class="w-3 h-3 rounded bg-[#333]"></div>
              <div class="h-2.5 rounded bg-[#222] flex-1"></div>
            </div>
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#141414]">
              <div class="w-3 h-3 rounded bg-[#333]"></div>
              <div class="h-2.5 rounded bg-[#222] flex-1"></div>
            </div>
            <div class="mt-4 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#141414]">
              <div class="w-3 h-3 rounded bg-[#333]"></div>
              <div class="h-2.5 rounded bg-[#222] flex-1"></div>
            </div>
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#141414]">
              <div class="w-3 h-3 rounded bg-[#333]"></div>
              <div class="h-2.5 rounded bg-[#222] flex-1"></div>
            </div>
          </div>
 
          <!-- Main content -->
          <div class="col-span-12 lg:col-span-10 flex flex-col gap-4">
 
            <!-- Top stat cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                <div class="font-mono text-xs text-[#444] mb-2">NET P&L TODAY</div>
                <div class="font-display font-700 text-xl text-[#00ff94]">+$1,248.50</div>
                <div class="font-mono text-xs text-[#00ff94]/60 mt-1">▲ 2.48%</div>
              </div>
              <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                <div class="font-mono text-xs text-[#444] mb-2">DRAWDOWN</div>
                <div class="font-display font-700 text-xl text-[#f0f0f0]">-$420.00</div>
                <div class="w-full h-1 bg-[#1a1a1a] rounded-full mt-2">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#00e5ff] to-[#3b82f6]" style="width: 21%;"></div>
                </div>
                <div class="font-mono text-xs text-[#444] mt-1">21% of limit</div>
              </div>
              <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                <div class="font-mono text-xs text-[#444] mb-2">ACCOUNTS</div>
                <div class="font-display font-700 text-xl text-[#f0f0f0]">4 Active</div>
                <div class="flex gap-1 mt-2">
                  <span class="px-1.5 py-0.5 rounded text-xs font-mono bg-green-500/10 text-[#00ff94]">2 Funded</span>
                  <span class="px-1.5 py-0.5 rounded text-xs font-mono bg-yellow-500/10 text-yellow-400">2 Eval</span>
                </div>
              </div>
              <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                <div class="font-mono text-xs text-[#444] mb-2">WIN RATE</div>
                <div class="font-display font-700 text-xl text-[#f0f0f0]">67.4%</div>
                <div class="font-mono text-xs text-[#444] mt-1">14W / 7L this week</div>
              </div>
            </div>
 
            <!-- P&L Chart mock -->
            <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="font-display font-600 text-sm text-[#f0f0f0]">Cumulative P&L</div>
                  <div class="font-mono text-xs text-[#444]">Last 30 days · ES1!</div>
                </div>
                <div class="flex gap-2">
                  <button class="px-3 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 text-[#00e5ff] border border-cyan-500/20">1D</button>
                  <button class="px-3 py-1 rounded-lg text-xs font-mono text-[#444]">1W</button>
                  <button class="px-3 py-1 rounded-lg text-xs font-mono text-[#444]">1M</button>
                </div>
              </div>
              <!-- Chart area -->
              <div class="relative h-28 flex items-end gap-1">
                <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 112">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.15"/>
                      <stop offset="100%" stop-color="#00e5ff" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0 90 Q20 85 40 80 Q60 75 80 65 Q100 55 120 60 Q140 65 160 55 Q180 45 200 42 Q220 39 240 35 Q260 30 280 25 Q300 20 320 18 Q340 15 360 12 Q380 10 400 8" fill="none" stroke="#00e5ff" stroke-width="1.5" opacity="0.8"/>
                  <path d="M0 90 Q20 85 40 80 Q60 75 80 65 Q100 55 120 60 Q140 65 160 55 Q180 45 200 42 Q220 39 240 35 Q260 30 280 25 Q300 20 320 18 Q340 15 360 12 Q380 10 400 8 L400 112 L0 112 Z" fill="url(#chartGrad)"/>
                  <!-- Grid lines -->
                  <line x1="0" y1="28" x2="400" y2="28" stroke="#1e1e1e" stroke-width="0.5"/>
                  <line x1="0" y1="56" x2="400" y2="56" stroke="#1e1e1e" stroke-width="0.5"/>
                  <line x1="0" y1="84" x2="400" y2="84" stroke="#1e1e1e" stroke-width="0.5"/>
                  <!-- Tooltip dot -->
                  <circle cx="320" cy="18" r="3" fill="#00e5ff"/>
                  <line x1="320" y1="18" x2="320" y2="112" stroke="#00e5ff" stroke-width="0.5" stroke-dasharray="3,3"/>
                </svg>
                <!-- Y-axis labels -->
                <div class="absolute right-0 top-0 flex flex-col justify-between h-full text-right pr-1">
                  <span class="font-mono text-[10px] text-[#333]">+$3.2k</span>
                  <span class="font-mono text-[10px] text-[#333]">+$1.6k</span>
                  <span class="font-mono text-[10px] text-[#333]">$0</span>
                </div>
              </div>
            </div>
 
            <!-- Bottom row: drawdown meters + trade log -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
 
              <!-- Drawdown meters -->
              <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                <div class="font-display font-600 text-sm text-[#f0f0f0] mb-4">Risk Meters</div>
                <div class="flex flex-col gap-3">
                  <div>
                    <div class="flex justify-between font-mono text-xs text-[#444] mb-1.5">
                      <span>Daily Loss Limit</span><span class="text-[#00ff94]">$420 / $2,000</span>
                    </div>
                    <div class="h-1.5 bg-[#1a1a1a] rounded-full">
                      <div class="h-full rounded-full bg-gradient-to-r from-[#00ff94] to-[#00cc77]" style="width: 21%;"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between font-mono text-xs text-[#444] mb-1.5">
                      <span>Trailing Drawdown</span><span class="text-yellow-400">$3,240 / $5,000</span>
                    </div>
                    <div class="h-1.5 bg-[#1a1a1a] rounded-full">
                      <div class="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400" style="width: 65%;"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between font-mono text-xs text-[#444] mb-1.5">
                      <span>Max Drawdown</span><span class="text-[#00e5ff]">$5,800 / $10,000</span>
                    </div>
                    <div class="h-1.5 bg-[#1a1a1a] rounded-full">
                      <div class="h-full rounded-full bg-gradient-to-r from-[#00e5ff] to-[#3b82f6]" style="width: 58%;"></div>
                    </div>
                  </div>
                </div>
              </div>
 
              <!-- Recent trades log -->
              <div class="bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
                <div class="font-display font-600 text-sm text-[#f0f0f0] mb-4">Recent Trades</div>
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between py-1.5 border-b border-[#161616]">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded text-xs font-mono bg-green-500/10 text-[#00ff94]">L</span>
                      <span class="font-mono text-xs text-[#888]">ES · 2 Contracts</span>
                    </div>
                    <span class="font-mono text-xs text-[#00ff94]">+$625.00</span>
                  </div>
                  <div class="flex items-center justify-between py-1.5 border-b border-[#161616]">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded text-xs font-mono bg-red-500/10 text-red-400">S</span>
                      <span class="font-mono text-xs text-[#888]">NQ · 1 Contract</span>
                    </div>
                    <span class="font-mono text-xs text-red-400">-$187.50</span>
                  </div>
                  <div class="flex items-center justify-between py-1.5 border-b border-[#161616]">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded text-xs font-mono bg-green-500/10 text-[#00ff94]">L</span>
                      <span class="font-mono text-xs text-[#888]">ES · 3 Contracts</span>
                    </div>
                    <span class="font-mono text-xs text-[#00ff94]">+$937.50</span>
                  </div>
                  <div class="flex items-center justify-between py-1.5">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded text-xs font-mono bg-green-500/10 text-[#00ff94]">L</span>
                      <span class="font-mono text-xs text-[#888]">CL · 1 Contract</span>
                    </div>
                    <span class="font-mono text-xs text-[#00ff94]">+$440.00</span>
                  </div>
                </div>
              </div>
 
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
 
<!-- ─── TESTIMONIALS ───────────────────────────────────────────────── -->
<div class="section-divider"></div>
<section class="py-28 px-4 sm:px-6 lg:px-8 bg-[#0d0d0d]">
  <div class="max-w-7xl mx-auto">
 
    <div class="text-center max-w-xl mx-auto mb-16 reveal">
      <span class="font-mono text-xs text-[#00e5ff] tracking-[0.2em] uppercase block mb-4">Testimonials</span>
      <h2 class="font-display font-700 text-4xl sm:text-5xl text-[#f0f0f0] tracking-tight">Trusted by funded traders.</h2>
    </div>
 
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 
      <div class="testimonial-card p-6 rounded-2xl reveal">
        <div class="flex items-center gap-1 mb-4">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <p class="font-body text-[#888] text-sm leading-relaxed mb-6">"I was constantly anxious about breaching my trailing drawdown on Apex. PropGuard's real-time meter changed everything. I passed my evaluation on the first attempt after setting it up. It's genuinely the most important tool in my stack."</p>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-[#2a2a2a] flex items-center justify-center font-display font-600 text-sm text-[#f0f0f0]">MK</div>
          <div>
            <div class="font-display font-600 text-sm text-[#f0f0f0]">Marcus K.</div>
            <div class="font-body text-xs text-[#444]">ES Futures Trader · Apex Trader Funding</div>
          </div>
        </div>
      </div>
 
      <div class="testimonial-card p-6 rounded-2xl reveal reveal-delay-1">
        <div class="flex items-center gap-1 mb-4">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <p class="font-body text-[#888] text-sm leading-relaxed mb-6">"Running 6 accounts across FTMO and MyFundedFutures was a nightmare until I found PropGuard. The multi-account view alone saves me 45 minutes every morning. The performance analytics helped me realise I was trading terribly on Mondays. I cut that day out completely."</p>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-[#2a2a2a] flex items-center justify-center font-display font-600 text-sm text-[#f0f0f0]">AL</div>
          <div>
            <div class="font-display font-600 text-sm text-[#f0f0f0]">Alyssa L.</div>
            <div class="font-body text-xs text-[#444]">NQ & Gold Trader · FTMO + MFF</div>
          </div>
        </div>
      </div>
 
      <div class="testimonial-card p-6 rounded-2xl reveal reveal-delay-2">
        <div class="flex items-center gap-1 mb-4">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <p class="font-body text-[#888] text-sm leading-relaxed mb-6">"The discipline cooldown timer is the feature I didn't know I needed. After a losing trade I used to immediately re-enter out of emotion. PropGuard forced me to wait 15 minutes. It sounds simple but it's added thousands to my monthly net."</p>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-green-500/30 to-cyan-500/30 border border-[#2a2a2a] flex items-center justify-center font-display font-600 text-sm text-[#f0f0f0]">TR</div>
          <div>
            <div class="font-display font-600 text-sm text-[#f0f0f0]">Tom R.</div>
            <div class="font-body text-xs text-[#444]">Crude Oil Trader · TopStep Funded</div>
          </div>
        </div>
      </div>
 
    </div>
 
    <!-- Trust logos -->
    <div class="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-30 reveal">
      <span class="font-mono text-sm text-[#666]">FTMO</span>
      <span class="w-px h-4 bg-[#2a2a2a]"></span>
      <span class="font-mono text-sm text-[#666]">Apex Trader Funding</span>
      <span class="w-px h-4 bg-[#2a2a2a]"></span>
      <span class="font-mono text-sm text-[#666]">MyFundedFutures</span>
      <span class="w-px h-4 bg-[#2a2a2a]"></span>
      <span class="font-mono text-sm text-[#666]">TopStep</span>
      <span class="w-px h-4 bg-[#2a2a2a]"></span>
      <span class="font-mono text-sm text-[#666]">E8 Markets</span>
      <span class="w-px h-4 bg-[#2a2a2a]"></span>
      <span class="font-mono text-sm text-[#666]">The Funded Trader</span>
    </div>
  </div>
</section>
 
<!-- ─── PRICING ─────────────────────────────────────────────────────── -->
<div class="section-divider"></div>
<section id="pricing" class="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
 
  <div class="glow-blob w-[500px] h-[300px] bg-cyan-500/6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
 
  <div class="max-w-5xl mx-auto relative z-10">
 
    <div class="text-center max-w-2xl mx-auto mb-16 reveal">
      <span class="font-mono text-xs text-[#00e5ff] tracking-[0.2em] uppercase block mb-4">Pricing</span>
      <h2 class="font-display font-700 text-4xl sm:text-5xl text-[#f0f0f0] tracking-tight mb-4">Simple, honest pricing.</h2>
      <p class="font-body text-[#555] text-lg">Start free. Scale when you need to. Cancel anytime. No hidden fees.</p>
    </div>
 
    <!-- Open Source Badge -->
    <div class="mb-10 flex justify-center reveal">
      <div class="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[#1e1e1e] bg-[#0e0e0e]">
        <svg class="w-5 h-5 text-[#555]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        <span class="font-body text-sm text-[#555]">PropGuard is <span class="text-[#f0f0f0]">open-source</span> and <span class="text-[#f0f0f0]">self-hostable</span> — full codebase on GitHub</span>
        <a href="https://github.com" class="font-mono text-xs text-[#00e5ff] hover:underline">View on GitHub →</a>
      </div>
    </div>
 
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
 
      <!-- Free -->
      <div class="feature-card p-7 rounded-2xl reveal">
        <div class="font-display font-600 text-base text-[#f0f0f0] mb-1">Starter</div>
        <div class="font-body text-sm text-[#444] mb-6">For traders just getting started</div>
        <div class="font-display font-700 text-4xl text-[#f0f0f0] mb-1">$0<span class="text-base font-400 text-[#444]">/mo</span></div>
        <div class="font-mono text-xs text-[#333] mb-8">Free forever</div>
        <ul class="flex flex-col gap-3 mb-8 font-body text-sm text-[#666]">
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Up to 2 accounts</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>P&L tracking</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Drawdown meters</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>7-day trade history</li>
          <li class="flex items-center gap-2 opacity-40"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Analytics</li>
          <li class="flex items-center gap-2 opacity-40"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Alerts & discipline tools</li>
        </ul>
        <a href="#" class="btn-secondary w-full py-3 rounded-xl text-sm font-body text-center block transition-all">Get Started Free</a>
      </div>
 
      <!-- Pro - Featured -->
      <div class="price-card-featured p-7 rounded-2xl relative reveal reveal-delay-1">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2">
          <span class="tag-pill font-mono text-xs px-3 py-1 rounded-full">Most Popular</span>
        </div>
        <div class="font-display font-600 text-base text-[#f0f0f0] mb-1">Pro</div>
        <div class="font-body text-sm text-[#444] mb-6">For serious funded traders</div>
        <div class="font-display font-700 text-4xl text-[#f0f0f0] mb-1">$19<span class="text-base font-400 text-[#444]">/mo</span></div>
        <div class="font-mono text-xs text-[#333] mb-8">Billed monthly</div>
        <ul class="flex flex-col gap-3 mb-8 font-body text-sm text-[#888]">
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Unlimited accounts</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Real-time P&L + drawdown</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Full performance analytics</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Alerts (email + SMS)</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Discipline tools</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>EOD journaling + withdrawal log</li>
        </ul>
        <a href="#" class="btn-primary w-full py-3 rounded-xl text-sm font-display font-600 text-center block transition-all">Start 14-Day Free Trial →</a>
      </div>
 
      <!-- Team -->
      <div class="feature-card p-7 rounded-2xl reveal reveal-delay-2">
        <div class="font-display font-600 text-base text-[#f0f0f0] mb-1">Team</div>
        <div class="font-body text-sm text-[#444] mb-6">For trading groups & mentors</div>
        <div class="font-display font-700 text-4xl text-[#f0f0f0] mb-1">$49<span class="text-base font-400 text-[#444]">/mo</span></div>
        <div class="font-mono text-xs text-[#333] mb-8">Up to 5 users</div>
        <ul class="flex flex-col gap-3 mb-8 font-body text-sm text-[#666]">
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Everything in Pro</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Multi-user access</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Mentor oversight view</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Team leaderboard</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Priority support</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-[#00e5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Custom rule sets</li>
        </ul>
        <a href="#" class="btn-secondary w-full py-3 rounded-xl text-sm font-body text-center block transition-all">Contact Sales</a>
      </div>
 
    </div>
  </div>
</section>
 
<!-- ─── FINAL CTA ──────────────────────────────────────────────────── -->
<div class="section-divider"></div>
<section class="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
  <div class="glow-blob w-[600px] h-[300px] bg-cyan-500/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
  <div class="max-w-3xl mx-auto text-center relative z-10 reveal">
    <h2 class="font-display font-700 text-4xl sm:text-5xl md:text-6xl text-[#f0f0f0] tracking-tight leading-tight mb-6">
      Stop guessing.<br><span class="gradient-text">Start guarding.</span>
    </h2>
    <p class="font-body text-[#555] text-lg mb-10 leading-relaxed">Join over 1,400 prop traders who use PropGuard to protect their funded accounts, sharpen their discipline, and scale with confidence.</p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="#" class="btn-primary font-display w-full sm:w-auto px-10 py-4 rounded-xl text-base">Get Started — It's Free →</a>
      <a href="https://github.com" class="btn-secondary w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-body flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        Self-host on GitHub
      </a>
    </div>
  </div>
</section>
 
<!-- ─── FOOTER ─────────────────────────────────────────────────────── -->
<div class="section-divider"></div>
<footer class="bg-[#080808] py-14 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
 
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2.5 mb-4">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
            <path d="M14 2L4 7v7c0 5.25 4.27 10.17 10 11.38C19.73 24.17 24 19.25 24 14V7L14 2z" fill="url(#shieldGrad2)" opacity="0.9"/>
            <path d="M10 13.5l3 3 6-6" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="shieldGrad2" x1="4" y1="2" x2="24" y2="25" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00e5ff"/>
                <stop offset="1" stop-color="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text font-display font-700 text-base tracking-tight">PropGuard</span>
        </div>
        <p class="font-body text-xs text-[#333] leading-relaxed mb-5">The ultimate dashboard for prop traders. Open-source, self-hostable, and built for serious funded accounts.</p>
        <a href="https://github.com" class="inline-flex items-center gap-2 text-xs font-mono text-[#444] hover:text-[#888] transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          github.com/propguard
        </a>
      </div>
 
      <div>
        <div class="font-display font-600 text-xs text-[#333] uppercase tracking-[0.15em] mb-5">Product</div>
        <ul class="flex flex-col gap-3">
          <li><a href="#features" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Features</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Changelog</a></li>
          <li><a href="#pricing" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Pricing</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Roadmap</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">API Docs</a></li>
        </ul>
      </div>
 
      <div>
        <div class="font-display font-600 text-xs text-[#333] uppercase tracking-[0.15em] mb-5">Resources</div>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Documentation</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Self-Hosting Guide</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Firm Integrations</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Community Discord</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Status Page</a></li>
        </ul>
      </div>
 
      <div>
        <div class="font-display font-600 text-xs text-[#333] uppercase tracking-[0.15em] mb-5">Legal</div>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Privacy Policy</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Terms of Service</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">Cookie Policy</a></li>
          <li><a href="#" class="font-body text-sm text-[#444] hover:text-[#888] transition-colors">MIT License</a></li>
        </ul>
      </div>
 
    </div>
 
    <div class="section-divider mb-8"></div>
 
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="font-mono text-xs text-[#2a2a2a]">© 2025 PropGuard. Open source under MIT License.</p>
      <p class="font-mono text-xs text-[#222]">Not financial advice. PropGuard is a management tool, not a broker or fund.</p>
    </div>
  </div>
</footer>
</html>`;

  useEffect(() => {
    // Re-execute your custom JS (mobile menu, scroll reveals, counters, etc.)
    const script = document.createElement('script');
    script.innerHTML = `
      // Mobile menu toggle
      const btn = document.getElementById('mobileMenuBtn');
      const menu = document.getElementById('mobileMenu');
      if (btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
        menu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => menu.classList.add('hidden'));
        });
      }
      // Scroll reveal
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

      // Navbar scroll effect
      const navbar = document.getElementById('navbar');
      if (navbar) {
        window.addEventListener('scroll', () => {
          navbar.style.borderBottomColor = window.scrollY > 20 ? '#1a1a1a' : '#141414';
        });
      }

      // Counter animation
      function animateCounter(el, target, suffix) {
        const duration = 1600;
        const start = performance.now();
        const update = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          const value = Math.floor(eased * target);
          el.textContent = value.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
      }
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = true;
            const count = parseInt(entry.target.dataset.count || '0');
            const suffix = entry.target.dataset.suffix || '+';
            if (count) animateCounter(entry.target, count, suffix);
          }
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('[data-count]').forEach(el => statsObserver.observe(el));
    `;
    document.body.appendChild(script);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: landingHTML }} />;
}
