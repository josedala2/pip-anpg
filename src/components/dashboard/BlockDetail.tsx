import { useId } from "react";
import { Link } from "react-router-dom";
import { type OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, GitCompareArrows, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { PendingDataBadge } from "@/components/ui/PendingDataBadge";

interface BlockDetailProps {
  block: OilBlock;
  onClose: () => void;
}

const PhaseColors: Record<string, string> = {
  Production: "bg-success text-success-foreground",
  Development: "bg-warning text-warning-foreground",
  Exploration: "bg-primary text-primary-foreground",
  Suspended: "bg-danger text-danger-foreground",
  Bidding: "bg-[hsl(280,65%,60%)] text-white",
};

export const BlockDetail = ({ block, onClose }: BlockDetailProps) => {
  const riskColor = block.riskScore <= 3 ? "text-success" : block.riskScore <= 6 ? "text-warning" : "text-danger";
  const uid = useId().replace(/:/g, "");
  const detailProdGradId = `detailProdGrad-${uid}`;
  const avgProd = block.productionHistory.length > 0 ? Math.round(block.productionHistory.reduce((s, d) => s + d.value, 0) / block.productionHistory.length) : 0;
  const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg 2xl:max-w-xl bg-card border-l border-border overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-card/90 backdrop-blur-xl border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl 2xl:text-3xl font-bold">{block.name}</h2>
              {block.pendingRealData && <PendingDataBadge />}
            </div>
            <Badge className={PhaseColors[block.phase]}>{block.phase}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/compare?blocks=${block.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium shadow-sm"
              title="Comparar este bloco"
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Comparar</span>
            </Link>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 2xl:gap-4 text-sm">
            {[
              ["Operator", block.operator],
              ["Partners", block.partners.join(", ")],
              ["Basin", block.basin],
              ["Contract", new Date(block.contractDate).toLocaleDateString()],
              ["Daily Production", `${block.dailyProduction.toLocaleString()} BOPD`],
              ["Reserves (STOOIP)", `${block.estimatedReserves} Mb`],
              ...(block.currentReservesMMBO ? [["Current Reserves", `${block.currentReservesMMBO} MMBO`]] : []),
              ...(block.recoveryFactorPercent ? [["Recovery Factor", `${block.recoveryFactorPercent}%`]] : []),
              ["Investment", `$${block.accumulatedInvestment}M / $${block.plannedInvestment}M`],
              ["Execution Rate", `${block.executionRate}%`],
            ].map(([label, value]) => (
               <div key={label} className="glass-card p-3 2xl:p-4">
                 <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                 <div className="font-semibold text-xs 2xl:text-sm">{value}</div>
              </div>
            ))}
          </div>

          {/* Risk & Compliance */}
          <div className="flex gap-4">
            <Card className="flex-1 glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                <div className={`text-3xl 2xl:text-4xl font-bold font-mono ${riskColor}`}>{block.riskScore}</div>
                <div className="text-[10px] text-muted-foreground">/10</div>
              </CardContent>
            </Card>
            <Card className="flex-1 glass-card">
              <CardContent className="p-4 text-center relative">
                <div className="text-xs text-muted-foreground mb-1">Compliance</div>
                <svg viewBox="0 0 36 36" className="w-16 h-16 mx-auto">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={block.complianceScore >= 90 ? "hsl(var(--success))" : block.complianceScore >= 70 ? "hsl(var(--warning))" : "hsl(var(--danger))"}
                    strokeWidth="3"
                    strokeDasharray={`${block.complianceScore}, 100`}
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
                    {block.complianceScore}%
                  </text>
                </svg>
              </CardContent>
            </Card>
          </div>

          {/* Production Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm">Production Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={block.productionHistory}>
                  <defs>
                    <linearGradient id={detailProdGradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={50} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val.toLocaleString()} BOPD`, "Produção"]} />
                  {avgProd > 0 && <ReferenceLine y={avgProd} stroke="hsl(var(--warning))" strokeDasharray="6 4" strokeWidth={1} />}
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill={`url(#${detailProdGradId})`} strokeWidth={2} animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* CAPEX Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm">CAPEX vs Plan ($M)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={block.capexHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={40} stroke="hsl(var(--border))" tickFormatter={v => `$${v}M`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number, name: string) => [`$${val}M`, name]} />
                  <Bar dataKey="planned" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Planeado" animationDuration={800} />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Real" animationDuration={800} animationBegin={200} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
