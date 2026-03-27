import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableHead } from "@/components/ui/sortable-head";
import { useTableSort } from "@/hooks/useTableSort";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend, ResponsiveContainer } from "recharts";
import { oilBlocks } from "@/data/angolaBlocks";
import { ShieldCheck, Flame, Wind, Droplets, AlertTriangle, Activity, Award } from "lucide-react";
import { useMemo } from "react";

const verifiedBlocks = oilBlocks.filter(b => !b.pendingRealData && b.hseData?.length);

// Aggregate last-year KPIs
function getLastYearAggregates() {
  let totalFat = 0, totalLti = 0, totalSpills = 0;
  let totalCO2 = 0, totalFlaring = 0;
  let trirNum = 0, trirDen = 0;

  for (const block of verifiedBlocks) {
    const lastHse = block.hseData?.[block.hseData.length - 1];
    const lastEnv = block.environmentalData?.[block.environmentalData.length - 1];
    if (lastHse) {
      totalFat += lastHse.fat;
      totalLti += lastHse.lti;
      // TRIR weighted by HHR: sum(recordable incidents) / sum(HHR) * 200000
      const recordable = lastHse.lti + lastHse.rwc + lastHse.mtc + lastHse.fac;
      trirNum += recordable;
      trirDen += lastHse.hhr * 1_000_000;
    }
    if (lastEnv) {
      totalCO2 += lastEnv.co2EmissionsTonCO2eq ?? 0;
      totalFlaring += lastEnv.gasFlaredMMSCFD ?? 0;
      totalSpills += lastEnv.oilSpillCount ?? 0;
    }
  }

  const trirNational = trirDen > 0 ? (trirNum * 200_000) / trirDen : 0;
  return { totalFat, totalLti, trirNational, totalCO2, totalFlaring, totalSpills };
}

// TRIR trend data per block per year
function getTRIRTrend() {
  const yearMap = new Map<number, Record<string, number>>();
  for (const block of verifiedBlocks) {
    for (const h of block.hseData ?? []) {
      if (!yearMap.has(h.year)) yearMap.set(h.year, { year: h.year } as any);
      yearMap.get(h.year)![block.name] = h.trir;
    }
  }
  return Array.from(yearMap.values()).sort((a, b) => (a as any).year - (b as any).year);
}

// Emissions trend
function getEmissionsTrend() {
  const yearMap = new Map<number, Record<string, number>>();
  for (const block of verifiedBlocks) {
    for (const e of block.environmentalData ?? []) {
      if (!yearMap.has(e.year)) yearMap.set(e.year, { year: e.year } as any);
      yearMap.get(e.year)![`flare_${block.name}`] = e.gasFlaredMMSCFD ?? 0;
      yearMap.get(e.year)![`co2_${block.name}`] = (e.co2EmissionsTonCO2eq ?? 0) / 1000; // kton
    }
  }
  return Array.from(yearMap.values()).sort((a, b) => (a as any).year - (b as any).year);
}

