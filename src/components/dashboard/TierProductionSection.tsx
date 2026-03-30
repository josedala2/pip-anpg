import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartWrapper } from "@/components/dashboard/ChartWrapper";
import { Layers } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Brush, ReferenceLine,
} from "recharts";
import type { TierProductionProfile } from "@/data/angolaBlocks";

interface Props {
  profiles: TierProductionProfile[];
  tooltipStyle: React.CSSProperties;
  legendStyle: React.CSSProperties;
}

const TIERS = [
  { key: "total" as const, label: "Total", color: "hsl(var(--foreground))" },
  { key: "tier1" as const, label: "Tier 1", color: "hsl(var(--primary))" },
  { key: "tier2_3" as const, label: "Tier 2&3", color: "hsl(var(--warning))" },
];

export const TierProductionSection = ({ profiles, tooltipStyle, legendStyle }: Props) => {
  const [vis, setVis] = useState({ total: true, tier1: true, tier2_3: true });
  const toggle = (key: keyof typeof vis) => setVis(prev => ({ ...prev, [key]: !prev[key] }));

  const first = profiles[0];
  const last = profiles[profiles.length - 1];
  const declineTotal = (((first.total - last.total) / first.total) * 100).toFixed(0);
  const crossYear = profiles.find(p => p.tier2_3 <= 5000)?.year || "—";

  return (
    <div className="pt-2">
      <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-warning" />Perfil de Produção por Tier (2026–2050)
      </h3>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {TIERS.map(t => (
          <button
            key={t.key}
            onClick={() => toggle(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              vis[t.key]
                ? "border-border bg-secondary/80 shadow-sm"
                : "border-border/40 bg-muted/30 opacity-50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: vis[t.key] ? t.color : "hsl(var(--muted))" }} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartWrapper title="Produção por Tier — Área Empilhada" height={400} fullscreenHeight={650}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profiles} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="tierGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="tierGrad23" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number, name: string) => [`${val.toLocaleString()} BOPD`, name]} />
              <Legend wrapperStyle={legendStyle} />
              {vis.tier1 && <Area type="monotone" dataKey="tier1" name="Tier 1 (Nemba, Mafumeira, N'Dola, Sanha)" stackId="1" stroke="hsl(var(--primary))" fill="url(#tierGrad1)" strokeWidth={2} animationDuration={1000} />}
              {vis.tier2_3 && <Area type="monotone" dataKey="tier2_3" name="Tier 2&3 (Takula, Lifua, Banzala, Malongo)" stackId="1" stroke="hsl(var(--warning))" fill="url(#tierGrad23)" strokeWidth={2} animationDuration={1000} animationBegin={300} />}
              <Brush dataKey="year" height={22} stroke="hsl(var(--primary))" fill="hsl(var(--muted))" travellerWidth={8} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Total vs Tier 1 vs Tier 2&3" height={400} fullscreenHeight={650}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profiles} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number, name: string) => [`${val.toLocaleString()} BOPD`, name]} />
              <Legend wrapperStyle={legendStyle} />
              {vis.total && <Line type="monotone" dataKey="total" name="Total Bloco" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={false} animationDuration={1000} />}
              {vis.tier1 && <Line type="monotone" dataKey="tier1" name="Tier 1" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={1000} animationBegin={200} />}
              {vis.tier2_3 && <Line type="monotone" dataKey="tier2_3" name="Tier 2&3" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={1000} animationBegin={400} />}
              <ReferenceLine y={50000} stroke="hsl(var(--danger))" strokeDasharray="8 4" strokeWidth={1}
                label={{ value: "Limiar 50k", position: "insideTopRight", fill: "hsl(var(--danger))", fontSize: 10 }} />
              <Brush dataKey="year" height={22} stroke="hsl(var(--primary))" fill="hsl(var(--muted))" travellerWidth={8} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Card className="glass-card">
          <CardContent className="p-3 text-center">
            <span className="text-[10px] text-muted-foreground">Produção 2026</span>
            <div className="text-lg font-bold">{first.total.toLocaleString()}</div>
            <span className="text-[10px] text-muted-foreground">BOPD</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 text-center">
            <span className="text-[10px] text-muted-foreground">Produção 2050</span>
            <div className="text-lg font-bold">{last.total.toLocaleString()}</div>
            <span className="text-[10px] text-muted-foreground">BOPD</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 text-center">
            <span className="text-[10px] text-muted-foreground">Declínio Total</span>
            <div className="text-lg font-bold text-danger">{declineTotal}%</div>
            <span className="text-[10px] text-muted-foreground">2026→2050</span>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 text-center">
            <span className="text-[10px] text-muted-foreground">Tier 2&3 Estabiliza</span>
            <div className="text-lg font-bold text-warning">{crossYear}</div>
            <span className="text-[10px] text-muted-foreground">≤5k BOPD</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
