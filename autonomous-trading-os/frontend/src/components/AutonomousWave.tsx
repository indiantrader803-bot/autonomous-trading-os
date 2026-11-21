"use client";

import React, { useState, useEffect, useRef } from "react";

interface AutonomousWaveProps {
  height?: number;
  className?: string;
  label?: string;
  glowColor?: string;
  lineColor?: string;
}

type Timeframe = "1S" | "1M" | "5M" | "15M" | "1H" | "LIVE";

export default function AutonomousWave({
  height = 110,
  className = "",
  label = "AUTONOMOUS STREAM · LIQUIDITY OSCILLATION",
  glowColor = "rgba(0, 211, 90, 0.45)",
  lineColor = "#00D35A",
}: AutonomousWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("1M");

  const timeframes: Timeframe[] = ["1S", "1M", "5M", "15M", "1H", "LIVE"];

  // Timeframe-specific wave parameters (speed, frequency, amplitude)
  const tfConfig: Record<Timeframe, { speed: number; freq: number; ampMult: number; labelText: string }> = {
    "1S": { speed: 0.08, freq: 3.5, ampMult: 0.85, labelText: "1-SEC HIGH FREQUENCY ORDERFLOW" },
    "1M": { speed: 0.035, freq: 2.2, ampMult: 1.0, labelText: "1-MIN LIQUIDITY OSCILLATION" },
    "5M": { speed: 0.02, freq: 1.6, ampMult: 1.15, labelText: "5-MIN POOL VOLATILITY BAND" },
    "15M": { speed: 0.012, freq: 1.2, ampMult: 1.25, labelText: "15-MIN MACRO DIVERGENCE" },
    "1H": { speed: 0.007, freq: 0.9, ampMult: 1.35, labelText: "1-HOUR TRENDING BREAKOUT" },
    "LIVE": { speed: 0.06, freq: 2.8, ampMult: 0.95, labelText: "LIVE PUMP.FUN STREAM TICKER" },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const h = height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, h);

      const cfg = tfConfig[selectedTimeframe];
      t += cfg.speed;

      // Draw subtle background grid lines for real chart feel
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridCols = 8;
      for (let i = 1; i < gridCols; i++) {
        const gx = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      const gridRows = 3;
      for (let j = 1; j < gridRows; j++) {
        const gy = (h / gridRows) * j;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Compute wave points based on selected timeframe
      const points: { x: number; y: number }[] = [];
      const step = 4;
      const midY = h * 0.55;
      const amp1 = h * 0.26 * cfg.ampMult;
      const amp2 = h * 0.10 * cfg.ampMult;

      for (let x = 0; x <= width + step; x += step) {
        const norm = x / width;
        const y =
          midY +
          Math.sin(norm * Math.PI * cfg.freq - t) * amp1 +
          Math.cos(norm * Math.PI * (cfg.freq * 0.5) + t * 0.7) * amp2;
        points.push({ x, y });
      }

      // Draw gradient fill under wave
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(width, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, glowColor);
        grad.addColorStop(0.35, "rgba(0, 211, 90, 0.20)");
        grad.addColorStop(0.85, "rgba(0, 211, 90, 0.04)");
        grad.addColorStop(1, "rgba(0, 211, 90, 0.0)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Glowing outer sine curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.8;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Inner crisp neon line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#4EFA8F";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Real-time blinking current-price tick head
        const lastPt = points[points.length - 1];
        if (lastPt) {
          ctx.beginPath();
          ctx.arc(lastPt.x - 2, lastPt.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#00D35A";
          ctx.shadowBlur = 10;
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [height, glowColor, lineColor, selectedTimeframe]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#03060C] border border-[#141C2B] overflow-hidden flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_25px_rgba(0,0,0,0.5)] ${className}`}
      style={{ height }}
    >
      {/* Top Header Bar: Status Indicator + Dynamic Timeframe Selectors */}
      <div className="absolute top-2.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-auto select-none">
        {/* Left Live Label */}
        <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-wider text-[#00D35A]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D35A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D35A]"></span>
          </span>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">AUTONOMOUS</span>
          <span className="text-[#64748B] font-normal">[{selectedTimeframe}]</span>
        </div>

        {/* Right Interactive Timeframe Switcher Tabs */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg">
          {timeframes.map((tf) => {
            const isActive = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTimeframe(tf);
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                  isActive
                    ? "bg-[#00D35A] text-black shadow-[0_0_10px_rgba(0,211,90,0.6)]"
                    : "text-[#8094AE] hover:text-white hover:bg-white/5"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Timeframe Legend Bar at Bottom */}
      <div className="absolute bottom-1.5 left-3.5 right-3.5 z-10 flex items-center justify-between text-[8px] font-mono text-[#64748B] pointer-events-none select-none">
        <span>TICK: {tfConfig[selectedTimeframe].labelText}</span>
        <span className="text-[#00D35A]">SPREAD: 0.08% · REAL-TIME FEED</span>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