// Ranking table
function getRanking() {
  return verifiedBlocks.map(block => {
    const lastHse = block.hseData?.[block.hseData.length - 1];
    const lastEnv = block.environmentalData?.[block.environmentalData.length - 1];
    const trir = lastHse?.trir ?? 0;
    const lti = lastHse?.lti ?? 0;
    const spills = lastEnv?.oilSpillCount ?? 0;
    const flaring = lastEnv?.gasFlaredMMSCFD ?? 0;
    const co2 = (lastEnv?.co2EmissionsTonCO2eq ?? 0) / 1000;
    const oiw = lastEnv?.oilInWaterPPM ?? 0;
    // Lower is better — invert for score (100 = best)
    const maxTRIR = 3, maxFlare = 30, maxSpills = 80, maxOIW = 15;
    const sT = Math.max(0, 100 * (1 - trir / maxTRIR));
    const sF = Math.max(0, 100 * (1 - flaring / maxFlare));
    const sS = Math.max(0, 100 * (1 - spills / maxSpills));
    const sO = Math.max(0, 100 * (1 - oiw / maxOIW));
    const score = Math.round(sT * 0.4 + sF * 0.3 + sS * 0.2 + sO * 0.1);
    return { name: block.name, trir, lti, spills, flaring, co2, oiw, score };
  });
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export const HSENationalPanel = () => {
  const kpis = useMemo(getLastYearAggregates, []);
  const trirTrend = useMemo(getTRIRTrend, []);
  const emTrend = useMemo(getEmissionsTrend, []);
  const ranking = useMemo(getRanking, []);
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(ranking, "score", "desc", ["name"]);

  const kpiCards = [
    { label: "Fatalidades", value: kpis.totalFat, icon: ShieldCheck, zero: true },
    { label: "LTI (último ano)", value: kpis.totalLti, icon: AlertTriangle },
    { label: "TRIR Nacional", value: kpis.trirNational.toFixed(2), icon: Activity },
    { label: "CO₂ Total (ton)", value: (kpis.totalCO2 / 1000).toFixed(0) + "k", icon: Wind },
    { label: "Flaring (MMSCFD)", value: kpis.totalFlaring.toFixed(1), icon: Flame },
    { label: "Derrames", value: kpis.totalSpills, icon: Droplets },
  ];

  const blockNames = verifiedBlocks.map(b => b.name);

  const trirConfig = Object.fromEntries(blockNames.map((n, i) => [n, { label: n, color: COLORS[i] }]));
  const emConfig = Object.fromEntries(
    blockNames.flatMap((n, i) => [
      [`flare_${n}`, { label: `Flaring ${n}`, color: COLORS[i] }],
      [`co2_${n}`, { label: `CO₂ ${n}`, color: COLORS[i] + "80" }],
    ])
  );

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          HSE & Ambiente — Visão Nacional Consolidada
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Dados agregados dos 3 blocos verificados (0, 2/05, 3/05)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {kpiCards.map(k => (
            <div key={k.label} className="rounded-lg border border-border/40 bg-muted/30 p-3 text-center">
              <k.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold tabular-nums">
                {k.zero && k.value === 0 ? (
                  <span className="text-emerald-500">Zero</span>
                ) : (
                  k.value
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* TRIR Trend */}
          <div className="rounded-lg border border-border/40 p-3">
            <h4 className="text-xs font-semibold mb-2">TRIR por Bloco (tendência)</h4>
            <ChartContainer config={trirConfig} className="h-[220px] w-full">
              <LineChart data={trirTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {blockNames.map((n, i) => (
                  <Line key={n} type="monotone" dataKey={n} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ChartContainer>
          </div>

          {/* Flaring Trend */}
          <div className="rounded-lg border border-border/40 p-3">
            <h4 className="text-xs font-semibold mb-2">Flaring por Bloco (MMSCFD)</h4>
            <ChartContainer config={emConfig} className="h-[220px] w-full">
              <BarChart data={emTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {blockNames.map((n, i) => (
                  <Bar key={n} dataKey={`flare_${n}`} fill={COLORS[i]} stackId="flare" />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="rounded-lg border border-border/40">
          <h4 className="text-xs font-semibold px-3 pt-3 pb-1">Ranking HSE por Bloco</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Bloco" sortKey={sortKey} colKey="name" sortDir={sortDir} onSort={handleSort} />
                <SortableHead label="TRIR" sortKey={sortKey} colKey="trir" sortDir={sortDir} onSort={handleSort} className="text-right" align="text-right" />
                <SortableHead label="LTI" sortKey={sortKey} colKey="lti" sortDir={sortDir} onSort={handleSort} className="text-right" align="text-right" />
                <SortableHead label="Derrames" sortKey={sortKey} colKey="spills" sortDir={sortDir} onSort={handleSort} className="text-right" align="text-right" />
                <SortableHead label="Flaring" sortKey={sortKey} colKey="flaring" sortDir={sortDir} onSort={handleSort} className="text-right" align="text-right" />
                <SortableHead label="CO₂ (kton)" sortKey={sortKey} colKey="co2" sortDir={sortDir} onSort={handleSort} className="text-right" align="text-right" />
                <SortableHead label="Score HSE" sortKey={sortKey} colKey="score" sortDir={sortDir} onSort={handleSort} className="text-right" align="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row, idx) => {
                const bestScore = sorted[0]?.score === row.score && sortKey === "score" && sortDir === "desc";
                return (
                  <TableRow key={row.name}>
                    <TableCell className="py-2 text-xs font-semibold">
                      {bestScore && <Award className="w-3.5 h-3.5 inline mr-1 text-amber-500" />}
                      {row.name}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{row.trir.toFixed(2)}</TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{row.lti}</TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{row.spills}</TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{row.flaring.toFixed(1)}</TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{row.co2.toFixed(0)}</TableCell>
                    <TableCell className="py-2 text-xs text-right font-bold tabular-nums">
                      <span className={row.score >= 80 ? "text-emerald-500" : row.score >= 50 ? "text-amber-500" : "text-destructive"}>
                        {row.score}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
