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
  const [balance, setBalance] = useState(10.00);
  const [todayProfit, setTodayProfit] = useState(0.00);
  const [startCapital, setStartCapital] = useState(10.00);
  const [multiplier, setMultiplier] = useState(1.0);
  const [clockStr, setClockStr] = useState("18:50:00");
  const [activeAgentIndex, setActiveAgentIndex] = useState(3); // Executor

  // Active Coin Pipeline ($JELLY)
  const [activeCoin, setActiveCoin] = useState({
    symbol: "$JELLY",
    name: "Jelly Coin",
    age: "11s old",
    mc: "$17.6K",
    entryPrice: 2.00,
    pnlPct: 1.4,
    stage: 3,
    devHolding: "4%",
    bundles: "11%",
    devHistory: "no prior rugs"
  });

  // Recent Live Activity Stream
  const [tradeLogs, setTradeLogs] = useState([
    { symbol: "$HUSH", dev: "dev 28%", action: "skipped · failed dev check", status: "SKIPPED", isProfit: false, time: "18:24", icon: "🦉" },
    { symbol: "$PIP", dev: "dev 1.2%", action: "bought · sold +170%", status: "+$3.40", isProfit: true, time: "18:21", icon: "🐣" },
    { symbol: "$JELLY", dev: "dev 4%", action: "dip entry -15% · 8/8 green", status: "+1.4%", isProfit: true, time: "18:32", icon: "🍮" }
  ]);

  // 5 Bots Roster
  const botsList = [
    { name: "Scanner", color: "#64d2ff", stat: "38 pools", status: "→ Analyst", note: "PumpSwap 60fps" },
    { name: "Analyst", color: "#ffd60a", stat: "12 audited", status: "Score 86", note: "Social +0.4 · 8/8" },
    { name: "Brain", color: "#bf5af2", stat: "Sizing", status: "$2.00 · 20%", note: "80+ = full size" },
    { name: "Executor", color: "#00d35a", stat: "3 trades", status: "✓ Bought", note: "dip entry -15%" },
    { name: "Risk", color: "#ff6b9a", stat: "Guarding", status: "stop -25%", note: "trail 40% armed" }
  ];

  // Canvas Ref for Animated Radar Motion
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

      // Blips (Tokens found on curve)
      const blips = [
        { x: cx + 45, y: cy - 35, sym: "$JELLY", col: "#00D35A" },
        { x: cx - 60, y: cy + 40, sym: "$PIP", col: "#38BDF8" },
        { x: cx + 70, y: cy + 50, sym: "$HUSH", col: "#FF9F0A" },
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

  // Micro PnL & Agent cycle simulation
  useEffect(() => {
    const int = setInterval(() => {
      setActiveCoin(prev => {
        const delta = (Math.random() - 0.42) * 0.15;
        const newPct = parseFloat(Math.max(-5, Math.min(25, prev.pnlPct + delta)).toFixed(1));
        const profit = parseFloat(((newPct / 100) * 2.0).toFixed(2));
        setTodayProfit(profit);
        setBalance(parseFloat((10.0 + profit).toFixed(2)));
        setMultiplier(parseFloat((1.0 + (profit > 0 ? profit / 10 : 0)).toFixed(2)));
        return { ...prev, pnlPct: newPct };
      });
      setActiveAgentIndex(prev => (prev + 1) % 5);
    }, 3800);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#020408] text-[#F1F5F9] font-sans selection:bg-[#00D35A] selection:text-black flex flex-col justify-between">
      
      {/* 1. Universal Responsive Header */}
      <header className="w-full bg-[#060910]/95 backdrop-blur-xl border-b border-[#121A28] px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D35A] inline-block animate-ping"></span>
            <span className="font-extrabold text-sm tracking-wider text-white">GROK TRADING DESK</span>
            <span className="text-[10px] text-[#64748B] hidden md:inline font-mono">
              Pump.fun &bull; PumpPortal Lightning &bull; 8-Layer Safety Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8094AE]">
            <span className="text-[#00D35A] font-bold">● LIVE PAPER</span>
            <span>|</span>
            <span>CAPITAL: ${balance.toFixed(2)}</span>
          </div>

          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0B101A] hover:bg-[#162133] text-[#00D35A] border border-[#00D35A]/40 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>ADMIN (21 PARTS)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Responsive Workstation: Mobile (visible on < md) vs Desktop (visible on md+) */}
      
      {/* ========================================================================= */}
      {/* MOBILE EXPERIENCE: Automatically renders on mobile screens (< md)         */}
      {/* Clean iOS Terminal, Animated Sine Wave, Micro-Stepper, Zero Video Boxes   */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full max-w-[430px] mx-auto py-3 px-3">
        <div className="w-full bg-[#05070D] border border-[#172030] rounded-[48px] shadow-[0_0_80px_rgba(0,0,0,0.95)] p-5 flex flex-col gap-4 relative overflow-hidden ring-1 ring-white/10">
          
          {/* iOS Dynamic Island & Status Bar */}
          <div className="flex items-center justify-between text-xs font-semibold px-2 pt-1 select-none">
            <span className="tracking-tight text-sm font-bold">{clockStr.slice(0, 5)}</span>
            <div className="w-24 h-4 bg-[#0A0E18] rounded-full mx-auto"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#8094AE]">5G</span>
              <span className="text-[10px] font-bold">85%</span>
              <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                <div className="h-full bg-white rounded-xs" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>

          {/* Header Info */}
          <div className="flex items-center justify-between pt-2 pb-2 px-1 border-b border-[#141C2B]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#0B101A] border border-white/20 flex items-center justify-center shadow-inner">
                <Cpu className="w-4 h-4 text-[#00D35A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">Grok Bot</h1>
                  <span className="text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 uppercase">
                    PAPER
                  </span>
                </div>
                <div className="text-[10px] text-[#8094AE] font-mono">
                  pump.fun &bull; @IndianTradee
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00D35A] bg-[#00D35A]/10 border border-[#00D35A]/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A] animate-ping"></span>
              <span>LIVE</span>
            </div>
          </div>

          {/* Capital Odometer Card */}
          <div className="p-4 rounded-3xl bg-[#080C14] border border-[#172030] flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">TOTAL BALANCE</span>
              <div className="text-4xl font-black text-white tracking-tight tabular-nums mt-0.5">
                ${balance.toFixed(2)}
              </div>
              <div className="text-xs text-[#00D35A] font-semibold mt-1">
                +${todayProfit.toFixed(2)} today &bull; <span className="text-[#64748B]">start ${startCapital.toFixed(2)}</span>
              </div>
            </div>

            <div className="w-13 h-13 rounded-full border-3 border-[#00D35A] flex flex-col items-center justify-center p-2.5 bg-black/40 shadow-inner">
              <span className="text-xs font-bold text-white">{multiplier}x</span>
              <span className="text-[7px] text-[#00D35A] uppercase font-bold">GAIN</span>
            </div>
          </div>

          {/* Canvas Wave Motion (AUTONOMOUS STREAM) */}
          <AutonomousWave height={100} label="AUTONOMOUS STREAM" />

          {/* FOUND ON PUMP.FUN: Token Discovery Card ($JELLY) */}
          <div className="p-4 rounded-3xl bg-[#080C14] border border-[#172030] flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">FOUND ON PUMP.FUN</span>
                <div className="text-2xl font-black text-white mt-0.5">{activeCoin.symbol}</div>
                <div className="text-[11px] text-[#8094AE] font-mono">{activeCoin.age} &bull; mc {activeCoin.mc}</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#F4D06F]/10 border border-[#F4D06F]/30 flex items-center justify-center text-2xl shadow">
                🍮
              </div>
            </div>

            {/* 3 Metric Chips */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-[#05070D] border border-[#141C2B]">
                <div className="text-[8px] text-[#64748B] uppercase font-bold">DEV HOLDING</div>
                <div className="text-xs font-black text-[#00D35A] mt-0.5">{activeCoin.devHolding}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#05070D] border border-[#141C2B]">
                <div className="text-[8px] text-[#64748B] uppercase font-bold">BUNDLES</div>
                <div className="text-xs font-black text-[#00D35A] mt-0.5">{activeCoin.bundles}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#05070D] border border-[#141C2B]">
                <div className="text-[8px] text-[#64748B] uppercase font-bold">DEV HISTORY</div>
                <div className="text-[10px] font-bold text-[#00D35A] mt-0.5 truncate">{activeCoin.devHistory}</div>
              </div>
            </div>

            {/* 4-Step Pipeline Stepper */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[8px] font-bold text-[#64748B] uppercase pb-1.5">
                <span>FOUND</span>
                <span>RUG CHECK</span>
                <span>BOUGHT</span>
                <span>SOLD</span>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#141C2B] -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-3/4 h-0.5 bg-[#00D35A] -translate-y-1/2 z-0"></div>
                <div className="w-5 h-5 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-[10px] font-bold z-10 shadow">✓</div>
                <div className="w-5 h-5 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-[10px] font-bold z-10 shadow">✓</div>
                <div className="w-5 h-5 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-[10px] font-bold z-10 shadow-[0_0_10px_#00D35A]">✓</div>
                <div className="w-5 h-5 rounded-full bg-[#0B101A] border border-[#64748B] text-white flex items-center justify-center text-[10px] z-10">&bull;</div>
              </div>
            </div>

            {/* Open Position Tracker */}
            <div className="flex items-center justify-between pt-2 border-t border-[#141C2B]">
              <div>
                <div className="text-xs font-bold text-white">POSITION OPEN</div>
                <div className="text-[10px] text-[#8094AE] font-mono">${activeCoin.entryPrice.toFixed(2)} entry &bull; stop -25%</div>
              </div>
              <div className="text-xl font-black text-[#00D35A]">+{activeCoin.pnlPct}%</div>
            </div>
          </div>

          {/* Recent Live Activity Rows */}
          <div className="flex flex-col gap-1.5">
            {tradeLogs.slice(0, 2).map((log, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#080C14] border border-[#172030] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{log.symbol}</div>
                  <div className="text-[10px] text-[#8094AE] font-mono">{log.action}</div>
                </div>
                <span className={`text-xs font-bold ${log.isProfit ? "text-[#00D35A]" : "text-[#FF9F0A]"}`}>{log.status}</span>
              </div>
            ))}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP EXPERIENCE: Automatically renders on tablet & desktop (md+)       */}
      {/* High-Resolution Dual Columns, Multi-Agent Swarm, Sweeping Radar & Waves   */}
      {/* ========================================================================= */}
      <main className="hidden md:grid flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-6 grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account Metrics + Pump.fun Active Token Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Account Capital Card */}
          <div className="p-6 rounded-2xl bg-[#060910] border border-[#141C2B] shadow-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D35A]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">ACCOUNT PORTFOLIO</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00D35A]/10 text-[#00D35A] border border-[#00D35A]/30">
                  PAPER RUNTIME
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
              <span className="text-[10px] text-[#64748B] mt-1.5 font-mono">night session</span>
            </div>
          </div>

          {/* Autonomous Stream Sine Wave Banner */}
          <AutonomousWave height={110} label="AUTONOMOUS STREAM · LIQUIDITY OSCILLATION" />

          {/* Found on Pump.fun Token Inspection Card ($JELLY) */}
          <div className="p-6 rounded-2xl bg-[#060910] border border-[#141C2B] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                  FOUND ON PUMP.FUN &bull; 8-LAYER PASSED
                </div>
                <div className="text-3xl font-black text-white tracking-wide mt-1 flex items-center gap-3">
                  <span>{activeCoin.symbol}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#162133] text-[#38BDF8] border border-[#38BDF8]/30 font-mono">
                    {activeCoin.age}
                  </span>
                </div>
                <div className="text-xs text-[#8094AE] font-mono mt-1">
                  Market Cap: <strong className="text-white">{activeCoin.mc}</strong> &bull; Entry: <strong className="text-white">${activeCoin.entryPrice.toFixed(2)}</strong>
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-[#F4D06F]/10 border border-[#F4D06F]/30 flex items-center justify-center text-3xl shadow-lg">
                🍮
              </div>
            </div>

            {/* 3 Safety Metric Chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-[#141C2B]">
                <div className="flex items-center justify-between text-[10px] text-[#64748B] uppercase font-bold">
                  <span>DEV HOLDING</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-base font-black text-[#00D35A] mt-1">{activeCoin.devHolding}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0E17] border border-[#141C2B]">
                <div className="flex items-center justify-between text-[10px] text-[#64748B] uppercase font-bold">
                  <span>BUNDLES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-base font-black text-[#00D35A] mt-1">{activeCoin.bundles}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0E17] border border-[#141C2B]">
                <div className="flex items-center justify-between text-[10px] text-[#64748B] uppercase font-bold">
                  <span>DEV HISTORY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D35A]"></span>
                </div>
                <div className="text-xs font-bold text-[#00D35A] mt-1.5 truncate">{activeCoin.devHistory}</div>
              </div>
            </div>

            {/* 4-Step Pipeline Stepper */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase pb-2">
                <span>1. FOUND</span>
                <span>2. RUG CHECK</span>
                <span>3. BOUGHT</span>
                <span>4. SOLD</span>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#141C2B] -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-3/4 h-1 bg-[#00D35A] -translate-y-1/2 z-0"></div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#00D35A] text-black flex items-center justify-center text-xs font-bold z-10 shadow-[0_0_15px_#00D35A]">✓</div>
                <div className="w-7 h-7 rounded-full bg-[#0C121E] border-2 border-[#64748B] text-white flex items-center justify-center text-xs z-10">&bull;</div>
              </div>
            </div>

            {/* Position Active Indicator */}
            <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#172030] flex items-center justify-between">
              <div>
                <div className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-pulse"></span>
                  POSITION ACTIVE
                </div>
                <div className="text-[11px] text-[#8094AE] font-mono mt-1">
                  Entry: ${activeCoin.entryPrice.toFixed(2)} &bull; Stop: -25% ($1.50)
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-[#00D35A] tracking-tight">+{activeCoin.pnlPct}%</div>
                <div className="text-[10px] text-[#64748B] font-mono">trailing 40% armed</div>
              </div>
            </div>
          </div>

          {/* 5 Autonomous Bots Roster */}
          <div className="p-5 rounded-2xl bg-[#060910] border border-[#141C2B] shadow-2xl flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">AUTONOMOUS BOTS ROSTER</span>
            <div className="grid grid-cols-5 gap-2">
              {botsList.map((b, idx) => {
                const isActive = idx === activeAgentIndex;
                return (
                  <div
                    key={b.name}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isActive
                        ? "bg-[#0E1524] border-[#00D35A] shadow-[0_0_15px_rgba(0,211,90,0.15)] scale-102"
                        : "bg-[#0A0E17] border-[#141C2B]"
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
          <div className="p-6 rounded-2xl bg-[#060910] border border-[#141C2B] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#141C2B] pb-3">
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
              <div className="relative h-60 bg-[#04060B] rounded-xl border border-[#141C2B] flex items-center justify-center overflow-hidden">
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

              <div className="h-60 bg-[#04060B] rounded-xl border border-[#141C2B] p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase">EQUITY & DIP PROJECTION</span>
                  <div className="text-2xl font-black text-white mt-1">$10.00 &rarr; $10.14</div>
                  <div className="text-[11px] text-[#00D35A] font-mono mt-0.5">8/8 Safety Layers Validated</div>
                </div>

                <div className="w-full my-2">
                  <AutonomousWave height={80} label="LIVE DIVERGENCE" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8094AE] font-mono border-t border-[#141C2B] pt-2">
                  <span>EXECUTION: JITO BUNDLE</span>
                  <span className="text-[#00D35A]">CONFIRMED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Positions & Order Ledger Tabs */}
          <div className="p-6 rounded-2xl bg-[#060910] border border-[#141C2B] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#141C2B] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "positions"
                      ? "bg-[#162133] text-[#00D35A] border border-[#00D35A]/30"
                      : "text-[#8094AE] hover:text-white"
                  }`}
                >
                  ACTIVE POSITIONS (1)
                </button>
                <button
                  onClick={() => setActiveTab("terminal")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "terminal"
                      ? "bg-[#162133] text-[#38BDF8] border border-[#38BDF8]/30"
                      : "text-[#8094AE] hover:text-white"
                  }`}
                >
                  TRADE AUDIT LOGS (3)
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#00D35A]" />
                <span>{clockStr} UTC</span>
              </div>
            </div>

            {activeTab === "positions" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[#64748B] border-b border-[#141C2B]">
                      <th className="pb-2">TOKEN</th>
                      <th className="pb-2">ENTRY</th>
                      <th className="pb-2">ALLOCATION</th>
                      <th className="pb-2">CURRENT P&L</th>
                      <th className="pb-2">STOP LOSS</th>
                      <th className="pb-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141C2B]">
                    <tr>
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00D35A] animate-pulse"></span>
                        <span>{activeCoin.symbol}</span>
                      </td>
                      <td className="py-3 text-[#8094AE]">${activeCoin.entryPrice.toFixed(2)}</td>
                      <td className="py-3 text-white">$2.00 (20% of cash)</td>
                      <td className="py-3 font-bold text-[#00D35A]">+{activeCoin.pnlPct}%</td>
                      <td className="py-3 text-[#FF5C68]">-25% ($1.50)</td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 rounded bg-[#FF5C68]/15 hover:bg-[#FF5C68]/25 text-[#FF5C68] border border-[#FF5C68]/30 text-[10px] font-bold">
                          CLOSE
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {tradeLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0A0E17] border border-[#141C2B] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#162133] flex items-center justify-center text-sm">
                        {log.icon}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span>{log.symbol}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{log.time}</span>
                        </div>
                        <div className="text-[11px] text-[#8094AE] font-mono mt-0.5">{log.action}</div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded border ${
                        log.isProfit
                          ? "text-[#00D35A] border-[#00D35A]/30 bg-[#00D35A]/10"
                          : "text-[#FF9F0A] border-[#FF9F0A]/30 bg-[#FF9F0A]/10"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bot Audit Console */}
            <div className="mt-3 p-4 rounded-xl bg-[#030509] border border-[#141C2B] flex flex-col gap-1.5 font-mono text-[11px] text-[#8094AE]">
              <div className="flex items-center justify-between text-white font-bold border-b border-[#141C2B] pb-1">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#00D35A]" />
                  DESK TELEMETRY · 8-LAYER ENGINE
                </span>
                <span className="text-[#00D35A]">ONLINE</span>
              </div>
              <div>[18:50:01] Scanner: $JELLY qualified &mdash; pool age &gt; 10m, liquidity $24,100.</div>
              <div>[18:50:02] Analyst: 8/8 Layers verified &mdash; Mint Revoked, Freeze Revoked, Dev 4%, Bundles 11%.</div>
              <div>[18:50:03] Executor: Dip -15% hit from 10m high &rarr; Sized $2.00 (1.0x cap). Jito bundle broadcast.</div>
            </div>
          </div>

        </div>

      </main>

      {/* 3. Global Footer */}
      <footer className="w-full py-2.5 px-6 text-center text-[10px] text-[#64748B] border-t border-[#121A28] bg-[#060910] flex flex-wrap items-center justify-between">
        <span>Grok Bot &bull; Autonomous Trading Operating System</span>
        <Link href="/admin" className="text-[#00D35A] hover:underline font-bold">
          Admin Portal (All 21 Parts) &rarr;
        </Link>
      </footer>
    </div>
  );
}
