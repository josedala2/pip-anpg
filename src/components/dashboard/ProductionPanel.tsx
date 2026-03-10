import { useMemo, useState } from "react";
import { oilBlocks, getTotalProduction } from "@/data/angolaBlocks";
import { AnimatedCounter } from "./AnimatedCounter";
import { ChartWrapper } from "./ChartWrapper";
import { Activity, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, ReferenceLine,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FieldProductionBreakdown } from "./FieldProductionBreakdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))",
  "hsl(var(--danger))", "hsl(210, 70%, 55%)", "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)", "hsl(160, 60%, 45%)", "hsl(340, 65%, 50%)",
  "hsl(200, 55%, 50%)", "hsl(120, 50%, 45%)", "hsl(50, 70%, 50%)",
  "hsl(0, 60%, 50%)", "hsl(240, 50%, 60%)", "hsl(90, 55%, 45%)",
];

// National forecast data (ANPG 2025 slides)
const nationalForecast = [
  { year: 2020, base: 1340, withFID: 0, withoutFID: 0 },
  { year: 2021, base: 1280, withFID: 0, withoutFID: 0 },
  { year: 2022, base: 1200, withFID: 0, withoutFID: 0 },
  { year: 2023, base: 1120, withFID: 0, withoutFID: 0 },
  { year: 2024, base: 1080, withFID: 0, withoutFID: 0 },
  { year: 2025, base: 1050, withFID: 0, withoutFID: 0 },
  { year: 2026, base: 980, withFID: 60, withoutFID: 0 },
  { year: 2027, base: 920, withFID: 130, withoutFID: 20 },
  { year: 2028, base: 870, withFID: 210, withoutFID: 50 },
  { year: 2029, base: 830, withFID: 280, withoutFID: 90 },
  { year: 2030, base: 790, withFID: 340, withoutFID: 140 },
  { year: 2031, base: 750, withFID: 380, withoutFID: 200 },
  { year: 2032, base: 710, withFID: 400, withoutFID: 260 },
  { year: 2033, base: 680, withFID: 410, withoutFID: 310 },
  { year: 2034, base: 650, withFID: 420, withoutFID: 350 },
  { year: 2035, base: 620, withFID: 420, withoutFID: 380 },
  { year: 2036, base: 590, withFID: 410, withoutFID: 400 },
  { year: 2037, base: 560, withFID: 400, withoutFID: 640 },
  { year: 2038, base: 530, withFID: 380, withoutFID: 590 },
  { year: 2039, base: 500, withFID: 350, withoutFID: 540 },
  { year: 2040, base: 470, withFID: 320, withoutFID: 490 },
  { year: 2042, base: 420, withFID: 260, withoutFID: 380 },
  { year: 2045, base: 350, withFID: 180, withoutFID: 270 },
  { year: 2048, base: 280, withFID: 120, withoutFID: 180 },
  { year: 2050, base: 230, withFID: 80, withoutFID: 120 },
];

// Historical production by year (stacked by top blocks)
const historicalByBlock = [
  { year: "2018", "Block 15": 380, "Block 17": 290, "Block 14": 120, "Block 15/06": 150, "Block 0": 140, "Outros": 220 },
  { year: "2019", "Block 15": 365, "Block 17": 275, "Block 14": 125, "Block 15/06": 145, "Block 0": 135, "Outros": 215 },
  { year: "2020", "Block 15": 350, "Block 17": 260, "Block 14": 130, "Block 15/06": 140, "Block 0": 130, "Outros": 210 },
  { year: "2021", "Block 15": 345, "Block 17": 245, "Block 14": 132, "Block 15/06": 135, "Block 0": 120, "Outros": 195 },
  { year: "2022", "Block 15": 340, "Block 17": 230, "Block 14": 135, "Block 15/06": 128, "Block 0": 115, "Outros": 185 },
  { year: "2023", "Block 15": 335, "Block 17": 210, "Block 14": 137, "Block 15/06": 125, "Block 0": 108, "Outros": 175 },
  { year: "2024", "Block 15": 330, "Block 17": 195, "Block 14": 136, "Block 15/06": 122, "Block 0": 102, "Outros": 165 },
  { year: "2025", "Block 15": 325, "Block 17": 182, "Block 14": 135, "Block 15/06": 121, "Block 0": 98, "Outros": 189 },
];

