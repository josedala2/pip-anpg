import { useMemo, useState } from "react";
import { oilBlocks, getTotalProduction } from "@/data/angolaBlocks";
import { AnimatedCounter } from "./AnimatedCounter";
import { ChartWrapper } from "./ChartWrapper";
import { Activity, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Filter, AlertTriangle } from "lucide-react";
import { SortableHead } from "@/components/ui/sortable-head";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FieldProductionBreakdown } from "./FieldProductionBreakdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PendingDataBadge } from "@/components/ui/PendingDataBadge";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))",
  "hsl(var(--danger))", "hsl(210, 70%, 55%)", "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)", "hsl(160, 60%, 45%)", "hsl(340, 65%, 50%)",
  "hsl(200, 55%, 50%)", "hsl(120, 50%, 45%)", "hsl(50, 70%, 50%)",
  "hsl(0, 60%, 50%)", "hsl(240, 50%, 60%)", "hsl(90, 55%, 45%)",
];

type SortKey = "name" | "dailyProduction" | "pct" | "operator" | "basin";

const operators = [...new Set(oilBlocks.filter(b => b.dailyProduction > 0).map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.filter(b => b.dailyProduction > 0).map(b => b.basin))].sort();
const producingBlockNames = oilBlocks.filter(b => b.dailyProduction > 0).sort((a, b) => a.name.localeCompare(b.name));

/** Build monthly stacked bar data from real productionHistory */
function buildHistoricalFromReal() {
  const blocksWithHistory = oilBlocks.filter(
    b => b.dailyProduction > 0 && b.productionHistory && b.productionHistory.length > 0
  );

  if (blocksWithHistory.length === 0) return { data: [], keys: [] };

  const allMonths = new Set<string>();
  blocksWithHistory.forEach(b => b.productionHistory.forEach(e => allMonths.add(e.month)));
  const sortedMonths = Array.from(allMonths).sort();

  const keys = blocksWithHistory.map(b => b.name);

  const data = sortedMonths.map(month => {
    const row: Record<string, string | number> = { month };
    blocksWithHistory.forEach(b => {
      const entry = b.productionHistory.find(e => e.month === month);
      row[b.name] = entry ? Math.round(entry.value / 1000) : 0;
    });
    return row;
  });

  return { data, keys };
}

export const ProductionPanel = () => {
  const [sortKey, setSortKey] = useState<SortKey>("dailyProduction");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterBasin, setFilterBasin] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");

  const filteredBlocks = useMemo(() =>
    oilBlocks.filter(b => {
      if (b.dailyProduction <= 0) return false;
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      if (filterBlock !== "all" && b.id !== filterBlock) return false;
      return true;
    }),
    [filterOperator, filterBasin, filterBlock]
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

  const historical = useMemo(() => buildHistoricalFromReal(), []);
  const blocksWithHistory = useMemo(() => oilBlocks.filter(
    b => b.dailyProduction > 0 && b.productionHistory && b.productionHistory.length > 0
  ), []);

  const isFiltered = filterOperator !== "all" || filterBasin !== "all" || filterBlock !== "all";

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="space-y-6">
      {/* Data coverage notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{blocksWithHistory.length} de {producingBlocks.length} blocos produtores</span> possuem dados de histórico de produção verificados.
          Os volumes nacionais são parciais até à integração completa dos dados.
        </p>
      </div>

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
        <Select value={filterBlock} onValueChange={setFilterBlock}>
          <SelectTrigger className="w-40 md:w-48 h-8 text-xs glass-card border-border/50">
            <SelectValue placeholder="Bloco" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos Blocos</SelectItem>
            {producingBlockNames.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {isFiltered && (
          <button
            onClick={() => { setFilterOperator("all"); setFilterBasin("all"); setFilterBlock("all"); }}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="accent-border-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Produção Total</span>
          </div>
          <AnimatedCounter target={totalProduction} suffix=" BOPD" className="text-xl font-bold tabular-nums text-primary" />
        </div>
        <div className="accent-border-card">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Blocos Produtores</span>
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {filteredBlocks.length}
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
                cy="45%"
                outerRadius="50%"
                innerRadius="20%"
                paddingAngle={1}
                label={false}
                labelLine={false}
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
                formatter={(value, entry: any) => { const p = entry?.payload?.percent; return p != null ? `${value} (${(p * 100).toFixed(1)}%)` : value; }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Historical from real data */}
        <ChartWrapper title={`Produção Mensal por Bloco (kBOPD) · ${blocksWithHistory.length} blocos com dados`}>
          {historical.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={historical.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" tickFormatter={v => `${v}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                  formatter={(value: number, name: string) => [`${value}k BOPD`, name]}
                />
                {historical.keys.map((key, i) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === historical.keys.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]} />
                ))}
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[380px] text-muted-foreground">
              <div className="text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-warning mx-auto" />
                <p className="text-xs">Dados de histórico de produção pendentes</p>
              </div>
            </div>
          )}
        </ChartWrapper>
      </div>


      {/* Field-level breakdown */}
      <FieldProductionBreakdown filterOperator={filterOperator} filterBasin={filterBasin} filterBlock={filterBlock} />

      {/* Production Table */}
      <ChartWrapper title="Produção por Bloco — Dados Actuais" height="auto">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <SortableHead label="Bloco" colKey="name" sortKey={sortKey} sortDir={sortAsc ? "asc" : "desc"} onSort={handleSort} />
                <SortableHead label="Operador" colKey="operator" sortKey={sortKey} sortDir={sortAsc ? "asc" : "desc"} onSort={handleSort} />
                <SortableHead label="Produção (BOPD)" colKey="dailyProduction" sortKey={sortKey} sortDir={sortAsc ? "asc" : "desc"} onSort={handleSort} align="text-right" />
                <SortableHead label="% Total" colKey="pct" sortKey={sortKey} sortDir={sortAsc ? "asc" : "desc"} onSort={handleSort} align="text-right" />
                <SortableHead label="Bacia" colKey="basin" sortKey={sortKey} sortDir={sortAsc ? "asc" : "desc"} onSort={handleSort} />
                <TableHead>Fase</TableHead>
                <TableHead>Dados</TableHead>
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
                  <TableCell>
                    {b.productionHistory && b.productionHistory.length > 0
                      ? <Badge variant="outline" className="text-[10px] border-success/50 text-success">Verificado</Badge>
                      : <PendingDataBadge compact />
                    }
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
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </ChartWrapper>
    </div>
  );
};
