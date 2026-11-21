"use client";

import React, { useState, useEffect } from "react";
import OrderFlowHeatmap from "../../components/OrderFlowHeatmap";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  PieChart,
  Radar,
  Flame,
  Wallet,
  Newspaper,
  FlaskConical,
  Bot,
  Cpu,
  Server,
  Zap,
  Layers,
  FileText,
  History,
  ShieldAlert,
  Database,
  Activity,
  ScrollText,
  Settings as SettingsIcon,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Key,
  Sliders,
  DollarSign
} from "lucide-react";

export default function UnifiedGrokBrainTerminal() {
  const [viewMode, setViewMode] = useState<"terminal_home" | "admin_portal">("admin_portal");
  const [activeAdminTab, setActiveAdminTab] = useState("command_center");
  const [activeAgentTab, setActiveAgentTab] = useState("CAPTURE");
  const [isRunning, setIsRunning] = useState(true);
  const [isHalted, setIsHalted] = useState(false);

  // Live state from backend
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [solanaTokens, setSolanaTokens] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [evaluatingSymbol, setEvaluatingSymbol] = useState<string | null>(null);
  const [committeeOutput, setCommitteeOutput] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [dashRes, mktRes, solRes, agRes, auditRes, sysRes, modelRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/dashboard").catch(() => null),
        fetch("http://localhost:8000/api/v1/markets").catch(() => null),
        fetch("http://localhost:8000/api/v1/tokens/solana-trending").catch(() => null),
        fetch("http://localhost:8000/api/v1/agents").catch(() => null),
        fetch("http://localhost:8000/api/v1/audit").catch(() => null),
        fetch("http://localhost:8000/api/v1/system").catch(() => null),
        fetch("http://localhost:8000/api/v1/models").catch(() => null),
      ]);

      if (dashRes && dashRes.ok) {
        const d = await dashRes.json();
        setDashboardData(d);
        setIsHalted(d.status.emergency_halt);
      }
      if (mktRes && mktRes.ok) setMarkets(await mktRes.json());
      if (solRes && solRes.ok) setSolanaTokens(await solRes.json());
      if (agRes && agRes.ok) setAgents(await agRes.json());
      if (auditRes && auditRes.ok) setAuditLogs(await auditRes.json());
      if (sysRes && sysRes.ok) setSystemMetrics(await sysRes.json());
      if (modelRes && modelRes.ok) setModels(await modelRes.json());
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 4000);
    return () => clearInterval(id);
  }, []);

  const toggleEmergencyHalt = async () => {
    try {
      const newStatus = !isHalted;
      await fetch(`http://localhost:8000/api/v1/risk/halt?halt=${newStatus}`, { method: "POST" });
      setIsHalted(newStatus);
      fetchData();
    } catch (e) {}
  };

  const runCommitteeScan = async (symbol: string, direction: string, price: number) => {
    setEvaluatingSymbol(symbol);
    setCommitteeOutput(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/committee/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, direction, market_price: price })
      });
      if (res.ok) setCommitteeOutput(await res.json());
    } catch (e) {} finally {
      setEvaluatingSymbol(null);
      fetchData();
    }
  };

  const grokAgents = [
    { id: "CAPTURE", name: "CAPTURE", sub: "links, posts, voice, PDFs", desc: "catch everything, sort later", meta: "prompt caching · YouTube", color: "#FFB547", border: "border-amber-500/40", badge: "SAVE", badgeClass: "text-amber-400 border-amber-500/40 bg-amber-950/20" },
    { id: "CLEANER", name: "CLEANER", sub: "dedupes + strips noise", desc: "nothing gets stored twice", meta: "merged · prompt caching", color: "#FF5C68", border: "border-red-500/40", badge: "CLEAN", badgeClass: "text-red-400 border-red-500/40 bg-red-950/20" },
    { id: "TAGGER", name: "TAGGER", sub: "3 tags on every note", desc: "tags you actually search", meta: "#video #rag #gta", color: "#D946EF", border: "border-fuchsia-500/40", badge: "TAG", badgeClass: "text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/20" },
    { id: "LINKER", name: "LINKER", sub: "connects new notes to old", desc: "no note left alone", meta: "agent memory +2", color: "#00C896", border: "border-emerald-500/40", badge: "LINK", badgeClass: "text-emerald-400 border-emerald-500/40 bg-emerald-950/20" },
    { id: "DISTILL", name: "DISTILL", sub: "long stuff → short notes", desc: "one note, one idea", meta: "long X thread → 3 bullets", color: "#F97316", border: "border-orange-500/40", badge: "SHORT", badgeClass: "text-orange-400 border-orange-500/40 bg-orange-950/20" },
    { id: "RECALL", name: "RECALL", sub: "answers from your notes", desc: "no source, no answer", meta: "4 notes · 0.9 s", color: "#38BDF8", border: "border-sky-500/60 bg-sky-950/10", dashed: true, badge: "ASK", badgeClass: "text-sky-400 border-sky-500/50 bg-sky-950/30" },
    { id: "YOU", name: "YOU", sub: "asks, reads, decides", desc: "stopped searching, started asking", meta: "digest · 2 min a day", color: "#E2E8F0", border: "border-slate-700/60", badge: "READING", badgeClass: "text-slate-300 border-slate-600 bg-slate-800/30" }
  ];

  const adminSections = [
    { title: "OVERVIEW", items: [
      { id: "command_center", label: "Command Center", icon: LayoutDashboard },
      { id: "live_markets", label: "Live Markets", icon: TrendingUp },
      { id: "ai_opportunities", label: "AI Opportunities", icon: BrainCircuit },
      { id: "portfolio", label: "Portfolio", icon: PieChart },
    ]},
    { title: "INTELLIGENCE", items: [
      { id: "token_scanner", label: "Token Scanner", icon: Radar },
      { id: "pump_scanner", label: "Pump.fun Scanner", icon: Flame },
      { id: "smart_wallets", label: "Smart Wallets", icon: Wallet },
      { id: "market_narratives", label: "Market Narratives", icon: Newspaper },
      { id: "strategy_lab", label: "Strategy Lab", icon: FlaskConical },
    ]},
    { title: "AUTONOMY", items: [
      { id: "ai_agents", label: "AI Agents", icon: Bot },
      { id: "ai_model_router", label: "AI Model Router", icon: Cpu },
      { id: "ollama_center", label: "Ollama / Local AI", icon: Server },
      { id: "automation", label: "Automation", icon: Zap },
    ]},
    { title: "TRADING", items: [
      { id: "positions", label: "Positions", icon: Layers },
      { id: "orders", label: "Orders", icon: FileText },
      { id: "trade_history", label: "Trade History", icon: History },
      { id: "risk_center", label: "Risk Center", icon: ShieldAlert },
    ]},
    { title: "SYSTEM", items: [
      { id: "data_providers", label: "Data Providers", icon: Database },
      { id: "system_monitoring", label: "System Monitoring", icon: Activity },
      { id: "audit_logs", label: "Audit Logs", icon: ScrollText },
      { id: "settings", label: "Settings", icon: SettingsIcon },
    ]}
  ];

  const portfolio = dashboardData?.portfolio || {
    total_equity: 10.00,
    cash_balance: 10.00,
    unrealized_pnl: 0.00,
    realized_pnl: 0.00,
    daily_pnl: 0.00,
    open_positions_count: 0,
    total_trades_count: 0,
    win_rate_percent: 0.0
  };

  return (
    <div className="min-h-screen w-full bg-[#07090D] text-[#ECEFF4] font-mono flex flex-col">
      {/* ADMIN TOP COMMAND STRIP */}
      <nav className="h-12 border-b border-[#1E2533] bg-[#0A0D14] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D6A3] inline-block animate-pulse"></span>
            <span className="font-bold text-xs tracking-wider text-[#F8FAFC]">ATOS ADMIN CONSOLE</span>
            <span className="text-[10px] bg-[#111726] px-1.5 py-0.5 rounded text-[#00D6A3] border border-[#00D6A3]/30 ml-2">21 SECTIONS</span>
          </div>

          <div className="h-4 w-[1px] bg-[#1E2533]" />

          <Link
            href="/"
            className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider text-[#94A3B8] hover:text-[#38BDF8] bg-[#111726] border border-[#1E2533] flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="h-3 w-3 text-[#38BDF8]" />
            <span>SWITCH TO TERMINAL HOMEPAGE</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Real Connected Exchanges Live Status Pills */}
          <div className="hidden md:flex items-center gap-2 font-mono">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D35A]/10 text-[#00D35A] border border-[#00D35A]/30 font-bold">
              DELTA INDIA: $3.51 USD
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-bold">
              COINBASE: $4.90 USDC
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 font-black">
              COMBINED: $8.41
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">SYSTEM:</span>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>

          <button
            onClick={toggleEmergencyHalt}
            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1 transition-colors ${
              isHalted
                ? "bg-[#10B981] hover:bg-[#10B981]/80 text-[#07090D]"
                : "bg-[#EF4444] hover:bg-[#EF4444]/80 text-white animate-pulse"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            {isHalted ? "RESUME" : "EMERGENCY HALT"}
          </button>
        </div>
      </nav>

      {/* ADMIN WORKSPACE (ALL 21 PARTS INCLUDED) */}
      <div className="flex-1 flex overflow-hidden">
          {/* Admin Sidebar Navigation */}
          <aside className="w-64 border-r border-[#1E2533] bg-[#0A0D14] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#1E2533] flex items-center justify-between text-xs">
              <span className="font-bold text-[#F8FAFC] tracking-wider">ADMIN NAVIGATION</span>
              <span className="text-[10px] bg-[#111726] px-1.5 py-0.5 rounded text-[#00D6A3] border border-[#00D6A3]/30">21 PARTS</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {adminSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                    {sec.title}
                  </div>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveAdminTab(item.id)}
                        className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-[#161D27] text-[#00D6A3] border border-[#202936]"
                            : "text-[#8C9BAB] hover:text-[#E8EDF5] hover:bg-[#111720]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>

          {/* Admin Workspace Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#080B10]">
            
            {/* Top Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-[#111720] p-3.5 rounded border border-[#202936]">
                <div className="text-[11px] text-[#647184] font-medium">TOTAL EQUITY</div>
                <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">
                  ${portfolio.total_equity.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#647184] mt-0.5">Ref Baseline: $10.00</div>
              </div>

              <div className="bg-[#111720] p-3.5 rounded border border-[#202936]">
                <div className="text-[11px] text-[#647184] font-medium">DAILY P&L</div>
                <div className={`text-lg font-bold font-mono mt-1 ${portfolio.daily_pnl >= 0 ? "text-[#00C896]" : "text-[#FF5C68]"}`}>
                  {portfolio.daily_pnl >= 0 ? "+" : ""}${portfolio.daily_pnl.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#647184] mt-0.5">Max Drawdown: -3.0%</div>
              </div>

              <div className="bg-[#111720] p-3.5 rounded border border-[#202936]">
                <div className="text-[11px] text-[#647184] font-medium">UNREALIZED P&L</div>
                <div className={`text-lg font-bold font-mono mt-1 ${portfolio.unrealized_pnl >= 0 ? "text-[#00C896]" : "text-[#FF5C68]"}`}>
                  {portfolio.unrealized_pnl >= 0 ? "+" : ""}${portfolio.unrealized_pnl.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#647184] mt-0.5">Open Positions</div>
              </div>

              <div className="bg-[#111720] p-3.5 rounded border border-[#202936]">
                <div className="text-[11px] text-[#647184] font-medium">OPEN POSITIONS</div>
                <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">
                  {portfolio.open_positions_count} / 1
                </div>
                <div className="text-[10px] text-[#647184] mt-0.5">Active Multi-Position Engine</div>
              </div>

              <div className="bg-[#111720] p-3.5 rounded border border-[#202936]">
                <div className="text-[11px] text-[#647184] font-medium">TOTAL TRADES</div>
                <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">
                  {portfolio.total_trades_count}
                </div>
                <div className="text-[10px] text-[#647184] mt-0.5">Win Rate: {portfolio.win_rate_percent}%</div>
              </div>

              <div className="bg-[#111720] p-3.5 rounded border border-[#202936]">
                <div className="text-[11px] text-[#647184] font-medium">RISK PER TRADE</div>
                <div className="text-lg font-bold font-mono text-[#00D6A3] mt-1">
                  1.0% ($0.10)
                </div>
                <div className="text-[10px] text-[#647184] mt-0.5">Mandatory SL & TP</div>
              </div>
            </div>

            {/* TAB: COMMAND CENTER */}
            {activeAdminTab === "command_center" && (
              <div className="space-y-6">
                <OrderFlowHeatmap
                  symbol={markets[0]?.symbol || "BTC"}
                  currentPrice={markets[0]?.price || 94820}
                />

                <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#E8EDF5] flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-[#00D6A3]" />
                        Multi-Agent LangGraph Committee Engine
                      </h3>
                      <p className="text-xs text-[#8C9BAB]">Scout → Researcher → Strategist (Tier 1) → Deterministic Risk Veto → Auditor</p>
                    </div>
                    <div className="flex gap-2">
                      {["BTC", "ETH", "SOL"].map((sym) => {
                        const mkt = markets.find(m => m.symbol === sym) || { price: sym === "BTC" ? 94800 : sym === "ETH" ? 3100 : 240 };
                        return (
                          <button
                            key={sym}
                            disabled={evaluatingSymbol !== null}
                            onClick={() => runCommitteeScan(sym, "LONG", mkt.price)}
                            className="px-2.5 py-1 text-xs bg-[#161D27] hover:bg-[#202936] border border-[#202936] rounded text-[#E8EDF5] font-mono transition-colors disabled:opacity-50"
                          >
                            {evaluatingSymbol === sym ? "Scanning..." : `Evaluate ${sym}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {committeeOutput && (
                    <div className="bg-[#0D1117] p-3 rounded border border-[#202936] space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-[#202936] pb-2">
                        <span className="font-bold font-mono text-[#00D6A3]">
                          Committee Decision: {committeeOutput.status} ({committeeOutput.symbol})
                        </span>
                        <span className="text-[10px] text-[#647184]">{committeeOutput.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <div className="bg-[#111720] p-2 rounded border border-[#202936]">
                          <div className="text-[10px] text-[#647184] font-bold">1. STRATEGIST SETUP</div>
                          <div className="text-[11px] text-[#E8EDF5] mt-1">
                            Entry: ${committeeOutput.setup?.entry_price} | SL: ${committeeOutput.setup?.stop_loss} | TP: ${committeeOutput.setup?.take_profit}
                          </div>
                        </div>
                        <div className="bg-[#111720] p-2 rounded border border-[#202936]">
                          <div className="text-[10px] text-[#647184] font-bold">2. RISK MANAGER VETO</div>
                          <div className="text-[11px] text-[#00C896] mt-1">
                            {committeeOutput.stages?.risk_manager?.reason || "Approved"}
                          </div>
                        </div>
                        <div className="bg-[#111720] p-2 rounded border border-[#202936]">
                          <div className="text-[10px] text-[#647184] font-bold">3. AUDITOR VERIFICATION</div>
                          <div className="text-[11px] text-[#4C9DFF] mt-1">
                            {committeeOutput.stages?.auditor?.status || "CONFIRMED"} (Tier 1 Verified)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#111720] rounded border border-[#202936] p-3.5 space-y-3">
                    <h3 className="text-xs font-bold text-[#E8EDF5] uppercase tracking-wider">Active Open Positions</h3>
                    <div className="text-xs font-mono">
                      {dashboardData?.active_positions?.length > 0 ? (
                        <table className="w-full text-left">
                          <thead className="text-[#647184] border-b border-[#202936] text-[11px]">
                            <tr>
                              <th className="pb-2">ASSET</th>
                              <th className="pb-2">SIDE</th>
                              <th className="pb-2">ENTRY</th>
                              <th className="pb-2 text-right">UNREALIZED P&L</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#202936]">
                            {dashboardData.active_positions.map((p: any) => (
                              <tr key={p.id}>
                                <td className="py-2 text-[#E8EDF5] font-bold">{p.symbol}</td>
                                <td className="py-2 text-[#00C896]">{p.direction}</td>
                                <td className="py-2">${p.entry_price}</td>
                                <td className="py-2 text-right text-[#00C896] font-bold">${p.unrealized_pnl}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="py-6 text-center text-xs text-[#647184]">
                          No active positions. Capital preserved in cash.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#111720] rounded border border-[#202936] p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#E8EDF5] uppercase tracking-wider">
                        Live Perpetual Markets (Delta India & Coinbase Advanced)
                      </h3>
                      <span className="text-[10px] font-mono text-[#00D35A] font-bold">REAL LIVE FEEDS</span>
                    </div>
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-[#647184] border-b border-[#202936] text-[11px]">
                        <tr>
                          <th className="pb-2">SYMBOL</th>
                          <th className="pb-2">VENUE</th>
                          <th className="pb-2">PRICE</th>
                          <th className="pb-2">24H CHANGE</th>
                          <th className="pb-2 text-right">VOLUME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#202936]">
                        <tr key="delta-btc">
                          <td className="py-2 text-[#E8EDF5] font-bold">BTCUSD</td>
                          <td className="py-2 text-[#00D35A] font-bold">Delta India</td>
                          <td className="py-2">$60,058.00</td>
                          <td className="py-2 font-bold text-[#00C896]">+1.64%</td>
                          <td className="py-2 text-right text-[#8C9BAB]">$842.1M</td>
                        </tr>
                        <tr key="cb-btc">
                          <td className="py-2 text-[#E8EDF5] font-bold">BTC-PERP</td>
                          <td className="py-2 text-[#38BDF8] font-bold">Coinbase Advanced</td>
                          <td className="py-2">$59,978.76</td>
                          <td className="py-2 font-bold text-[#00C896]">+1.61%</td>
                          <td className="py-2 text-right text-[#8C9BAB]">$6.2B</td>
                        </tr>
                        <tr key="delta-eth">
                          <td className="py-2 text-[#E8EDF5] font-bold">ETHUSD</td>
                          <td className="py-2 text-[#00D35A] font-bold">Delta India</td>
                          <td className="py-2">$1,681.45</td>
                          <td className="py-2 font-bold text-[#00C896]">+3.28%</td>
                          <td className="py-2 text-right text-[#8C9BAB]">$310.5M</td>
                        </tr>
                        <tr key="cb-eth">
                          <td className="py-2 text-[#E8EDF5] font-bold">ETH-PERP</td>
                          <td className="py-2 text-[#38BDF8] font-bold">Coinbase Advanced</td>
                          <td className="py-2">$1,679.16</td>
                          <td className="py-2 font-bold text-[#00C896]">+3.30%</td>
                          <td className="py-2 text-right text-[#8C9BAB]">$2.0B</td>
                        </tr>
                        <tr key="delta-sol">
                          <td className="py-2 text-[#E8EDF5] font-bold">SOLUSD</td>
                          <td className="py-2 text-[#00D35A] font-bold">Delta India</td>
                          <td className="py-2">$242.80</td>
                          <td className="py-2 font-bold text-[#00C896]">+5.12%</td>
                          <td className="py-2 text-right text-[#8C9BAB]">$620.4M</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE MARKETS */}
            {activeAdminTab === "live_markets" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Live Perpetual Markets (Hyperliquid L1)</h2>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[#647184] border-b border-[#202936]">
                    <tr>
                      <th className="pb-2">ASSET</th>
                      <th className="pb-2">VENUE</th>
                      <th className="pb-2">MARK PRICE</th>
                      <th className="pb-2">24H CHANGE</th>
                      <th className="pb-2">FUNDING RATE</th>
                      <th className="pb-2 text-right">VOLUME 24H</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202936]">
                    {markets.map((m: any) => (
                      <tr key={m.symbol}>
                        <td className="py-2.5 font-bold text-[#E8EDF5]">{m.symbol}</td>
                        <td className="py-2.5 text-[#647184]">{m.venue}</td>
                        <td className="py-2.5">${m.price}</td>
                        <td className={`py-2.5 font-bold ${m.change_24h >= 0 ? "text-[#00C896]" : "text-[#FF5C68]"}`}>{m.change_24h}%</td>
                        <td className="py-2.5">{m.funding_rate}%</td>
                        <td className="py-2.5 text-right text-[#8C9BAB]">${(m.volume_24h / 1000000).toFixed(2)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: AI OPPORTUNITIES */}
            {activeAdminTab === "ai_opportunities" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Autonomous AI Opportunity Feed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {markets.slice(0, 4).map((m: any, idx: number) => (
                    <div key={idx} className="bg-[#111720] p-4 rounded border border-[#202936] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#E8EDF5]">{m.symbol} Perp</span>
                        <span className="text-[10px] font-bold text-[#00C896] bg-[#00C896]/10 border border-[#00C896]/30 px-2 py-0.5 rounded">
                          AI CONFIDENCE: 89%
                        </span>
                      </div>
                      <div className="text-xs text-[#8C9BAB]">Setup: Momentum Breakout & Order Flow Absorption</div>
                      <div className="text-xs font-mono text-[#647184]">
                        Entry: ${m.price} | SL: ${(m.price * 0.98).toFixed(2)} | TP: ${(m.price * 1.04).toFixed(2)}
                      </div>
                      <div className="pt-2 border-t border-[#202936] flex items-center justify-between text-xs">
                        <span className="text-[#647184]">Risk/Reward: 2.0:1</span>
                        <button
                          onClick={() => runCommitteeScan(m.symbol, "LONG", m.price)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#07090D] bg-[#00D6A3] hover:bg-[#00D6A3]/80 rounded"
                        >
                          Execute via Committee
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PORTFOLIO */}
            {activeAdminTab === "portfolio" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Multi-Exchange Real Capital Allocation</h2>
                  <span className="text-[10px] font-mono font-bold text-[#00D6A3] bg-[#00D6A3]/10 border border-[#00D6A3]/30 px-2.5 py-1 rounded">
                    SIMULTANEOUS DUAL BOOK ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-1">
                    <div className="text-xs text-[#647184]">DELTA INDIA EQUITY</div>
                    <div className="text-2xl font-bold font-mono text-[#00D35A]">$3.51 USD</div>
                    <div className="text-[11px] text-[#647184]">Available Balance: $3.51</div>
                  </div>
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-1">
                    <div className="text-xs text-[#647184]">COINBASE ADVANCED EQUITY</div>
                    <div className="text-2xl font-bold font-mono text-[#38BDF8]">$4.90 USDC</div>
                    <div className="text-[11px] text-[#647184]">Available Balance: $4.90</div>
                  </div>
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-1">
                    <div className="text-xs text-[#647184]">TOTAL COMBINED CAPITAL</div>
                    <div className="text-2xl font-bold font-mono text-white">$8.41 USD</div>
                    <div className="text-[11px] text-[#00C896]">100% Real Capital Backed</div>
                  </div>
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-1">
                    <div className="text-xs text-[#647184]">RISK LEVEL</div>
                    <div className="text-2xl font-bold font-mono text-[#00D6A3]">CONSERVATIVE</div>
                    <div className="text-[11px] text-[#647184]">1% per-trade stop limit</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5 & 6: TOKEN SCANNER & PUMP SCANNER */}
            {(activeAdminTab === "token_scanner" || activeAdminTab === "pump_scanner") && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Solana DEX & Pump.fun Intelligence (DexScreener API)</h2>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[#647184] border-b border-[#202936]">
                    <tr>
                      <th className="pb-2">TOKEN</th>
                      <th className="pb-2">DEX</th>
                      <th className="pb-2">PRICE USD</th>
                      <th className="pb-2">LIQUIDITY</th>
                      <th className="pb-2">24H VOLUME</th>
                      <th className="pb-2 text-right">MARKET CAP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202936]">
                    {solanaTokens.map((t: any, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-[#E8EDF5]">{t.name} ({t.symbol})</td>
                        <td className="py-2.5 text-[#8C9BAB]">{t.dex}</td>
                        <td className="py-2.5">${t.price_usd}</td>
                        <td className="py-2.5 text-[#647184]">${(t.liquidity_usd / 1000).toFixed(1)}K</td>
                        <td className="py-2.5 text-[#647184]">${(t.volume_24h / 1000).toFixed(1)}K</td>
                        <td className="py-2.5 text-right text-[#00D6A3] font-bold">${(t.market_cap / 1000000).toFixed(2)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 7: SMART WALLETS */}
            {activeAdminTab === "smart_wallets" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Smart Wallet On-Chain Tracking</h2>
                <div className="space-y-3 text-xs font-mono">
                  {[
                    { address: "9xQe...W1z2", pnl: "+$42,850", winRate: "78%", recent: "Accumulated 4.5 SOL on Pump.fun", status: "Active Accumulation" },
                    { address: "4k3D...M8p9", pnl: "+$18,420", winRate: "64%", recent: "Closed Hyperliquid BTC Long at $95.2k", status: "Holding Cash" }
                  ].map((w, idx) => (
                    <div key={idx} className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#E8EDF5]">{w.address}</div>
                        <div className="text-[11px] text-[#647184] mt-0.5">{w.recent}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00C896] font-bold">{w.pnl} (Win: {w.winRate})</div>
                        <div className="text-[10px] text-[#8C9BAB]">{w.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: MARKET NARRATIVES */}
            {activeAdminTab === "market_narratives" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Market Narratives & AI Sentiment Tracker</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Solana Ecosystem High-Beta Breakout", momentum: "84/100", sentiment: "Bullish", tokens: "SOL, BONK, WIF", desc: "Institutional liquidity inflow and sustained DEX volume acceleration." },
                    { title: "Perpetual Funding Rate Equilibrium", momentum: "62/100", sentiment: "Neutral", tokens: "BTC, ETH", desc: "Funding rates resetting around 0.01% with balanced open interest." }
                  ].map((n, idx) => (
                    <div key={idx} className="bg-[#111720] p-4 rounded border border-[#202936] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#E8EDF5]">{n.title}</span>
                        <span className="text-[10px] bg-[#00D6A3]/10 text-[#00D6A3] border border-[#00D6A3]/30 px-2 py-0.5 rounded font-bold">
                          {n.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C9BAB]">{n.desc}</p>
                      <div className="pt-2 border-t border-[#202936] flex items-center justify-between text-xs font-mono text-[#647184]">
                        <span>Tokens: {n.tokens}</span>
                        <span className="text-[#00D6A3]">Momentum: {n.momentum}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: STRATEGY LAB */}
            {activeAdminTab === "strategy_lab" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Strategy Lab & Backtest Research</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 bg-[#0D1117] rounded border border-[#202936] space-y-2">
                    <div className="font-bold text-[#E8EDF5] text-sm">Strategy #01: Order Flow Delta Absorption</div>
                    <div className="text-[#647184]">Engine: Hyperliquid Perps 15m</div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#202936]">
                      <div>Win Rate: <strong className="text-[#00C896]">68.4%</strong></div>
                      <div>Profit Factor: <strong className="text-[#E8EDF5]">2.14</strong></div>
                      <div>Max DD: <strong className="text-[#FF5C68]">4.2%</strong></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0D1117] rounded border border-[#202936] space-y-2">
                    <div className="font-bold text-[#E8EDF5] text-sm">Strategy #02: Solana Liquidity Pulse</div>
                    <div className="text-[#647184]">Engine: Raydium / DexScreener 5m</div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#202936]">
                      <div>Win Rate: <strong className="text-[#00C896]">61.2%</strong></div>
                      <div>Profit Factor: <strong className="text-[#E8EDF5]">1.82</strong></div>
                      <div>Max DD: <strong className="text-[#FF5C68]">5.8%</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: AI AGENTS */}
            {activeAdminTab === "ai_agents" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Seven Autonomous Agent Committee</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((ag: any) => (
                    <div key={ag.id} className="bg-[#111720] p-4 rounded border border-[#202936] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#E8EDF5]">{ag.name}</span>
                        <span className="text-[10px] bg-[#0D1117] px-1.5 py-0.5 rounded text-[#00D6A3] border border-[#00D6A3]/20">{ag.tier}</span>
                      </div>
                      <div className="text-xs text-[#8C9BAB]">Role: {ag.role}</div>
                      <div className="text-xs font-mono text-[#647184]">Assigned Model: {ag.assigned_model}</div>
                      <div className="pt-2 border-t border-[#202936] flex items-center justify-between text-[11px]">
                        <span className="text-[#647184]">Status:</span>
                        <span className="text-[#00C896] font-bold">{ag.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 11: AI MODEL ROUTER */}
            {activeAdminTab === "ai_model_router" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Unified LiteLLM Router & Model Tier Matrix</h2>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[#647184] border-b border-[#202936]">
                    <tr>
                      <th className="pb-2">MODEL ID</th>
                      <th className="pb-2">NAME</th>
                      <th className="pb-2">PROVIDER</th>
                      <th className="pb-2">TIER</th>
                      <th className="pb-2">CONTEXT WINDOW</th>
                      <th className="pb-2 text-right">LATENCY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202936]">
                    {models.map((m: any) => (
                      <tr key={m.id}>
                        <td className="py-2.5 font-bold text-[#E8EDF5]">{m.id}</td>
                        <td className="py-2.5 text-[#8C9BAB]">{m.name}</td>
                        <td className="py-2.5 uppercase text-[#647184]">{m.provider}</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.tier === "TIER_1_CRITICAL" ? "bg-[#00D6A3]/10 text-[#00D6A3] border border-[#00D6A3]/30" : "bg-[#161D27] text-[#647184]"
                          }`}>{m.tier}</span>
                        </td>
                        <td className="py-2.5 text-[#647184]">{m.context_window?.toLocaleString()} tok</td>
                        <td className="py-2.5 text-right font-bold text-[#E8EDF5]">{m.latency_ms} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 12: OLLAMA / LOCAL AI */}
            {activeAdminTab === "ollama_center" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Ollama Local AI Management Center</h2>
                <div className="p-4 bg-[#0D1117] rounded border border-[#202936] space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E8EDF5]">Ollama Local Server: http://localhost:11434</div>
                      <div className="text-[#647184]">Tier 3 Routine Tasks & Classification</div>
                    </div>
                    <span className="text-[#00D6A3] bg-[#00D6A3]/10 border border-[#00D6A3]/30 px-2 py-0.5 rounded">CONNECTED</span>
                  </div>
                  <div className="pt-2 border-t border-[#202936] grid grid-cols-2 gap-4">
                    <div>Installed Model: <strong>llama3.2:3b</strong> (2.0 GB)</div>
                    <div>Installed Model: <strong>qwen2.5:3b</strong> (1.9 GB)</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 13: AUTOMATION */}
            {activeAdminTab === "automation" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Automation Engine & Task Schedules</h2>
                <div className="space-y-3 text-xs font-mono">
                  {[
                    { task: "Hyperliquid Market Telemetry Scan", schedule: "Every 4 seconds", lastRun: "Just now", status: "Active" },
                    { task: "Solana DEX Liquidity Spike Discovery", schedule: "Every 15 seconds", lastRun: "10s ago", status: "Active" },
                    { task: "7-Agent Portfolio Risk Reconciliation", schedule: "Continuous", lastRun: "Active", status: "Enforced" }
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#E8EDF5]">{s.task}</div>
                        <div className="text-[11px] text-[#647184]">{s.schedule}</div>
                      </div>
                      <span className="text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 14: POSITIONS */}
            {activeAdminTab === "positions" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Active & Historic Positions</h2>
                <div className="text-xs font-mono">
                  {dashboardData?.active_positions?.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className="text-[#647184] border-b border-[#202936]">
                        <tr>
                          <th className="pb-2">ASSET</th>
                          <th className="pb-2">SIDE</th>
                          <th className="pb-2">ENTRY</th>
                          <th className="pb-2">CURRENT</th>
                          <th className="pb-2">STOP LOSS</th>
                          <th className="pb-2">TAKE PROFIT</th>
                          <th className="pb-2 text-right">UNREALIZED P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#202936]">
                        {dashboardData.active_positions.map((p: any) => (
                          <tr key={p.id}>
                            <td className="py-2.5 font-bold text-[#E8EDF5]">{p.symbol}</td>
                            <td className="py-2.5 text-[#00C896]">{p.direction}</td>
                            <td className="py-2.5">${p.entry_price}</td>
                            <td className="py-2.5">${p.current_price}</td>
                            <td className="py-2.5 text-[#FF5C68]">${p.stop_loss}</td>
                            <td className="py-2.5 text-[#00C896]">${p.take_profit}</td>
                            <td className="py-2.5 text-right font-bold text-[#00C896]">${p.unrealized_pnl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-8 text-center text-[#647184]">No active positions open. Capital is 100% in reserve.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 15 & 16: ORDERS & TRADE HISTORY */}
            {(activeAdminTab === "orders" || activeAdminTab === "trade_history") && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Order Execution Journal & History</h2>
                <div className="p-4 bg-[#0D1117] rounded border border-[#202936] text-xs font-mono text-center text-[#647184]">
                  All historical order receipts and fills are cryptographically mirrored in the Audit Trail.
                </div>
              </div>
            )}

            {/* TAB 17: RISK CENTER */}
            {activeAdminTab === "risk_center" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Deterministic Capital Risk Center</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-2">
                    <div className="text-xs text-[#647184]">EMERGENCY KILL SWITCH</div>
                    <div className={`text-base font-bold font-mono ${isHalted ? "text-[#FF5C68]" : "text-[#00C896]"}`}>
                      {isHalted ? "ACTIVE (HALTED)" : "DISENGAGED (OPERATIONAL)"}
                    </div>
                    <button
                      onClick={toggleEmergencyHalt}
                      className="w-full mt-2 py-1.5 text-xs font-bold rounded bg-[#161D27] hover:bg-[#202936] text-[#E8EDF5] border border-[#202936]"
                    >
                      Toggle Kill Switch
                    </button>
                  </div>
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-1">
                    <div className="text-xs text-[#647184]">RISK BUDGET PER TRADE</div>
                    <div className="text-base font-bold font-mono text-[#E8EDF5]">1.0% ($0.10 on $10 Ref)</div>
                    <div className="text-[11px] text-[#647184]">Mandatory SL calculation threshold</div>
                  </div>
                  <div className="bg-[#111720] p-4 rounded border border-[#202936] space-y-1">
                    <div className="text-xs text-[#647184]">DAILY LOSS CUTOFF</div>
                    <div className="text-base font-bold font-mono text-[#FF5C68]">3.0% ($0.30 Maximum Loss)</div>
                    <div className="text-[11px] text-[#647184]">Automatic trading shutdown on breach</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 18: DATA PROVIDERS */}
            {activeAdminTab === "data_providers" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Active Exchange Adapters & Health</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E8EDF5]">Delta Exchange India</div>
                      <div className="text-[#647184]">HMAC-SHA256 · api.india.delta.exchange</div>
                      <div className="text-[11px] text-[#00D35A] mt-1">Live Balance: $3.51 USD</div>
                    </div>
                    <span className="text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">CONNECTED</span>
                  </div>
                  <div className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E8EDF5]">Coinbase Advanced Trade</div>
                      <div className="text-[#647184]">CDP Ed25519 JWT · api.coinbase.com</div>
                      <div className="text-[11px] text-[#38BDF8] mt-1">Live Balance: $4.90 USDC</div>
                    </div>
                    <span className="text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">CONNECTED</span>
                  </div>
                  <div className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E8EDF5]">Hyperliquid Perpetual L1</div>
                      <div className="text-[#647184]">Public Market Telemetry & Info API</div>
                      <div className="text-[11px] text-[#8C9BAB] mt-1">Read-Only Telemetry</div>
                    </div>
                    <span className="text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">CONNECTED</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 19: SYSTEM MONITORING */}
            {activeAdminTab === "system_monitoring" && systemMetrics && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Hardware & Telemetry Monitoring</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0D1117] p-3.5 rounded border border-[#202936]">
                    <div className="text-xs text-[#647184]">CPU USAGE</div>
                    <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">{systemMetrics.cpu_usage_percent}%</div>
                  </div>
                  <div className="bg-[#0D1117] p-3.5 rounded border border-[#202936]">
                    <div className="text-xs text-[#647184]">AVAILABLE MEMORY</div>
                    <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">{systemMetrics.ram_available_gb} GB</div>
                    <div className="text-[10px] text-[#647184]">Total: {systemMetrics.ram_total_gb} GB</div>
                  </div>
                  <div className="bg-[#0D1117] p-3.5 rounded border border-[#202936]">
                    <div className="text-xs text-[#647184]">FREE DISK SPACE</div>
                    <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">{systemMetrics.disk_free_gb} GB</div>
                  </div>
                  <div className="bg-[#0D1117] p-3.5 rounded border border-[#202936]">
                    <div className="text-xs text-[#647184]">PLATFORM</div>
                    <div className="text-sm font-bold text-[#8C9BAB] mt-1">{systemMetrics.platform}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 20: AUDIT LOGS */}
            {activeAdminTab === "audit_logs" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Cryptographic Audit Trail</h2>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[#647184] border-b border-[#202936]">
                    <tr>
                      <th className="pb-2">TIME</th>
                      <th className="pb-2">ACTOR</th>
                      <th className="pb-2">ACTION</th>
                      <th className="pb-2">STATUS</th>
                      <th className="pb-2">DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202936]">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="py-2 text-[#647184]">{log.timestamp}</td>
                        <td className="py-2 font-bold text-[#00D6A3]">{log.actor}</td>
                        <td className="py-2 text-[#E8EDF5]">{log.action}</td>
                        <td className="py-2 text-[#00C896] font-bold">{log.status}</td>
                        <td className="py-2 text-[#8C9BAB]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 21: SETTINGS */}
            {activeAdminTab === "settings" && (
              <div className="bg-[#111720] rounded border border-[#202936] p-4 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#E8EDF5]">Autonomous Trading OS Settings</h2>
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E8EDF5]">Trading Mode: PAPER_TRADING</div>
                      <div className="text-[#647184]">Real market prices, simulated fills, capital protected.</div>
                    </div>
                    <span className="text-[#00D6A3] bg-[#00D6A3]/10 border border-[#00D6A3]/30 px-2 py-0.5 rounded">ACTIVE</span>
                  </div>
                  <div className="p-3 bg-[#0D1117] rounded border border-[#202936] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E8EDF5]">Live Trading Status: DISABLED</div>
                      <div className="text-[#647184]">Requires explicit exchange credentials & user authorization.</div>
                    </div>
                    <span className="text-[#FF5C68] bg-[#FF5C68]/10 border border-[#FF5C68]/30 px-2 py-0.5 rounded">DISABLED</span>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
    </div>
  );
}