const stackKeys = ["Block 15", "Block 17", "Block 14", "Block 15/06", "Block 0", "Outros"];
const stackColors = [COLORS[0], COLORS[1], COLORS[2], COLORS[3], COLORS[4], COLORS[7]];

type SortKey = "name" | "dailyProduction" | "pct" | "operator" | "basin";

const operators = [...new Set(oilBlocks.filter(b => b.dailyProduction > 0).map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.filter(b => b.dailyProduction > 0).map(b => b.basin))].sort();

export const ProductionPanel = () => {
  const [sortKey, setSortKey] = useState<SortKey>("dailyProduction");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterBasin, setFilterBasin] = useState("all");

  const filteredBlocks = useMemo(() =>
    oilBlocks.filter(b => {
      if (b.dailyProduction <= 0) return false;
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      return true;
    }),
    [filterOperator, filterBasin]
  );

  const totalProduction = useMemo(() => filteredBlocks.reduce((s, b) => s + b.dailyProduction, 0), [filteredBlocks]);
  const nationalTotal = useMemo(() => getTotalProduction(), []);

  const producingBlocks = useMemo(() =>
    filteredBlocks
      .map(b => ({
        ...b,
        pct: (b.dailyProduction / totalProduction) * 100,
      }))
      .sort((a, b) => sortAsc
        ? (a[sortKey] > b[sortKey] ? 1 : -1)
        : (a[sortKey] < b[sortKey] ? 1 : -1)
      ),
    [filteredBlocks, totalProduction, sortKey, sortAsc]
  );

  const pieData = useMemo(() =>
    producingBlocks
      .filter(b => b.pct >= 0.5)
      .map(b => ({ name: b.name, value: b.dailyProduction, pct: b.pct }))
      .concat([{
        name: "Outros",
        value: producingBlocks.filter(b => b.pct < 0.5).reduce((s, b) => s + b.dailyProduction, 0),
        pct: producingBlocks.filter(b => b.pct < 0.5).reduce((s, b) => s + b.pct, 0),
      }])
      .filter(d => d.value > 0),
    [producingBlocks]
  );

  const isFiltered = filterOperator !== "all" || filterBasin !== "all";
  const prevYearTotal = 1080000;
  const yoyChange = ((nationalTotal - prevYearTotal) / prevYearTotal) * 100;
  const target2026 = 1100000;
  const targetCompliance = (nationalTotal / target2026) * 100;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const renderPieLabel = ({ name, pct }: { name: string; pct: number }) =>
    pct >= 3 ? `${name.replace("Block ", "B")} ${pct.toFixed(1)}%` : "";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterOperator} onValueChange={setFilterOperator}>
          <SelectTrigger className="w-40 md:w-48 h-8 text-xs glass-card border-border/50">
            <SelectValue placeholder="Operador" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos Operadores</SelectItem>
            {operators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterBasin} onValueChange={setFilterBasin}>
          <SelectTrigger className="w-40 md:w-48 h-8 text-xs glass-card border-border/50">
            <SelectValue placeholder="Bacia" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas Bacias</SelectItem>
            {basins.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        {isFiltered && (
          <button
            onClick={() => { setFilterOperator("all"); setFilterBasin("all"); }}
            className="text-[10px] text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
        {isFiltered && (
          <span className="text-[10px] text-muted-foreground ml-auto">
            {filteredBlocks.length} blocos · {totalProduction.toLocaleString()} BOPD ({((totalProduction / nationalTotal) * 100).toFixed(1)}% do total)
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="accent-border-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Produção Total</span>
          </div>
          <AnimatedCounter target={totalProduction} suffix=" BOPD" className="text-xl font-bold tabular-nums text-primary" />
        </div>
        <div className="accent-border-card">
          <div className="flex items-center gap-1.5 mb-1">
            {yoyChange >= 0
              ? <ArrowUpRight className="w-4 h-4 text-success" />
              : <ArrowDownRight className="w-4 h-4 text-danger" />
            }
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Variação YoY</span>
          </div>
          <span className={`text-xl font-bold tabular-nums ${yoyChange >= 0 ? "text-success" : "text-danger"}`}>
            {yoyChange >= 0 ? "+" : ""}{yoyChange.toFixed(1)}%
          </span>
        </div>
        <div className="accent-border-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-4 h-4 text-warning" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Meta 2026</span>
          </div>
          <AnimatedCounter target={target2026} suffix=" BOPD" className="text-xl font-bold tabular-nums text-warning" />
        </div>
        <div className="accent-border-card">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cumprimento</span>
          </div>
          <span className="text-xl font-bold tabular-nums text-success">
            {targetCompliance.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Distribution */}
        <ChartWrapper title="Distribuição da Produção por Blocos · 2025">
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                innerRadius={50}
                paddingAngle={1}
                label={renderPieLabel}
                labelLine={{ strokeWidth: 1 }}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${(value / 1000).toFixed(1)}k BOPD (${((value / totalProduction) * 100).toFixed(1)}%)`, ""]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Stacked Bar Historical */}
        <ChartWrapper title="Histórico de Produção por Blocos (kBOPD · 2018–2025)">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={historicalByBlock}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" tickFormatter={v => `${v}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => [`${value}k BOPD`, name]}
              />
              {stackKeys.map((key, i) => (
                <Bar key={key} dataKey={key} stackId="a" fill={stackColors[i]} radius={i === stackKeys.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]} />
              ))}
              <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Forecast */}
      <ChartWrapper title="Previsão de Produção a Médio-Longo Prazo (kBOPD · 2020–2050)">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={nationalForecast}>
            <defs>
              <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="noFidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" tickFormatter={v => `${v}k`} domain={[0, 1800]} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => [`${value}k BOPD`, name]}
            />
            <ReferenceLine y={1000} stroke="hsl(var(--danger))" strokeDasharray="6 3" label={{ value: "1M BOPD", fill: "hsl(var(--danger))", fontSize: 10, position: "insideTopRight" }} />
            <Area type="monotone" dataKey="base" stackId="1" stroke="hsl(var(--primary))" fill="url(#baseGrad)" strokeWidth={2} name="Produção de Base" />
            <Area type="monotone" dataKey="withFID" stackId="1" stroke="hsl(var(--success))" fill="url(#fidGrad)" strokeWidth={1.5} name="Oportunidades c/ FID" />
            <Area type="monotone" dataKey="withoutFID" stackId="1" stroke="hsl(var(--warning))" fill="url(#noFidGrad)" strokeWidth={1.5} name="Oportunidades s/ FID" />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 px-4 text-[10px] text-muted-foreground space-y-0.5">
          <p>• Pico previsto: ~1.6 MMbopd em 2037 (cenário com oportunidades)</p>
          <p>• Médias: 2025-2030: ~1.0 MMbopd | 2031-2040: ~1.4 MMbopd | 2041-2050: ~0.8 MMbopd</p>
          <p>• Pressupostos: Preços Brent $75-85/bbl, investimento contínuo em exploração e desenvolvimento</p>
        </div>
      </ChartWrapper>

      {/* Field-level breakdown */}
      <FieldProductionBreakdown />

      {/* Production Table */}
      <ChartWrapper title="Produção por Bloco — Dados Actuais">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("name")}>
                  Bloco {sortKey === "name" ? (sortAsc ? "↑" : "↓") : ""}
                </TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("operator")}>
                  Operador {sortKey === "operator" ? (sortAsc ? "↑" : "↓") : ""}
                </TableHead>
                <TableHead className="cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("dailyProduction")}>
                  Produção (BOPD) {sortKey === "dailyProduction" ? (sortAsc ? "↑" : "↓") : ""}
                </TableHead>
                <TableHead className="cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("pct")}>
                  % Total {sortKey === "pct" ? (sortAsc ? "↑" : "↓") : ""}
                </TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("basin")}>
                  Bacia {sortKey === "basin" ? (sortAsc ? "↑" : "↓") : ""}
                </TableHead>
                <TableHead>Fase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {producingBlocks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-sm">{b.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.operator}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{b.dailyProduction.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{b.pct.toFixed(2)}%</TableCell>
                  <TableCell className="text-xs">{b.basin}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{b.phase}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2 border-primary/30">
                <TableCell>TOTAL</TableCell>
                <TableCell />
                <TableCell className="text-right font-mono">{totalProduction.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">100%</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </ChartWrapper>
    </div>
  );
};
