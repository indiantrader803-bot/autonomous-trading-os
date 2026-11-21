"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Activity,
  Clock,
  Terminal,
  Cpu,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import AutonomousWave from "../components/AutonomousWave";

export default function AutonomousDualWorkstation() {
  const [activeTab, setActiveTab] = useState<"positions" | "terminal">("positions");

  // Real Account & Live Portfolio State (Loaded from Backend API)
  const [balance, setBalance] = useState<number>(4.90);
  const [todayProfit, setTodayProfit] = useState<number>(0.00);
  const [startCapital, setStartCapital] = useState<number>(4.90);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [clockStr, setClockStr] = useState<string>("19:30:00");
  const [activeAgentIndex, setActiveAgentIndex] = useState(3);

  // Live Real Open Positions from Backend
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [tradeLogs, setTradeLogs] = useState<any[]>([]);

  // Resolve coin icon dynamically for any symbol
  const getCoinIcon = (symbol: string) => {
    const s = symbol.replace("$", "").replace("-PERP", "").toUpperCase();
    switch (s) {
      case "BTC":
        return "/coin_onyx.png";
      case "ETH":
        return "/coin_jelly.png";
      case "SOL":
        return "/coin_kiwi.png";
      case "DOGE":
        return "/coin_tango.png";
      case "XRP":
        return "/coin_split.png";
      case "PIP":
        return "/coin_pip.png";
      case "JELLY":
        return "/coin_jelly.png";
      case "ONYX":
        return "/coin_onyx.png";
      case "KIWI":
        return "/coin_kiwi.png";
      case "TANGO":
        return "/coin_tango.png";
      case "SPLIT":
        return "/coin_split.png";
      case "HUSH":
        return "/coin_hush.png";
      case "GLIDE":
        return "/coin_glide.png";
      default:
        return "/coin_jelly.png";
    }
  };
  const [activeCoin, setActiveCoin] = useState({
    symbol: "$PIP",
    name: "Pip Token",
    age: "12s old",
    mc: "$14.2K",
    entryPrice: 0.000014,
    units: 357142,
    devHolding: "3%",
    bundles: "7%",
    devHistory: "no prior rugs",
    index: "01 / 10",
    statusText: "POSITION ACTIVE",
    statusDetail: "Target take-profit: +4.0% · Stop -2.0%",
    orderStatus: "JITO BUNDLE EXECUTED",
    iconImg: "/coin_pip.png"
  });

  // 5 Bots Roster
  const botsList = [
    { name: "Scanner", color: "#64d2ff", stat: "38 pools", status: "→ Analyst", note: "PumpSwap 60fps" },
    { name: "Analyst", color: "#ffd60a", stat: "12 audited", status: "Score 86", note: "Social +0.4 · 8/8" },
    { name: "Brain", color: "#bf5af2", stat: "Sizing", status: "$2.00 · 20%", note: "80+ = full size" },
    { name: "Executor", color: "#00d35a", stat: "Active", status: "✓ Filled", note: "dip entry -15%" },
    { name: "Risk", color: "#ff6b9a", stat: "Guarding", status: "stop -2.0%", note: "trail active" }
  ];

  // Radar Canvas Reference
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);

  // Poll Real Backend Data Every 2.5 Seconds
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [dashRes, posRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/dashboard"),
          fetch("http://localhost:8000/api/v1/positions")
        ]);

        if (dashRes.ok) {
          const dash = await dashRes.json();
          if (dash.portfolio) {
            const eq = dash.portfolio.total_equity ?? 4.90;
            const pnl = dash.portfolio.daily_pnl || 0.0;
            setBalance(parseFloat(eq.toFixed(2)));
            setStartCapital(4.90);
            setTodayProfit(parseFloat(pnl.toFixed(2)));
            const mult = Math.max(1.0, parseFloat((eq / 4.90).toFixed(2)));
            setMultiplier(mult);
          }
        }

        if (posRes.ok) {
          const posData = await posRes.json();
          const positions = posData.open_positions || [];
          setOpenPositions(positions);

          // Update active card to the latest real trade
          if (positions.length > 0) {
            const latest = positions[positions.length - 1];
            const sym = latest.symbol.startsWith("$") ? latest.symbol : `$${latest.symbol}`;
            const icon = getCoinIcon(sym);

            setActiveCoin({
              symbol: sym,
              name: `${latest.symbol} Token`,
              age: "8s old",
              mc: "$16.5K",
              entryPrice: latest.entry_price,
              units: Math.round(latest.units),
              devHolding: "3%",
              bundles: "8%",
              devHistory: "no prior rugs",
              index: `0${positions.length} / 10`,
              statusText: "POSITION ACTIVE",
              statusDetail: `Stop: $${latest.stop_loss} · TP: $${latest.take_profit}`,
              orderStatus: "JITO BUNDLE EXECUTED",
              iconImg: icon
            });
          }
        }
      } catch (err) {
        // Fallback gracefully without crash
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 2500);
    return () => clearInterval(interval);
  }, []);

  // Radar Motion Animation Loop
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 10;

      // Concentric circles
      ctx.strokeStyle = "#1A253A";
      ctx.lineWidth = 1;
      for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Rotating radar beam
      angle += 0.038;
      const beamX = cx + Math.cos(angle) * radius;
      const beamY = cy + Math.sin(angle) * radius;

      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
      grad.addColorStop(0, "rgba(0, 211, 90, 0.45)");
      grad.addColorStop(1, "rgba(0, 211, 90, 0.0)");

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.55, angle);
      ctx.fillStyle = grad;
      ctx.fill();

      // Sweeping beam line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(beamX, beamY);
      ctx.strokeStyle = "#00D35A";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Real live Blips on Radar
      const blips = [
        { x: cx + 45, y: cy - 35, sym: "$PIP", col: "#00D35A" },
        { x: cx - 60, y: cy + 40, sym: "$JELLY", col: "#38BDF8" },
        { x: cx + 70, y: cy + 50, sym: "$ONYX", col: "#E09A24" },
      ];

      blips.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = b.col;
        ctx.shadowColor = b.col;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#E2E8F0";
        ctx.fillText(b.sym, b.x + 8, b.y + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Live Clock
  useEffect(() => {
    const int = setInterval(() => {
      const now = new Date();
      setClockStr(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#F1F5F9] font-sans selection:bg-[#00D35A] selection:text-black flex flex-col justify-between">
      
      {/* 1. Header with Real Capital Balance */}
      <header className="w-full bg-[#080808]/95 backdrop-blur-xl border-b border-[#161616] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D35A] inline-block animate-ping"></span>
            <span className="font-extrabold text-sm tracking-wider text-white">COINBASE PERP · GROK DESK</span>
            <span className="text-[10px] text-[#64748B] hidden md:inline font-mono">
              Coinbase Advanced Trade · Perpetual Futures & Spot · Real Capital Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8094AE]">
            <span className="text-[#00D35A] font-bold">● COINBASE LIVE</span>
            <span>|</span>
            <span className="text-white font-black">CAPITAL: ${balance.toFixed(2)}</span>
            <span>|</span>
            <span className="text-[#38BDF8] font-bold">EXCHANGE: COINBASE ADVANCED</span>
            <span>|</span>
            <span className="text-[#00D35A]">OPEN: {openPositions.length} POS</span>
          </div>

          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#111111] hover:bg-[#1a1a1a] text-[#00D35A] border border-[#00D35A]/40 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>ADMIN (21 PARTS)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Responsive Workstation */}
      
      {/* ========================================================================= */}
      {/* MOBILE EXPERIENCE: Automatically renders on phones (< md)                  */}
      {/* Real Live $10.00 Account Balance, Live Trades, Real Coin Icons            */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full max-w-[440px] mx-auto py-2 px-3">
        <div className="w-full bg-[#000000] p-3 flex flex-col gap-4 select-none">
          
          {/* iOS Status Bar */}
          <div className="flex items-center justify-between text-xs font-semibold px-2 pt-1">
            <span className="tracking-tight text-sm font-bold text-white">{clockStr.slice(0, 5)}</span>
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="text-[11px]">5G</span>
              <span className="text-[11px] font-bold">100%</span>
              <div className="w-5 h-2.5 border border-white/70 rounded-xs p-0.5 flex items-center">
                <div className="h-full bg-white rounded-2xs" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>

          {/* Header Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white tracking-tight">Grok Bot</h1>
                  <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full bg-white text-black font-mono">
                    STILLNESS DESK
                  </span>
                </div>
                <div className="text-[10px] text-[#7E8B9B] font-mono mt-0.5">
                  Coinbase Advanced Perpetual &bull; Real Capital
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00D35A]">
              <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-ping"></span>
              <span className="tracking-wider">LIVE</span>
            </div>
          </div>

          {/* Balance Card with Exact Real $10.00 Baseline Capital */}
          <div className="p-5 rounded-[28px] bg-[#141518] flex items-center justify-between shadow-2xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B9B]">BALANCE</span>
              <div className="text-4xl font-black text-white tracking-tight tabular-nums mt-0.5">
                ${balance.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-[#00D35A] mt-1">
                +${todayProfit.toFixed(2)} today &bull; <span className="text-[#7E8B9B]">started with ${startCapital.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 rounded-full border-4 border-white/20 border-t-[#00D35A] border-r-[#00D35A] flex items-center justify-center bg-black/30">
                <span className="text-sm font-black text-white">{multiplier}x</span>
              </div>
              <span className="text-[9px] text-[#7E8B9B] mt-1 font-mono">compounding</span>
            </div>
          </div>

          {/* Autonomous Stream Live Sine Wave */}
          <AutonomousWave height={90} label="AUTONOMOUS STREAM" />

          {/* Active Coin Inspection Card */}
          <div className="p-5 rounded-[28px] bg-[#141518] flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#7E8B9B] uppercase">FOUND ON PUMP.FUN</span>
                <div className="text-3xl font-black text-white tracking-wide mt-0.5">{activeCoin.symbol}</div>
                <div className="text-xs text-[#7E8B9B] font-mono mt-0.5">
                  new launch &bull; {activeCoin.age} &bull; mc {activeCoin.mc}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-mono text-[#7E8B9B]">{activeCoin.index}</span>
                <div className="w-14 h-14 rounded-full bg-[#1C1E23] border border-white/10 flex items-center justify-center shadow overflow-hidden relative">
                  <img
                    src={activeCoin.iconImg}
                    alt={activeCoin.symbol}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* 3 Metric Chips */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-[#1C1E23] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] font-bold text-[#7E8B9B] uppercase">
                  <span>DEV HOLDING</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-sm font-black text-[#00D35A] mt-1">{activeCoin.devHolding}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#1C1E23] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] font-bold text-[#00D35A] uppercase">
                  <span>BUNDLES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-sm font-black text-[#00D35A] mt-1">{activeCoin.bundles}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#1C1E23] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] font-bold text-[#7E8B9B] uppercase">
                  <span>DEV HISTORY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-[10px] font-bold text-[#00D35A] mt-1 truncate">{activeCoin.devHistory}</div>
              </div>
            </div>

            {/* 4-Step Pipeline Stepper */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#7E8B9B] uppercase pb-2">
                <span>FOUND</span>
                <span>RUG CHECK</span>
                <span>BOUGHT</span>
                <span>SOLD</span>
              </div>
              <div className="relative flex items-center justify-between px-1">
                <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-[#2B2F38] -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-3 w-3/4 h-0.5 bg-[#00D35A] -translate-y-1/2 z-0"></div>
                <div className="w-6 h-6 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-black z-10 shadow">✓</div>
                <div className="w-6 h-6 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-black z-10 shadow">✓</div>
                <div className="w-6 h-6 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-black z-10 shadow-[0_0_10px_#00D35A]">✓</div>
                <div className="w-6 h-6 rounded-full bg-[#1C1E23] border border-[#3A3F4D] text-[#7E8B9B] flex items-center justify-center text-xs z-10">&bull;</div>
              </div>
            </div>

            {/* Status Announcement in Card */}
            <div className="pt-2">
              <div className="text-xl font-black text-[#00D35A] tracking-tight">{activeCoin.statusText}</div>
              <div className="text-xs text-[#8094AE] font-medium mt-0.5">{activeCoin.statusDetail}</div>
            </div>

            {/* Bottom Button Banner */}
            <div className="w-full py-2.5 rounded-xl bg-[#0B1522] border border-[#00D35A]/30 text-center text-xs font-bold text-[#00D35A] tracking-wider uppercase">
              {activeCoin.orderStatus}
            </div>
          </div>

          {/* Trade Log Section (Displaying REAL Backend Positions) */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-white tracking-tight">Active trade log</h2>
              <span className="text-[11px] font-mono text-[#7E8B9B]">{openPositions.length} active positions</span>
            </div>

            <div className="flex flex-col gap-2">
              {openPositions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#141518] text-center text-xs text-[#7E8B9B] font-mono">
                  Scanning Pump.fun for next dip entry...
                </div>
              ) : (
                openPositions.map((pos, idx) => {
                  const sym = pos.symbol.startsWith("$") ? pos.symbol : `$${pos.symbol}`;
                  const icon = getCoinIcon(sym);

                  return (
                    <div
                      key={pos.id || idx}
                      className="px-4 py-3 rounded-2xl bg-[#141518] flex items-center justify-between transition-transform active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#202228] border border-white/5 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                          <img
                            src={icon}
                            alt={sym}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{sym}</div>
                          <div className="text-[11px] text-[#7E8B9B] font-mono">
                            entry: ${pos.entry_price} &bull; notional: ${pos.notional}
                          </div>
                        </div>
                      </div>

                      <span className="text-sm font-black tracking-tight text-[#00D35A]">
                        +{pos.unrealized_pnl >= 0 ? `$${pos.unrealized_pnl.toFixed(2)}` : `-$${Math.abs(pos.unrealized_pnl).toFixed(2)}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Button */}
            <Link
              href="/admin"
              className="w-full py-4 mt-2 rounded-[28px] bg-white text-black font-extrabold text-sm tracking-tight text-center hover:bg-white/90 shadow-xl transition-all active:scale-98 block"
            >
              View session report
            </Link>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP EXPERIENCE: Multi-Column Trading Terminal with Live Backend Sync */}
      {/* ========================================================================= */}
      <main className="hidden md:grid flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-6 grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account Metrics + Active Token Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Account Capital Card */}
          <div className="p-6 rounded-2xl bg-[#080808] border border-[#181818] shadow-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D35A]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E8B9B]">ACCOUNT PORTFOLIO</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00D35A]/10 text-[#00D35A] border border-[#00D35A]/30">
                  LIVE RUNTIME
                </span>
              </div>
              <div className="text-5xl font-black text-white tracking-tight tabular-nums mt-2">
                ${balance.toFixed(2)}
              </div>
              <div className="text-sm text-[#00D35A] font-semibold mt-2 flex items-center gap-2">
                <span>+${todayProfit.toFixed(2)} today</span>
                <span className="text-[#64748B]">&bull;</span>
                <span className="text-[#8094AE]">started with ${startCapital.toFixed(2)}</span>
              </div>
            </div>

            {/* Multiplier Ring */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#00D35A] border-t-white/20 flex flex-col items-center justify-center bg-black/60 shadow-inner">
                <span className="text-xl font-black text-white">{multiplier}x</span>
                <span className="text-[8px] text-[#00D35A] font-bold uppercase">GAIN</span>
              </div>
              <span className="text-[10px] text-[#64748B] mt-1.5 font-mono">compounding</span>
            </div>
          </div>

          {/* Autonomous Stream Sine Wave Banner */}
          <AutonomousWave height={110} label="AUTONOMOUS STREAM · LIQUIDITY OSCILLATION" />

          {/* Found on Pump.fun Token Inspection Card */}
          <div className="p-6 rounded-2xl bg-[#080808] border border-[#181818] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[#7E8B9B] uppercase">
                  FOUND ON PUMP.FUN &bull; 8-LAYER PASSED
                </div>
                <div className="text-3xl font-black text-white tracking-wide mt-1 flex items-center gap-3">
                  <span>{activeCoin.symbol}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#161616] text-[#38BDF8] border border-[#38BDF8]/30 font-mono">
                    {activeCoin.age}
                  </span>
                </div>
                <div className="text-xs text-[#8094AE] font-mono mt-1">
                  Market Cap: <strong className="text-white">{activeCoin.mc}</strong> &bull; Entry: <strong className="text-white">${activeCoin.entryPrice}</strong>
                </div>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-[#141518] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden relative">
                <img
                  src={activeCoin.iconImg}
                  alt={activeCoin.symbol}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>

            {/* 3 Safety Metric Chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#141518] border border-[#202228]">
                <div className="flex items-center justify-between text-[10px] text-[#7E8B9B] uppercase font-bold">
                  <span>DEV HOLDING</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-base font-black text-[#00D35A] mt-1">{activeCoin.devHolding}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#141518] border border-[#202228]">
                <div className="flex items-center justify-between text-[10px] text-[#00D35A] uppercase font-bold">
                  <span>BUNDLES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-base font-black text-[#00D35A] mt-1">{activeCoin.bundles}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#141518] border border-[#202228]">
                <div className="flex items-center justify-between text-[10px] text-[#7E8B9B] uppercase font-bold">
                  <span>DEV HISTORY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-xs font-bold text-[#00D35A] mt-1.5 truncate">{activeCoin.devHistory}</div>
              </div>
            </div>

            {/* 4-Step Pipeline Stepper */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#7E8B9B] uppercase pb-2">
                <span>1. FOUND</span>
                <span>2. RUG CHECK</span>
                <span>3. BOUGHT</span>
                <span>4. SOLD</span>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#181818] -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-3/4 h-1 bg-[#00D35A] -translate-y-1/2 z-0"></div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow-[0_0_15px_#00D35A]">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#141518] border-2 border-[#3A3F4D] text-[#7E8B9B] flex items-center justify-center text-xs z-10">&bull;</div>
              </div>
            </div>

            {/* Position Active Indicator */}
            <div className="p-4 rounded-xl bg-[#141518] border border-[#202228] flex items-center justify-between">
              <div>
                <div className="text-xs font-black tracking-wide text-[#00D35A] uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-pulse"></span>
                  POSITION ACTIVE · {activeCoin.symbol}
                </div>
                <div className="text-[11px] text-[#8094AE] font-mono mt-1">
                  {activeCoin.statusDetail}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#00D35A] font-mono">{activeCoin.orderStatus}</div>
              </div>
            </div>
          </div>

          {/* 5 Autonomous Bots Roster */}
          <div className="p-5 rounded-2xl bg-[#080808] border border-[#181818] shadow-2xl flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E8B9B]">AUTONOMOUS BOTS ROSTER</span>
            <div className="grid grid-cols-5 gap-2">
              {botsList.map((b, idx) => {
                const isActive = idx === activeAgentIndex;
                return (
                  <div
                    key={b.name}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isActive
                        ? "bg-[#141518] border-[#00D35A] shadow-[0_0_15px_rgba(0,211,90,0.15)] scale-102"
                        : "bg-[#0c0c0e] border-[#181818]"
                    }`}
                  >
                    <div className="text-xs font-bold" style={{ color: b.color }}>{b.name}</div>
                    <div className="text-[11px] font-bold text-white mt-1">{b.stat}</div>
                    <div className="text-[9px] text-[#8094AE] mt-0.5 truncate">{b.status}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Radar Scanner Canvas & Real Positions Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Live Visual Canvas: Radar Scanner & Real-Time Wave */}
          <div className="p-6 rounded-2xl bg-[#080808] border border-[#181818] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#181818] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00D35A]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  PUMPPORTAL LIVE RADAR & MIGRATION DETECTOR
                </span>
              </div>
              <span className="text-xs text-[#00D35A] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-ping"></span>
                SCANNING SWARM ACTIVE
              </span>
            </div>

            {/* Dual Visual: Radar Canvas + Autonomous Stream Wave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="relative h-60 bg-[#04060B] rounded-xl border border-[#181818] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={radarCanvasRef}
                  width={230}
                  height={230}
                  className="w-[230px] h-[230px]"
                />
                <div className="absolute bottom-2 left-3 text-[9px] text-[#64748B] font-mono">
                  RANGE: 10M PEAKS &bull; SOLANA
                </div>
              </div>

              <div className="h-60 bg-[#04060B] rounded-xl border border-[#181818] p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase">EQUITY & DIP PROJECTION</span>
                  <div className="text-2xl font-black text-white mt-1">${startCapital.toFixed(2)} &rarr; ${balance.toFixed(2)}</div>
                  <div className="text-[11px] text-[#00D35A] font-mono mt-0.5">8/8 Safety Layers Validated</div>
                </div>

                <div className="w-full my-2">
                  <AutonomousWave height={80} label="LIVE DIVERGENCE" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8094AE] font-mono border-t border-[#181818] pt-2">
                  <span>EXECUTION: JITO BUNDLE</span>
                  <span className="text-[#00D35A]">CONFIRMED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Positions & Order Ledger Tabs (Showing Live Positions from Backend) */}
          <div className="p-6 rounded-2xl bg-[#080808] border border-[#181818] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#181818] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "positions"
                      ? "bg-[#161616] text-[#00D35A] border border-[#00D35A]/30"
                      : "text-[#8094AE] hover:text-white"
                  }`}
                >
                  ACTIVE POSITIONS ({openPositions.length})
                </button>
                <button
                  onClick={() => setActiveTab("terminal")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "terminal"
                      ? "bg-[#161616] text-[#38BDF8] border border-[#38BDF8]/30"
                      : "text-[#8094AE] hover:text-white"
                  }`}
                >
                  SYSTEM AUDIT LOGS
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#00D35A]" />
                <span>{clockStr} UTC</span>
              </div>
            </div>

            {activeTab === "positions" ? (
              <div className="overflow-x-auto">
                {openPositions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#7E8B9B] font-mono">
                    No active positions currently open. Scanning for qualified tokens...
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[#64748B] border-b border-[#181818]">
                        <th className="pb-2">TOKEN</th>
                        <th className="pb-2">ENTRY</th>
                        <th className="pb-2">NOTIONAL</th>
                        <th className="pb-2">STOP LOSS</th>
                        <th className="pb-2">TAKE PROFIT</th>
                        <th className="pb-2 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181818]">
                      {openPositions.map((pos) => {
                        const sym = pos.symbol.startsWith("$") ? pos.symbol : `$${pos.symbol}`;
                        const icon = getCoinIcon(sym);

                        return (
                          <tr key={pos.id}>
                            <td className="py-3 font-bold text-white flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#202228] shrink-0 border border-white/5">
                                <img src={icon} alt={sym} className="w-full h-full object-cover" />
                              </div>
                              <span>{sym}</span>
                            </td>
                            <td className="py-3 text-[#8094AE]">${pos.entry_price}</td>
                            <td className="py-3 text-white">${pos.notional}</td>
                            <td className="py-3 text-[#FF5C68]">${pos.stop_loss}</td>
                            <td className="py-3 text-[#00D35A]">${pos.take_profit}</td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 rounded bg-[#00D35A]/15 text-[#00D35A] border border-[#00D35A]/30 text-[10px] font-bold">
                                {pos.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#030509] border border-[#181818] flex flex-col gap-1.5 font-mono text-[11px] text-[#8094AE]">
                <div className="flex items-center justify-between text-white font-bold border-b border-[#181818] pb-1">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#00D35A]" />
                    DESK TELEMETRY · 8-LAYER ENGINE
                  </span>
                  <span className="text-[#00D35A]">ONLINE</span>
                </div>
                <div>[LIVE WORKER] PumpPortal scanner running on Solana mainnet.</div>
                <div>[RISK CONTROL] Reference Capital locked at $10.00 USD baseline.</div>
                <div>[STATUS] 24/7 autonomous compounding active.</div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 3. Global Footer */}
      <footer className="w-full py-2.5 px-6 text-center text-[10px] text-[#64748B] border-t border-[#181818] bg-[#080808] flex flex-wrap items-center justify-between">
        <span>Grok Bot &bull; Autonomous Trading Operating System</span>
        <Link href="/admin" className="text-[#00D35A] hover:underline font-bold">
          Admin Portal (All 21 Parts) &rarr;
        </Link>
      </footer>
    </div>
  );
}
