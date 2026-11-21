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
  const [balance, setBalance] = useState(2811);
  const [todayProfit, setTodayProfit] = useState(2341);
  const [startCapital, setStartCapital] = useState(470);
  const [multiplier, setMultiplier] = useState(6.0);
  const [clockStr, setClockStr] = useState("02:48:16");
  const [activeAgentIndex, setActiveAgentIndex] = useState(3);

  // Video-matched full trade log roster
  const [stillnessLogs, setStillnessLogs] = useState([
    { symbol: "$PIP", icon: "🐣", dev: "bought · sold +170%", status: "+$595", isPositive: true, action: "bought · sold +170%" },
    { symbol: "$JELLY", icon: "🍮", dev: "bought · sold +255%", status: "+$1,785", isPositive: true, action: "bought · sold +255%" },
    { symbol: "$SPLIT", icon: "🪓", dev: "dev moved · cut early", status: "-$39", isNegative: true, action: "dev moved · cut early" },
    { symbol: "$TANGO", icon: "🦩", dev: "bought · sold +225%", status: "+$2,700", isPositive: true, action: "bought · sold +225%" },
    { symbol: "$KIWI", icon: "🥝", dev: "bought · sold +135%", status: "+$1,080", isPositive: true, action: "bought · sold +135%" },
    { symbol: "$GLIDE", icon: "🪁", dev: "bought · sold +105%", status: "+$1,050", isPositive: true, action: "bought · sold +105%" },
    { symbol: "$ONYX", icon: "🪨", dev: "skipped · bundles 47%", status: "SKIPPED", isSkipped: true, action: "skipped · bundles 47%" },
    { symbol: "$HUSH", icon: "🦉", dev: "skipped · dev 28%", status: "SKIPPED", isSkipped: true, action: "skipped · dev 28%" },
  ]);

  // Active Coin Pipeline (Currently on screen)
  const [activeCoin, setActiveCoin] = useState({
    symbol: "$ONYX",
    name: "Onyx Token",
    age: "10s old",
    mc: "$21.0K",
    entryPrice: 350,
    devHolding: "3%",
    bundles: "47%",
    devHistory: "no prior rugs",
    index: "05 / 09",
    statusText: "SKIPPED",
    statusDetail: "47% bundled by snipers",
    orderStatus: "NO ORDER SENT"
  });

  // 5 Bots Roster for desktop
  const botsList = [
    { name: "Scanner", color: "#64d2ff", stat: "38 pools", status: "→ Analyst", note: "PumpSwap 60fps" },
    { name: "Analyst", color: "#ffd60a", stat: "12 audited", status: "Score 86", note: "Social +0.4 · 8/8" },
    { name: "Brain", color: "#bf5af2", stat: "Sizing", status: "$2.00 · 20%", note: "80+ = full size" },
    { name: "Executor", color: "#00d35a", stat: "3 trades", status: "✓ Bought", note: "dip entry -15%" },
    { name: "Risk", color: "#ff6b9a", stat: "Guarding", status: "stop -25%", note: "trail 40% armed" }
  ];

  // Canvas Ref for Animated Radar Motion (Desktop)
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);

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

      // Blips
      const blips = [
        { x: cx + 45, y: cy - 35, sym: "$JELLY", col: "#00D35A" },
        { x: cx - 60, y: cy + 40, sym: "$PIP", col: "#38BDF8" },
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
      
      {/* 1. Universal Responsive Header */}
      <header className="w-full bg-[#080808]/95 backdrop-blur-xl border-b border-[#161616] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D35A] inline-block animate-ping"></span>
            <span className="font-extrabold text-sm tracking-wider text-white">GROK BOT · STILLNESS DESK</span>
            <span className="text-[10px] text-[#64748B] hidden md:inline font-mono">
              pump.fun terminal · built by Grok · @silenceinwater
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8094AE]">
            <span className="text-[#00D35A] font-bold">● LIVE STILLNESS</span>
            <span>|</span>
            <span>CAPITAL: ${balance.toLocaleString()}</span>
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

      {/* 2. Responsive Workstation: Mobile (visible on < md) vs Desktop (visible on md+) */}
      
      {/* ========================================================================= */}
      {/* EXACT STILLNESS DESK MOBILE TERMINAL (Matching Video @oxpips pixel-for-pixel) */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full max-w-[440px] mx-auto py-2 px-3">
        <div className="w-full bg-[#000000] p-3 flex flex-col gap-4 select-none">
          
          {/* iOS Dynamic Status Bar */}
          <div className="flex items-center justify-between text-xs font-semibold px-2 pt-1">
            <span className="tracking-tight text-sm font-bold text-white">{clockStr.slice(0, 5)}</span>
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="text-[11px]">5G</span>
              <span className="text-[11px] font-bold">85%</span>
              <div className="w-5 h-2.5 border border-white/70 rounded-xs p-0.5 flex items-center">
                <div className="h-full bg-white rounded-2xs" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>

          {/* Header Info: Logo + Grok Bot + STILLNESS DESK Pill + LIVE Pill */}
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
                  pump.fun terminal &bull; built by Grok &bull; @silenceinwater
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00D35A]">
              <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-ping"></span>
              <span className="tracking-wider">LIVE</span>
            </div>
          </div>

          {/* Balance Card with Circular Multiplier Meter */}
          <div className="p-5 rounded-[28px] bg-[#141518] flex items-center justify-between shadow-2xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B9B]">BALANCE</span>
              <div className="text-4xl font-black text-white tracking-tight tabular-nums mt-0.5">
                ${balance.toLocaleString()}
              </div>
              <div className="text-xs font-medium text-[#00D35A] mt-1">
                +${todayProfit.toLocaleString()} today &bull; <span className="text-[#7E8B9B]">started with ${startCapital}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 rounded-full border-4 border-white/20 border-t-[#00D35A] border-r-[#00D35A] flex items-center justify-center bg-black/30">
                <span className="text-sm font-black text-white">{multiplier}x</span>
              </div>
              <span className="text-[9px] text-[#7E8B9B] mt-1 font-mono">night session</span>
            </div>
          </div>

          {/* FOUND ON PUMP.FUN Primary Interactive Card ($ONYX / $PIP / $JELLY) */}
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
                <div className="w-14 h-14 rounded-full bg-[#E5E9EE] flex items-center justify-center text-3xl shadow">
                  🪨
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

              <div className="p-2.5 rounded-2xl bg-[#231E18] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] font-bold text-[#D97706] uppercase">
                  <span>BUNDLES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                </div>
                <div className="text-sm font-black text-[#F59E0B] mt-1">{activeCoin.bundles}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#1C1E23] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[8px] font-bold text-[#7E8B9B] uppercase">
                  <span>DEV HISTORY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-[10px] font-bold text-[#00D35A] mt-1 truncate">{activeCoin.devHistory}</div>
              </div>
            </div>

            {/* 4-Step Pipeline Stepper (Exact Video styling) */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#7E8B9B] uppercase pb-2">
                <span>FOUND</span>
                <span>RUG CHECK</span>
                <span>SKIPPED</span>
                <span>SOLD</span>
              </div>
              <div className="relative flex items-center justify-between px-1">
                <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-[#2B2F38] -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-3 w-1/4 h-0.5 bg-[#00D35A] -translate-y-1/2 z-0"></div>
                <div className="w-6 h-6 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-black z-10 shadow">✓</div>
                <div className="w-6 h-6 rounded-full bg-[#D97706] text-black flex items-center justify-center text-xs font-black z-10 shadow">✕</div>
                <div className="w-6 h-6 rounded-full bg-[#1C1E23] border border-[#3A3F4D] text-[#7E8B9B] flex items-center justify-center text-xs z-10"></div>
                <div className="w-6 h-6 rounded-full bg-[#1C1E23] border border-[#3A3F4D] text-[#7E8B9B] flex items-center justify-center text-xs z-10"></div>
              </div>
            </div>

            {/* Status Announcement in Card */}
            <div className="pt-2">
              <div className="text-xl font-black text-[#E09A24] tracking-tight">{activeCoin.statusText}</div>
              <div className="text-xs text-[#E09A24] font-medium mt-0.5">{activeCoin.statusDetail}</div>
            </div>

            {/* Bottom Button Banner */}
            <div className="w-full py-2.5 rounded-xl bg-[#231A12] border border-[#382614] text-center text-xs font-bold text-[#D97706] tracking-wider uppercase">
              {activeCoin.orderStatus}
            </div>
          </div>

          {/* Trade Log Section (Exact Video match with 8 full entries) */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-white tracking-tight">Trade log</h2>
              <span className="text-[11px] font-mono text-[#7E8B9B]">3 traded &bull; 2 skipped</span>
            </div>

            <div className="flex flex-col gap-2">
              {stillnessLogs.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 rounded-2xl bg-[#141518] flex items-center justify-between transition-transform active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#24262C] flex items-center justify-center text-lg shadow-inner">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{item.symbol}</div>
                      <div className="text-[11px] text-[#7E8B9B] font-mono">{item.action}</div>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-black tracking-tight ${
                      item.isPositive
                        ? "text-[#00D35A]"
                        : item.isNegative
                        ? "text-[#FF453A]"
                        : "text-[#D97706]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom "View session report" Pill Button */}
            <button className="w-full py-4 mt-2 rounded-[28px] bg-white text-black font-extrabold text-sm tracking-tight text-center hover:bg-white/90 shadow-xl transition-all active:scale-98">
              View session report
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP EXPERIENCE: Multi-Column Trading Terminal with Live Radar & Swarm */}
      {/* ========================================================================= */}
      <main className="hidden md:grid flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-6 grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account Metrics + Pump.fun Active Token Panel (5 cols) */}
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
                ${balance.toLocaleString()}
              </div>
              <div className="text-sm text-[#00D35A] font-semibold mt-2 flex items-center gap-2">
                <span>+${todayProfit.toLocaleString()} today</span>
                <span className="text-[#64748B]">&bull;</span>
                <span className="text-[#8094AE]">started with ${startCapital}</span>
              </div>
            </div>

            {/* Multiplier Ring */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#00D35A] border-t-white/20 flex flex-col items-center justify-center bg-black/60 shadow-inner">
                <span className="text-xl font-black text-white">{multiplier}x</span>
                <span className="text-[8px] text-[#00D35A] font-bold uppercase">GAIN</span>
              </div>
              <span className="text-[10px] text-[#64748B] mt-1.5 font-mono">night session</span>
            </div>
          </div>

          {/* Autonomous Stream Sine Wave Banner */}
          <AutonomousWave height={110} label="AUTONOMOUS STREAM · LIQUIDITY OSCILLATION" />

          {/* Found on Pump.fun Token Inspection Card ($JELLY) */}
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

              <div className="w-14 h-14 rounded-2xl bg-[#F4D06F]/10 border border-[#F4D06F]/30 flex items-center justify-center text-3xl shadow-lg">
                🪨
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

              <div className="p-3 rounded-xl bg-[#231E18] border border-[#382614]">
                <div className="flex items-center justify-between text-[10px] text-[#D97706] uppercase font-bold">
                  <span>BUNDLES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                </div>
                <div className="text-base font-black text-[#F59E0B] mt-1">{activeCoin.bundles}</div>
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
                <span>3. SKIPPED</span>
                <span>4. SOLD</span>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#181818] -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-1/4 h-1 bg-[#00D35A] -translate-y-1/2 z-0"></div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#D97706] text-black flex items-center justify-center text-xs font-bold z-10 shadow">✕</div>
                <div className="w-7 h-7 rounded-full bg-[#141518] border-2 border-[#3A3F4D] text-[#7E8B9B] flex items-center justify-center text-xs z-10">&bull;</div>
                <div className="w-7 h-7 rounded-full bg-[#141518] border-2 border-[#3A3F4D] text-[#7E8B9B] flex items-center justify-center text-xs z-10">&bull;</div>
              </div>
            </div>

            {/* Position Active Indicator */}
            <div className="p-4 rounded-xl bg-[#141518] border border-[#202228] flex items-center justify-between">
              <div>
                <div className="text-xs font-black tracking-wide text-[#E09A24] uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E09A24] animate-pulse"></span>
                  SKIPPED · BUNDLED 47%
                </div>
                <div className="text-[11px] text-[#8094AE] font-mono mt-1">
                  Protective Audit: Anti-Sniper defense saved entry capital
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#D97706] font-mono">NO ORDER SENT</div>
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

        {/* Right Column: Live Radar Scanner Canvas & Execution Terminal (7 cols) */}
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
                  <div className="text-2xl font-black text-white mt-1">$470 &rarr; $7,641</div>
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

          {/* Desktop Positions & Order Ledger Tabs */}
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
                  STILLNESS TRADE LOG (8)
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
              <div className="flex flex-col gap-2">
                {stillnessLogs.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#141518] border border-[#202228] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#24262C] flex items-center justify-center text-sm">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span>{item.symbol}</span>
                        </div>
                        <div className="text-[11px] text-[#7E8B9B] font-mono mt-0.5">{item.action}</div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black ${
                        item.isPositive
                          ? "text-[#00D35A]"
                          : item.isNegative
                          ? "text-[#FF453A]"
                          : "text-[#D97706]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
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
                <div>[02:48:01] Scanner: $ONYX qualified &mdash; pool age &gt; 10s, liquidity $21,000.</div>
                <div>[02:48:02] Analyst: Bundles 47% &gt; 25% threshold &mdash; RUG CHECK TRIGGERED.</div>
                <div>[02:48:03] Risk Manager: VETO &mdash; SKIPPED: 47% bundled by snipers. NO ORDER SENT.</div>
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
