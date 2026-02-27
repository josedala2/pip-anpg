import { useState } from "react";
import { KPICards } from "./KPICards";
import { OverviewBlockList } from "./OverviewBlockList";
import { FilterBar, type FilterState } from "./FilterBar";
import { type OilBlock, getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate } from "@/data/angolaBlocks";
import { PanelRightClose, PanelRightOpen, BarChart3, Layers, TrendingUp, Activity, Boxes, DollarSign } from "lucide-react";

const kpiData = [
  { label: "Produção", value: getTotalProduction(), prefix: "", suffix: " BOPD", formatted: Math.round(getTotalProduction()).toLocaleString(), icon: Activity, color: "text-primary" },
  { label: "Reservas", value: getTotalReserves(), prefix: "", suffix: " Mb", formatted: Math.round(getTotalReserves()).toLocaleString(), icon: BarChart3, color: "text-success" },
  { label: "Blocos Ativos", value: getActiveBlocks(), prefix: "", suffix: "", formatted: getActiveBlocks().toString(), icon: Boxes, color: "text-warning" },
  { label: "CAPEX", value: getTotalCapex(), prefix: "$", suffix: "M", formatted: Math.round(getTotalCapex()).toLocaleString(), icon: DollarSign, color: "text-primary" },
  { label: "Execução", value: getAvgExecutionRate(), prefix: "", suffix: "%", formatted: Math.round(getAvgExecutionRate()).toString(), icon: TrendingUp, color: "text-success" },
];
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mini production trend data (aggregated)
const trendData = [
  { month: "Jul", value: 1180000 },
  { month: "Ago", value: 1210000 },
  { month: "Set", value: 1195000 },
  { month: "Out", value: 1250000 },
  { month: "Nov", value: 1280000 },
  { month: "Dez", value: 1304000 },
];

type Tab = "kpis" | "blocks" | "trends";

interface OverviewSidebarProps {
  filteredIds: string[];
  selectedBlock: OilBlock | null;
  onBlockSelect: (block: OilBlock) => void;
  onFilterChange: (filters: FilterState) => void;
}

export const OverviewSidebar = ({
  filteredIds,
  selectedBlock,
  onBlockSelect,
  onFilterChange,
}: OverviewSidebarProps) => {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("kpis");

  if (!open) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="absolute top-4 right-4 z-30 glass-card p-2.5 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors shadow-lg"
          title="Abrir painel"
        >
          <PanelRightOpen className="w-5 h-5 text-muted-foreground" />
        </button>
        {/* Floating KPI mini-cards */}
        <div className="absolute bottom-4 left-4 right-4 z-30 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {kpiData.map((kpi, i) => (
              <div
                key={kpi.label}
                className="glass-card rounded-lg px-3 py-2 border border-border/50 shadow-lg flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium">{kpi.label}</span>
                  <span className={`text-sm font-bold font-mono tabular-nums ${kpi.color}`}>
                    {kpi.prefix}{kpi.formatted}{kpi.suffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "kpis", label: "KPIs", icon: BarChart3 },
    { key: "blocks", label: "Blocos", icon: Layers },
    { key: "trends", label: "Tendências", icon: TrendingUp },
  ];

  return (
    <div className="absolute top-0 right-0 z-30 h-full w-[420px] max-w-[90vw] flex flex-col bg-background/85 backdrop-blur-2xl border-l border-border/50 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          title="Fechar painel"
        >
          <PanelRightClose className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Filters (always visible) */}
      <div className="px-4 py-2 border-b border-border/30">
        <FilterBar onFilterChange={onFilterChange} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {activeTab === "kpis" && (
          <div className="animate-fade-in">
            <KPICards compact />
            {/* Mini trend chart */}
            <div className="mt-4 glass-card rounded-lg p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Produção Total (6 meses)</h4>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="overviewProdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} width={45} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} stroke="hsl(var(--border))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`${(value / 1000).toFixed(0)}k BOPD`, "Produção"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#overviewProdGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "blocks" && (
          <div className="animate-fade-in">
            <OverviewBlockList
              filteredIds={filteredIds}
              selectedBlock={selectedBlock}
              onBlockSelect={onBlockSelect}
            />
          </div>
        )}

        {activeTab === "trends" && (
          <div className="animate-fade-in space-y-4">
            {/* Production by basin */}
            <div className="glass-card rounded-lg p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Produção por Bacia</h4>
              {[
                { name: "Bacia do Congo", value: 890000, pct: 68 },
                { name: "Bacia do Kwanza", value: 320000, pct: 25 },
                { name: "Bacia do Namibe", value: 94000, pct: 7 },
              ].map((basin) => (
                <div key={basin.name} className="mb-2">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-foreground font-medium">{basin.name}</span>
                    <span className="font-mono text-muted-foreground">{(basin.value / 1000).toFixed(0)}k BOPD</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${basin.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Phase distribution */}
            <div className="glass-card rounded-lg p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Distribuição por Fase</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { phase: "Production", count: 28, color: "hsl(var(--success))" },
                  { phase: "Development", count: 8, color: "hsl(var(--warning))" },
                  { phase: "Exploration", count: 12, color: "hsl(var(--primary))" },
                  { phase: "Bidding", count: 22, color: "hsl(var(--bidding))" },
                  { phase: "Suspended", count: 2, color: "hsl(var(--danger))" },
                ].map((item) => (
                  <div key={item.phase} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-foreground">{item.phase}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment summary */}
            <div className="glass-card rounded-lg p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Investimento Acumulado</h4>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={[
                  { year: "2020", value: 8200 },
                  { year: "2021", value: 12500 },
                  { year: "2022", value: 18700 },
                  { year: "2023", value: 32400 },
                  { year: "2024", value: 49870 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} width={35} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`} stroke="hsl(var(--border))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value}M`, "CAPEX"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.1)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
