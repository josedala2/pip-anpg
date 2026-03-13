import { useMemo, useState } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  getNationalEconomicKPIs,
  getRevenueByBasin,
  getRevenueByOperator,
  getAggregatedCashFlow,
  classificationColors,
  type EconomicClassification,
  type EconomicScoreResult,
} from "@/lib/economicScoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, Area, AreaChart,
} from "recharts";
import {
  DollarSign, TrendingUp, Gauge, Target, ShieldAlert, BarChart3,
  ArrowUpDown, ChevronDown, ChevronUp, Info, Wallet, Scale, AlertTriangle,
} from "lucide-react";
import { CostStructurePanel } from "./CostStructurePanel";
import { FiscalImpactPanel } from "./FiscalImpactPanel";
import { EconomicRiskPanel } from "./EconomicRiskPanel";
import { EconomicScenariosPanel } from "./EconomicScenariosPanel";
import { AdvancedForecastPanel } from "./AdvancedForecastPanel";

const CHART_COLORS = [
  "hsl(200, 45%, 28%)", "hsl(152, 50%, 38%)", "hsl(38, 75%, 48%)",
  "hsl(280, 50%, 55%)", "hsl(199, 70%, 45%)", "hsl(0, 65%, 42%)",
  "hsl(160, 40%, 50%)", "hsl(30, 60%, 55%)",
];

type SortKey = "totalScore" | "dailyProduction" | "opexPerBarrel" | "breakeven" | "npvTotal" | "stateRevenue";

type SubTab = "dashboard" | "custos" | "fiscal" | "risco" | "cenarios" | "previsao";

const subTabs: { key: SubTab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "custos", label: "Estrutura de Custos", icon: Wallet },
  { key: "fiscal", label: "Impacto Fiscal", icon: Scale },
  { key: "risco", label: "Risco Económico", icon: AlertTriangle },
  { key: "cenarios", label: "Cenários", icon: TrendingUp },
  { key: "previsao", label: "Previsão", icon: Layers },
];

