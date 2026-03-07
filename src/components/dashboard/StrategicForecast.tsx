import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { oilBlocks } from "@/data/angolaBlocks";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import { DollarSign, BarChart3, TrendingUp } from "lucide-react";

type Scenario = "conservative" | "base" | "expansion";

const scenarios: { id: Scenario; label: string; color: string }[] = [
  { id: "conservative", label: "Conservative", color: "hsl(var(--danger))" },
  { id: "base", label: "Base", color: "hsl(var(--primary))" },
  { id: "expansion", label: "Expansion", color: "hsl(var(--success))" },
];

const BLOCK_COLORS = oilBlocks.map((_, i) => `hsl(${i * 25}, 70%, 55%)`);

export const StrategicForecast = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>("base");
  const [oilPrice, setOilPrice] = useState<number[]>([75]);
  const navigate = useNavigate();

  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);

  // Aggregate projections
  const projectionData = useMemo(() =>
    years.map((year, i) => {
      const row: Record<string, number | string> = { year: year.toString() };
      for (const s of scenarios) {
        row[s.id] = oilBlocks.reduce((sum, b) => sum + (b.projections[s.id][i] || 0), 0);
      }
      return row;
    }), []
  );

  // Stacked area data per block
  const activeBlocks = useMemo(() =>
    oilBlocks.filter(b => b.projections[activeScenario].some(v => v > 0)),
    [activeScenario]
  );

  const stackedData = useMemo(() =>
    years.map((year, i) => {
      const row: Record<string, number | string> = { year: year.toString() };
      for (const b of activeBlocks) {
        row[b.id] = b.projections[activeScenario][i] || 0;
      }
      return row;
    }), [activeScenario, activeBlocks]
  );

  // Block breakdown table data
  const blockBreakdown = useMemo(() => {
    const price = oilPrice[0];
    return activeBlocks
      .map(b => {
        const current = b.dailyProduction;
        const projected = b.projections[activeScenario][4] || 0; // 2029
        const change = current > 0 ? ((projected - current) / current) * 100 : 0;
        const revenue = (projected * 365 * price) / 1e6; // MMUSD
        return { id: b.id, name: b.name, current, projected, change, revenue };
      })
      .sort((a, b) => b.projected - a.projected);
  }, [activeScenario, oilPrice, activeBlocks]);

  const totals = useMemo(() => ({
    current: blockBreakdown.reduce((s, b) => s + b.current, 0),
    projected: blockBreakdown.reduce((s, b) => s + b.projected, 0),
    revenue: blockBreakdown.reduce((s, b) => s + b.revenue, 0),
  }), [blockBreakdown]);

  const currentTotal = oilBlocks.reduce((s, b) => s + b.dailyProduction, 0);
  const projected2029 = (projectionData[4] as Record<string, number>)?.[activeScenario] || 0;
  const fiscalMultiplier = oilPrice[0];

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Scenario Selector + Price Slider */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex gap-2 3xl:gap-3">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`px-4 py-2 2xl:px-5 2xl:py-2.5 3xl:px-6 3xl:py-3 rounded-lg text-xs 2xl:text-sm 3xl:text-base font-semibold transition-all ${
                activeScenario === s.id
                  ? "glass-card border border-primary/50 text-foreground glow-primary"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs 2xl:text-sm text-muted-foreground whitespace-nowrap">Preço do Barril</span>
          <Slider
            value={oilPrice}
            onValueChange={setOilPrice}
            min={40}
            max={120}
            step={5}
            className="flex-1"
          />
          <span className="text-sm 2xl:text-base font-mono font-bold text-primary min-w-[4rem] text-right">
            ${oilPrice[0]}/bbl
          </span>
        </div>
      </div>

      {/* 10-Year Aggregate Line Chart */}
      <ChartWrapper title="10-Year Production Projection (BOPD)" icon={<TrendingUp className="w-4 h-4 text-primary" />}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [value.toLocaleString() + " BOPD"]}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {scenarios.map(s => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={s.color}
                strokeWidth={activeScenario === s.id ? 3 : 1}
                opacity={activeScenario === s.id ? 1 : 0.3}
                dot={activeScenario === s.id}
                name={s.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Stacked Area Chart — Block Contribution */}
      <ChartWrapper title={`Contribuição por Bloco — ${scenarios.find(s => s.id === activeScenario)?.label}`} icon={<BarChart3 className="w-4 h-4 text-primary" />}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stackedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => {
                const block = oilBlocks.find(b => b.id === name);
                return [value.toLocaleString() + " BOPD", block?.name || name];
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              formatter={(value: string) => {
                const block = oilBlocks.find(b => b.id === value);
                return block?.name || value;
              }}
            />
            {activeBlocks.map((b, i) => (
              <Area
                key={b.id}
                type="monotone"
                dataKey={b.id}
                stackId="1"
                fill={BLOCK_COLORS[oilBlocks.indexOf(b)]}
                stroke={BLOCK_COLORS[oilBlocks.indexOf(b)]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 2xl:gap-6 3xl:gap-8">
        <Card className="glass-card">
          <CardContent className="p-4 2xl:p-6 3xl:p-8 text-center">
            <div className="text-xs 2xl:text-sm 3xl:text-base text-muted-foreground mb-1">Current Output</div>
            <div className="text-2xl 2xl:text-4xl 3xl:text-5xl font-bold font-mono text-foreground">{(currentTotal / 1000).toFixed(0)}k</div>
            <div className="text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">BOPD</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 2xl:p-6 3xl:p-8 text-center">
            <div className="text-xs 2xl:text-sm 3xl:text-base text-muted-foreground mb-1">2029 Projection ({activeScenario})</div>
            <div className="text-2xl 2xl:text-4xl 3xl:text-5xl font-bold font-mono text-primary">
              {(projected2029 / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">BOPD</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 2xl:p-6 3xl:p-8 text-center">
            <div className="text-xs 2xl:text-sm 3xl:text-base text-muted-foreground mb-1">Est. Annual Revenue (2029)</div>
            <div className="text-2xl 2xl:text-4xl 3xl:text-5xl font-bold font-mono text-success">
              ${((projected2029 * 365 * fiscalMultiplier) / 1e9).toFixed(1)}B
            </div>
            <div className="text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">at ${fiscalMultiplier}/bbl</div>
          </CardContent>
        </Card>
      </div>

      {/* Block Breakdown Table */}
      <Card className="glass-card">
        <CardHeader className="p-4 3xl:p-6 pb-2">
          <CardTitle className="text-sm 2xl:text-lg 3xl:text-xl">Breakdown por Bloco — 2029 ({scenarios.find(s => s.id === activeScenario)?.label})</CardTitle>
        </CardHeader>
        <CardContent className="p-4 3xl:p-6 pt-0">
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Bloco</TableHead>
                  <TableHead className="text-xs text-right">Produção Actual (BOPD)</TableHead>
                  <TableHead className="text-xs text-right">Projecção 2029 (BOPD)</TableHead>
                  <TableHead className="text-xs text-right">Variação %</TableHead>
                  <TableHead className="text-xs text-right">Receita Est. (MMUSD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockBreakdown.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => navigate(`/block/${row.id}`)}
                  >
                    <TableCell className="text-xs font-medium flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: BLOCK_COLORS[oilBlocks.findIndex(b => b.id === row.id)] }}
                      />
                      {row.name}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{row.current.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{row.projected.toLocaleString()}</TableCell>
                    <TableCell className={`text-xs text-right font-mono ${row.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">${row.revenue.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="text-xs font-bold">Total</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">{totals.current.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">{totals.projected.toLocaleString()}</TableCell>
                  <TableCell className={`text-xs text-right font-mono font-bold ${totals.current > 0 && ((totals.projected - totals.current) / totals.current) >= 0 ? "text-success" : "text-destructive"}`}>
                    {totals.current > 0 ? `${((totals.projected - totals.current) / totals.current * 100) >= 0 ? "+" : ""}${((totals.projected - totals.current) / totals.current * 100).toFixed(1)}%` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold">${totals.revenue.toFixed(0)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
