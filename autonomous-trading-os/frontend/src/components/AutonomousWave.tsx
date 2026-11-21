"use client";

import React, { useEffect, useRef } from "react";

interface AutonomousWaveProps {
  height?: number;
  className?: string;
  label?: string;
  glowColor?: string;
  lineColor?: string;
}

export default function AutonomousWave({
  height = 96,
  className = "",
  label = "AUTONOMOUS STREAM",
  glowColor = "rgba(0, 211, 90, 0.45)",
  lineColor = "#00D35A",
}: AutonomousWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      // Handle high-DPI
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

      t += 0.032;

      // Draw flowing sine wave
      const points: { x: number; y: number }[] = [];
      const step = 4;
      const midY = h * 0.52;
      const amp1 = h * 0.28;
      const amp2 = h * 0.12;

      for (let x = 0; x <= width + step; x += step) {
        const norm = x / width;
        // Two coupled harmonic frequencies creating the organic S-curve shown in the user's reference
        const y =
          midY +
          Math.sin(norm * Math.PI * 2.2 - t) * amp1 +
          Math.cos(norm * Math.PI * 1.1 + t * 0.7) * amp2;
        points.push({ x, y });
      }

      // Draw Gradient Fill under the wave
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

        // Draw Ambient Horizontal Glow Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.8;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Secondary subtle crisp line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#4EFA8F";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [height, glowColor, lineColor]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#03060C] border border-[#141C2B] overflow-hidden flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_25px_rgba(0,0,0,0.5)] ${className}`}
      style={{ height }}
    >
      {/* Label and Live Pulse dot */}
      <div className="absolute top-2.5 left-3.5 z-10 flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-wider text-[#00D35A] select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D35A] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D35A]"></span>
        </span>
        <span>{label}</span>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