export const EconomicFinancialPanel = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("dashboard");
  const [sortKey, setSortKey] = useState<SortKey>("totalScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const kpis = useMemo(() => getNationalEconomicKPIs(oilBlocks), []);
  const revenueByBasin = useMemo(() => getRevenueByBasin(oilBlocks), []);
  const revenueByOperator = useMemo(() => getRevenueByOperator(oilBlocks), []);
  const cashFlow = useMemo(() => getAggregatedCashFlow(oilBlocks), []);

  const sortedScores = useMemo(() => {
    const arr = [...kpis.scores];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [kpis.scores, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex ml-0.5">
      {sortKey === col ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 w-fit">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeSubTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === "custos" && <CostStructurePanel />}
      {activeSubTab === "fiscal" && <FiscalImpactPanel />}
      {activeSubTab === "risco" && <EconomicRiskPanel />}
      {activeSubTab === "cenarios" && <EconomicScenariosPanel />}

      {activeSubTab === "dashboard" && (
        <>

      {/* ── National KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          icon={DollarSign}
          label="Receita Estado (anual)"
          value={`$${(kpis.totalStateRevenue / 1000).toFixed(1)}B`}
          sub="Estimativa fiscal anual"
          status="primary"
        />
        <KPICard
          icon={TrendingUp}
          label="NPV Total Concessões"
          value={`$${(kpis.totalNPV / 1000).toFixed(1)}B`}
          sub="Full-cycle + Point Forward"
          status="success"
        />
        <KPICard
          icon={Gauge}
          label="OPEX Médio/Barril"
          value={`$${kpis.avgOpexPerBarrel.toFixed(1)}`}
          sub="Média ponderada por produção"
          status={kpis.avgOpexPerBarrel > 25 ? "warning" : "primary"}
        />
        <KPICard
          icon={Target}
          label="Break-even Médio"
          value={`$${kpis.avgBreakeven.toFixed(1)}`}
          sub={`Brent ref: $${kpis.brentPrice}/bbl`}
          status={kpis.avgBreakeven > kpis.brentPrice * 0.7 ? "warning" : "success"}
        />
        <KPICard
          icon={BarChart3}
          label="Produção Viável"
          value={`${(kpis.viableProduction / 1000).toFixed(0)}k`}
          sub="BOPD abaixo 80% Brent"
          status="success"
        />
        <KPICard
          icon={ShieldAlert}
          label="Produção em Risco"
          value={`${(kpis.atRiskProduction / 1000).toFixed(0)}k`}
          sub="BOPD acima 80% Brent"
          status={kpis.atRiskProduction > 0 ? "danger" : "success"}
        />
      </div>

      {/* ── Classification Summary ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Classificação Económica das Concessões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(kpis.classificationCounts) as [EconomicClassification, number][]).map(([cls, count]) => {
              const cfg = classificationColors[cls];
              return (
                <div key={cls} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 ${cfg.bg}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-semibold ${cfg.text}`}>{cls}</span>
                  <span className="text-lg font-bold text-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Ranking Table ── */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Ranking de Valor das Concessões
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Score económico de 0-100 calculado em 5 dimensões: Rentabilidade (30%), Eficiência de Custos (20%), Sustentabilidade (20%), Contribuição Fiscal (15%), Risco Económico (15%).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] uppercase tracking-wider">
                  <TableHead className="w-[180px]">Concessão</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("dailyProduction")}>
                    Produção <SortIcon col="dailyProduction" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("opexPerBarrel")}>
                    OPEX/bbl <SortIcon col="opexPerBarrel" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("breakeven")}>
                    Break-even <SortIcon col="breakeven" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("npvTotal")}>
                    NPV <SortIcon col="npvTotal" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("stateRevenue")}>
                    Receita Estado <SortIcon col="stateRevenue" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("totalScore")}>
                    Score <SortIcon col="totalScore" />
                  </TableHead>
                  <TableHead>Classificação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedScores.map((s) => (
                  <RankingRow
                    key={s.blockId}
                    score={s}
                    expanded={expandedRow === s.blockId}
                    onToggle={() => setExpandedRow(expandedRow === s.blockId ? null : s.blockId)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Evolution */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Evolução da Receita Petrolífera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow.filter(c => c.year >= 2004 && c.year <= 2040)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}`} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`$${v.toLocaleString()}MM`, ""]}
                  />
                  <Area type="monotone" dataKey="impostos" stackId="1" fill="hsl(200, 45%, 28%)" stroke="hsl(200, 45%, 28%)" fillOpacity={0.3} name="Impostos" />
                  <Area type="monotone" dataKey="ge" stackId="1" fill="hsl(152, 50%, 38%)" stroke="hsl(152, 50%, 38%)" fillOpacity={0.3} name="GE" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Basin */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Receita por Bacia Petrolífera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByBasin}
                    dataKey="revenue"
                    nameKey="basin"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ basin, percent }: { basin: string; percent: number }) => `${basin} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {revenueByBasin.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: number) => [`$${v.toFixed(0)}MM/ano`, "Receita"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Operator */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Receita Estado por Operador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByOperator} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${v}MM`} />
                <YAxis type="category" dataKey="operator" tick={{ fontSize: 10 }} className="fill-muted-foreground" width={75} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  formatter={(v: number) => [`$${v.toFixed(0)}MM/ano`, "Receita Estado"]}
                />
                <Bar dataKey="revenue" fill="hsl(200, 45%, 28%)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};

// ── Sub-components ──

function KPICard({ icon: Icon, label, value, sub, status }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  status: "primary" | "success" | "warning" | "danger";
}) {
  const colors = {
    primary: "text-primary border-primary/20 bg-primary/5",
    success: "text-success border-success/20 bg-success/5",
    warning: "text-warning border-warning/20 bg-warning/5",
    danger: "text-danger border-danger/20 bg-danger/5",
  };

  return (
    <div className={`rounded-lg border p-3 ${colors[status]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 opacity-70" />
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-success" : score >= 60 ? "bg-[hsl(var(--chart-5))]" : score >= 40 ? "bg-warning" : score >= 20 ? "bg-[hsl(var(--chart-4))]" : "bg-danger";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold tabular-nums">{score}</span>
    </div>
  );
}

function RankingRow({ score: s, expanded, onToggle }: { score: EconomicScoreResult; expanded: boolean; onToggle: () => void }) {
  const cfg = classificationColors[s.classification];

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/30 text-xs" onClick={onToggle}>
        <TableCell className="font-medium">{s.blockName}</TableCell>
        <TableCell className="text-muted-foreground">{s.operator}</TableCell>
        <TableCell className="tabular-nums">{s.dailyProduction > 0 ? `${(s.dailyProduction / 1000).toFixed(1)}k` : "—"}</TableCell>
        <TableCell className="tabular-nums">${s.opexPerBarrel.toFixed(1)}</TableCell>
        <TableCell className="tabular-nums">${s.breakeven.toFixed(1)}</TableCell>
        <TableCell className="tabular-nums">{s.npvTotal > 1000 ? `$${(s.npvTotal / 1000).toFixed(1)}B` : `$${s.npvTotal.toFixed(0)}MM`}</TableCell>
        <TableCell className="tabular-nums">${s.stateRevenue.toFixed(0)}MM</TableCell>
        <TableCell><ScoreBar score={s.totalScore} /></TableCell>
        <TableCell>
          <Badge variant="outline" className={`text-[10px] ${cfg.text} ${cfg.bg} border-0`}>
            {s.classification}
          </Badge>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/20 p-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {s.dimensions.map(d => (
                <div key={d.label} className="space-y-1">
                  <div className="text-[10px] font-semibold text-muted-foreground">{d.label} ({d.weight}%)</div>
                  <ScoreBar score={d.score} />
                  <ul className="text-[10px] text-muted-foreground space-y-0.5">
                    {d.drivers.map((dr, i) => <li key={i}>• {dr}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground italic">
              💡 {s.recommendation}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
