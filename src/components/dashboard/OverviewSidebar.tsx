import { useState } from "react";
import { FilterBar, type FilterState } from "./FilterBar";
import { OverviewBlockList } from "./OverviewBlockList";
import { AnimatedCounter } from "./AnimatedCounter";
import { type OilBlock, getTotalProduction, getTotalReserves, getActiveBlocks, getTotalCapex, getAvgExecutionRate } from "@/data/angolaBlocks";
import { Activity, BarChart3, Boxes, DollarSign, TrendingUp, Filter, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

// Sparkline trend data per KPI (last 6 months)
const sparkData = {
  production: [{ v: 1180 }, { v: 1210 }, { v: 1195 }, { v: 1250 }, { v: 1280 }, { v: 1304 }],
  reserves:   [{ v: 4800 }, { v: 4850 }, { v: 4820 }, { v: 4900 }, { v: 4950 }, { v: 4980 }],
  blocks:     [{ v: 26 }, { v: 27 }, { v: 27 }, { v: 28 }, { v: 28 }, { v: 28 }],
  capex:      [{ v: 42 }, { v: 44 }, { v: 45 }, { v: 47 }, { v: 48 }, { v: 50 }],
  execution:  [{ v: 78 }, { v: 80 }, { v: 79 }, { v: 82 }, { v: 83 }, { v: 84 }],
};

const kpis = [
  { label: "Produção", value: getTotalProduction(), suffix: " BOPD", icon: Activity, accent: "var(--primary)", spark: sparkData.production },
  { label: "Reservas", value: getTotalReserves(), suffix: " Mb", icon: BarChart3, accent: "var(--success)", spark: sparkData.reserves },
  { label: "Blocos Ativos", value: getActiveBlocks(), suffix: "", icon: Boxes, accent: "var(--warning)", spark: sparkData.blocks },
  { label: "CAPEX", value: getTotalCapex(), prefix: "$", suffix: "M", icon: DollarSign, accent: "var(--primary)", spark: sparkData.capex },
  { label: "Execução", value: getAvgExecutionRate(), suffix: "%", icon: TrendingUp, accent: "var(--success)", spark: sparkData.execution },
];

const Sparkline = ({ data, color }: { data: { v: number }[]; color: string }) => (
  <ResponsiveContainer width="100%" height={24}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const trendData = [
  { month: "Jul", value: 1180000 },
  { month: "Ago", value: 1210000 },
  { month: "Set", value: 1195000 },
  { month: "Out", value: 1250000 },
  { month: "Nov", value: 1280000 },
  { month: "Dez", value: 1304000 },
];

const basins = [
  { name: "Bacia do Congo", value: 890000, pct: 68 },
  { name: "Bacia do Kwanza", value: 320000, pct: 25 },
  { name: "Bacia do Namibe", value: 94000, pct: 7 },
];

const phases = [
  { phase: "Production", count: 28, color: "hsl(var(--success))" },
  { phase: "Development", count: 8, color: "hsl(var(--warning))" },
  { phase: "Exploration", count: 12, color: "hsl(var(--primary))" },
  { phase: "Bidding", count: 22, color: "hsl(var(--bidding))" },
  { phase: "Suspended", count: 2, color: "hsl(var(--danger))" },
];

const investData = [
  { year: "2020", value: 8200 },
  { year: "2021", value: 12500 },
  { year: "2022", value: 18700 },
  { year: "2023", value: 32400 },
  { year: "2024", value: 49870 },
];

interface OverviewSidebarProps {
  filteredIds: string[];
  selectedBlock: OilBlock | null;
  onBlockSelect: (block: OilBlock) => void;
  onFilterChange: (filters: FilterState) => void;
}

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-2">
    <span className="h-px flex-1 bg-border/60" />
    <span>{children}</span>
    <span className="h-px flex-1 bg-border/60" />
  </h4>
);

export const OverviewSidebar = ({
  filteredIds,
  selectedBlock,
  onBlockSelect,
  onFilterChange,
}: OverviewSidebarProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="h-full flex flex-col overview-panel border-t md:border-t-0 md:border-l border-border/50">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-bold tracking-tight text-foreground">Command Center</h3>
        <p className="text-[10px] text-muted-foreground">Visão consolidada · Q4 2024</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-5">

          {/* ── KPIs ── */}
          <div>
            <SectionHeader>Indicadores-Chave</SectionHeader>
            <div className="grid grid-cols-3 gap-2">
              {kpis.slice(0, 3).map((kpi, i) => {
                const colorClass = kpi.accent.includes("primary") ? "text-primary" : kpi.accent.includes("success") ? "text-success" : "text-warning";
                return (
                <div key={kpi.label} className="accent-border-card animate-counter-up" style={{ animationDelay: `${i * 80}ms`, borderLeftColor: `hsl(${kpi.accent})` }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <kpi.icon className={`w-3 h-3 ${colorClass}`} />
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium">{kpi.label}</span>
                  </div>
                  <AnimatedCounter target={kpi.value} prefix={kpi.prefix || ""} suffix={kpi.suffix} className={`text-sm font-bold tabular-nums ${colorClass}`} />
                  <div className="mt-1">
                    <Sparkline data={kpi.spark} color={`hsl(${kpi.accent})`} />
                  </div>
                </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {kpis.slice(3).map((kpi, i) => {
                const colorClass = kpi.accent.includes("primary") ? "text-primary" : kpi.accent.includes("success") ? "text-success" : "text-warning";
                return (
                <div key={kpi.label} className="accent-border-card animate-counter-up" style={{ animationDelay: `${(i + 3) * 80}ms`, borderLeftColor: `hsl(${kpi.accent})` }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <kpi.icon className={`w-3 h-3 ${colorClass}`} />
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium">{kpi.label}</span>
                  </div>
                  <AnimatedCounter target={kpi.value} prefix={kpi.prefix || ""} suffix={kpi.suffix} className={`text-sm font-bold tabular-nums ${colorClass}`} />
                  <div className="mt-1">
                    <Sparkline data={kpi.spark} color={`hsl(${kpi.accent})`} />
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* ── Production Trend ── */}
          <div>
            <SectionHeader>Produção Total (6 meses)</SectionHeader>
            <div className="accent-border-card !border-l-0 !p-2">
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="sidebarProdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} width={40} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} stroke="hsl(var(--border))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`${(value / 1000).toFixed(0)}k BOPD`, "Produção"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#sidebarProdGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Production by Basin ── */}
          <div>
            <SectionHeader>Produção por Bacia</SectionHeader>
            <div className="space-y-2">
              {basins.map((basin) => (
                <div key={basin.name}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-foreground font-medium">{basin.name}</span>
                    <span className="font-mono text-muted-foreground">{(basin.value / 1000).toFixed(0)}k BOPD</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${basin.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Phase Distribution ── */}
          <div>
            <SectionHeader>Distribuição por Fase</SectionHeader>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {phases.map((item) => (
                <div key={item.phase} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-foreground truncate">{item.phase}</span>
                  <span className="text-[10px] font-mono text-muted-foreground ml-auto">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Investment Trend ── */}
          <div>
            <SectionHeader>Investimento Acumulado</SectionHeader>
            <div className="accent-border-card !border-l-0 !p-2">
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={investData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} width={32} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`} stroke="hsl(var(--border))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value}M`, "CAPEX"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.1)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Filters (collapsible) ── */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-semibold py-1 cursor-pointer hover:text-foreground transition-colors">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3 h-3" />
                  <span>Filtros</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 pb-1">
                <FilterBar onFilterChange={onFilterChange} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ── Block List ── */}
          <div>
            <SectionHeader>Lista de Blocos</SectionHeader>
            <OverviewBlockList
              filteredIds={filteredIds}
              selectedBlock={selectedBlock}
              onBlockSelect={onBlockSelect}
            />
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};
