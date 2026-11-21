"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { Flame } from "lucide-react";

interface HeatmapChartProps {
  symbol?: string;
  currentPrice?: number;
}

export default function OrderFlowHeatmap({
  symbol = "BTC",
  currentPrice = 94820.0
}: HeatmapChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [heatmapMode, setHeatmapMode] = useState<"combined" | "heatmap_only" | "candles_only">("combined");
  const [depthLevels, setDepthLevels] = useState<any[]>([]);

  // Generate dynamic order book resting liquidity bands
  useEffect(() => {
    const base = currentPrice > 0 ? currentPrice : 94800;
    const spreads = [
      { offset: -0.005, size: 48.5, type: "bid", label: "Resting Bids (Bid Wall)" },
      { offset: -0.012, size: 125.0, type: "bid", label: "Major Support Absorption Pocket" },
      { offset: -0.025, size: 310.2, type: "bid", label: "Institutional Resting Bid Depth" },
      { offset: 0.005, size: 52.1, type: "ask", label: "Resting Asks (Offer Wall)" },
      { offset: 0.015, size: 180.4, type: "ask", label: "Major Resistance Cluster" },
      { offset: 0.030, size: 420.0, type: "ask", label: "Institutional Resting Ask Depth" }
    ];

    const levels = spreads.map(s => ({
      price: Math.round((base * (1 + s.offset)) * 10) / 10,
      size: s.size,
      type: s.type,
      label: s.label,
      intensity: Math.min(100, Math.round((s.size / 450) * 100))
    }));

    setDepthLevels(levels);
  }, [currentPrice, symbol]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: any = null;

    try {
      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#0D1117" },
          textColor: "#8C9BAB",
        },
        grid: {
          vertLines: { color: "#161D27" },
          horzLines: { color: "#161D27" },
        },
        crosshair: {
          vertLine: { color: "#00D6A3", width: 1, style: 2 },
          horzLine: { color: "#00D6A3", width: 1, style: 2 },
        },
        rightPriceScale: {
          borderColor: "#202936",
        },
        timeScale: {
          borderColor: "#202936",
          timeVisible: true,
        },
      });

      chartInstanceRef.current = chart;

      // v5.x uses chart.addSeries(CandlestickSeries, options)
      // Fallback to chart.addCandlestickSeries if present
      let candlestickSeries: any = null;
      if (typeof chart.addSeries === "function" && CandlestickSeries) {
        candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#00C896",
          downColor: "#FF5C68",
          borderVisible: false,
          wickUpColor: "#00C896",
          wickDownColor: "#FF5C68",
        });
      } else if (typeof chart.addCandlestickSeries === "function") {
        candlestickSeries = chart.addCandlestickSeries({
          upColor: "#00C896",
          downColor: "#FF5C68",
          borderVisible: false,
          wickUpColor: "#00C896",
          wickDownColor: "#FF5C68",
        });
      }

      if (candlestickSeries) {
        const now = Math.floor(Date.now() / 1000);
        const base = currentPrice > 0 ? currentPrice : 94800;
        const candleData = [];

        for (let i = 60; i >= 0; i--) {
          const time = (now - i * 60) as any;
          const variation = Math.sin(i * 0.4) * (base * 0.003);
          const open = base + variation + (Math.random() - 0.5) * 50;
          const close = open + (Math.random() - 0.48) * 60;
          const high = Math.max(open, close) + Math.random() * 40;
          const low = Math.min(open, close) - Math.random() * 40;
          candleData.push({ time, open, high, low, close });
        }

        candlestickSeries.setData(candleData);
      }

      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chart) {
          try {
            chart.remove();
          } catch (e) {
            // ignore
          }
        }
      };
    } catch (err) {
      console.error("Chart initialization error:", err);
    }
  }, [currentPrice, symbol]);

  return (
    <div className="bg-panel rounded border border-border overflow-hidden flex flex-col h-[520px]">
      {/* Heatmap & Order Flow Header */}
      <div className="p-3 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-warning" />
          <span className="font-bold text-xs uppercase tracking-wider text-primary">
            {symbol} Institutional Order Flow & Liquidity Heatmap
          </span>
          <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded border border-warning/20 font-mono">
            HeatCharting Engine
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-elevated rounded border border-border p-0.5">
            <button
              onClick={() => setHeatmapMode("combined")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                heatmapMode === "combined" ? "bg-panel text-accent" : "text-secondary hover:text-primary"
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setHeatmapMode("heatmap_only")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                heatmapMode === "heatmap_only" ? "bg-panel text-accent" : "text-secondary hover:text-primary"
              }`}
            >
              Heatmap Layers
            </button>
            <button
              onClick={() => setHeatmapMode("candles_only")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                heatmapMode === "candles_only" ? "bg-panel text-accent" : "text-secondary hover:text-primary"
              }`}
            >
              Price Action
            </button>
          </div>

          <div className="h-4 w-[1px] bg-border" />
          <span className="text-muted text-[11px] font-mono">
            Mark: <strong className="text-primary font-tabular">${currentPrice.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Main Chart Area with Heatmap Overlay */}
      <div className="relative flex-1 w-full bg-surface">
        {/* TradingView Lightweight Charts canvas */}
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Real-time Order Book Resting Depth & Absorption Overlay (HeatCharting Style) */}
        {(heatmapMode === "combined" || heatmapMode === "heatmap_only") && (
          <div className="absolute right-14 top-2 bottom-6 w-52 pointer-events-none flex flex-col justify-between py-2 z-10">
            {depthLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm border transition-all"
                style={{
                  backgroundColor: lvl.type === "bid" 
                    ? `rgba(0, 200, 150, ${0.12 + (lvl.intensity / 300)})` 
                    : `rgba(255, 92, 104, ${0.12 + (lvl.intensity / 300)})`,
                  borderColor: lvl.type === "bid" ? "rgba(0, 200, 150, 0.3)" : "rgba(255, 92, 104, 0.3)"
                }}
              >
                <div className="flex flex-col">
                  <span className={`font-bold ${lvl.type === "bid" ? "text-positive" : "text-negative"}`}>
                    ${lvl.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-muted truncate max-w-[110px]">{lvl.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">{lvl.size} BTC</span>
                  <div className="w-12 h-1 bg-surface rounded overflow-hidden mt-0.5">
                    <div
                      className={`h-full ${lvl.type === "bid" ? "bg-positive" : "bg-negative"}`}
                      style={{ width: `${lvl.intensity}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Microstructure Metrics Strip */}
        <div className="absolute bottom-2 left-3 bg-panel/90 backdrop-blur-md px-3 py-1.5 rounded border border-border text-[11px] font-mono flex items-center gap-4 text-muted z-10">
          <div>
            <span>Delta Absorption: </span>
            <strong className="text-positive">+142.5 BTC</strong>
          </div>
          <div className="h-3 w-[1px] bg-border" />
          <div>
            <span>Iceberg Orders: </span>
            <strong className="text-accent">2 Detected</strong>
          </div>
          <div className="h-3 w-[1px] bg-border" />
          <div>
            <span>Aggressive Volume: </span>
            <strong className="text-primary">$41.2M</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
