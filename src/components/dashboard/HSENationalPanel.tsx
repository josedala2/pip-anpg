import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableHead } from "@/components/ui/sortable-head";
import { useTableSort } from "@/hooks/useTableSort";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area, Legend, ResponsiveContainer } from "recharts";
import { oilBlocks } from "@/data/angolaBlocks";
import { ShieldCheck, Flame, Wind, Droplets, AlertTriangle, Activity, Award, Waves, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

const verifiedBlocks = oilBlocks.filter(b => !b.pendingRealData && b.hseData?.length);

// Aggregate KPIs for a specific offset from end (0 = last year, 1 = previous year)
function getAggregates(offset: number) {
  let totalFat = 0, totalLti = 0, totalSpills = 0;
  let totalCO2 = 0, totalFlaring = 0;
  let oiwSum = 0, oiwCount = 0;
  let trirNum = 0, trirDen = 0;

  for (const block of verifiedBlocks) {
    const idx = (block.hseData?.length ?? 0) - 1 - offset;
    const hse = idx >= 0 ? block.hseData?.[idx] : undefined;
    const envIdx = (block.environmentalData?.length ?? 0) - 1 - offset;
    const env = envIdx >= 0 ? block.environmentalData?.[envIdx] : undefined;
    if (hse) {
      totalFat += hse.fat;
      totalLti += hse.lti;
      const recordable = hse.lti + hse.rwc + hse.mtc + hse.fac;
      trirNum += recordable;
      trirDen += hse.hhr * 1_000_000;
    }
    if (env) {
      totalCO2 += env.co2EmissionsTonCO2eq ?? 0;
      totalFlaring += env.gasFlaredMMSCFD ?? 0;
      totalSpills += env.oilSpillCount ?? 0;
      if (env.oilInWaterPPM != null) { oiwSum += env.oilInWaterPPM; oiwCount++; }
    }
  }

  const trirNational = trirDen > 0 ? (trirNum * 200_000) / trirDen : 0;
  return { totalFat, totalLti, trirNational, totalCO2, totalFlaring, totalSpills, avgOIW: oiwCount > 0 ? oiwSum / oiwCount : 0 };
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

// CO₂ national trend (aggregated)
function getCO2NationalTrend() {
  const yearMap = new Map<number, number>();
  for (const block of verifiedBlocks) {
    for (const e of block.environmentalData ?? []) {
      yearMap.set(e.year, (yearMap.get(e.year) ?? 0) + (e.co2EmissionsTonCO2eq ?? 0));
    }
  }
  return Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, val]) => ({ year, co2Kton: val / 1000 }));
}

// Safety pyramid (last year aggregated)
function getSafetyPyramid() {
  let fat = 0, lti = 0, rwc = 0, mtc = 0, fac = 0, nmi = 0;
  for (const block of verifiedBlocks) {
    const last = block.hseData?.[block.hseData.length - 1];
    if (last) { fat += last.fat; lti += last.lti; rwc += last.rwc; mtc += last.mtc; fac += last.fac; nmi += last.nmi; }
  }
  return [
    { label: "FAT", value: fat, color: "hsl(var(--danger))" },
    { label: "LTI", value: lti, color: "hsl(38, 92%, 50%)" },
    { label: "RWC", value: rwc, color: "hsl(var(--warning))" },
    { label: "MTC", value: mtc, color: "hsl(var(--chart-2))" },
    { label: "FAC", value: fac, color: "hsl(var(--chart-3))" },
    { label: "NMI", value: nmi, color: "hsl(var(--muted-foreground))" },
  ];
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
    const maxTRIR = 3, maxFlare = 30, maxSpills = 80, maxOIW = 15;
    const sT = Math.max(0, 100 * (1 - trir / maxTRIR));
    const sF = Math.max(0, 100 * (1 - flaring / maxFlare));
    const sS = Math.max(0, 100 * (1 - spills / maxSpills));
    const sO = Math.max(0, 100 * (1 - oiw / maxOIW));
    const score = Math.round(sT * 0.4 + sF * 0.3 + sS * 0.2 + sO * 0.1);
    return { name: block.name, trir, lti, spills, flaring, co2, oiw, score };
  });
}

function calcDelta(current: number, previous: number): { pct: number; direction: "up" | "down" | "flat" } {
  if (previous === 0 && current === 0) return { pct: 0, direction: "flat" };
  if (previous === 0) return { pct: 100, direction: "up" };
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(pct) < 0.5) return { pct: 0, direction: "flat" };
  return { pct, direction: pct > 0 ? "up" : "down" };
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export const HSENationalPanel = () => {
  const kpis = useMemo(() => getAggregates(0), []);
  const prevKpis = useMemo(() => getAggregates(1), []);
  const trirTrend = useMemo(getTRIRTrend, []);
  const emTrend = useMemo(getEmissionsTrend, []);
  const co2Trend = useMemo(getCO2NationalTrend, []);
  const pyramid = useMemo(getSafetyPyramid, []);
  const ranking = useMemo(getRanking, []);
  const { sorted, sortKey, sortDir, handleSort } = useTableSort(ranking, "score", "desc", ["name"]);

  // KPI cards with trend info
  // For safety metrics (FAT, LTI, TRIR), "down" is good (green). For environmental, "down" is also good.
  const kpiCards = [
    { label: "Fatalidades", value: kpis.totalFat, prev: prevKpis.totalFat, icon: ShieldCheck, zero: true, lowerIsBetter: true },
    { label: "LTI (último ano)", value: kpis.totalLti, prev: prevKpis.totalLti, icon: AlertTriangle, lowerIsBetter: true },
    { label: "TRIR Nacional", value: kpis.trirNational, prev: prevKpis.trirNational, icon: Activity, format: (v: number) => v.toFixed(2), lowerIsBetter: true },
    { label: "CO₂ Total (ton)", value: kpis.totalCO2, prev: prevKpis.totalCO2, icon: Wind, format: (v: number) => (v / 1000).toFixed(0) + "k", lowerIsBetter: true },
    { label: "Flaring (MMSCFD)", value: kpis.totalFlaring, prev: prevKpis.totalFlaring, icon: Flame, format: (v: number) => v.toFixed(1), lowerIsBetter: true },
    { label: "Derrames", value: kpis.totalSpills, prev: prevKpis.totalSpills, icon: Droplets, lowerIsBetter: true },
    { label: "Oil-in-Water (PPM)", value: kpis.avgOIW, prev: prevKpis.avgOIW, icon: Waves, format: (v: number) => v.toFixed(1), lowerIsBetter: true },
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
        <p className="text-[10px] text-muted-foreground">Dados agregados dos {verifiedBlocks.length} blocos verificados · Variação ano-a-ano (YoY)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Cards with Trends */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {kpiCards.map(k => {
            const delta = calcDelta(typeof k.value === "number" ? k.value : 0, typeof k.prev === "number" ? k.prev : 0);
            const isGood = k.lowerIsBetter ? delta.direction === "down" : delta.direction === "up";
            const isBad = k.lowerIsBetter ? delta.direction === "up" : delta.direction === "down";
            const displayVal = k.format ? k.format(k.value as number) : k.value;

            return (
              <div key={k.label} className="rounded-lg border border-border/40 bg-muted/30 p-3 text-center relative">
                <k.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold tabular-nums">
                  {k.zero && k.value === 0 ? (
                    <span className="text-emerald-500">Zero</span>
                  ) : (
                    displayVal
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">{k.label}</div>
                {/* Trend indicator */}
                {delta.direction !== "flat" ? (
                  <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-semibold ${
                    isGood ? "text-emerald-500" : isBad ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {delta.direction === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(delta.pct).toFixed(0)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-0.5 mt-1 text-[10px] text-muted-foreground">
                    <Minus className="w-3 h-3" />
                    <span>Estável</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Safety Pyramid + CO₂ Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Safety Pyramid */}
          <div className="rounded-lg border border-border/40 p-3">
            <h4 className="text-xs font-semibold mb-3">Pirâmide de Segurança (último ano)</h4>
            <div className="space-y-1.5">
              {pyramid.map((level, idx) => {
                const maxVal = Math.max(...pyramid.map(p => p.value), 1);
                const width = Math.max(15, (level.value / maxVal) * 100);
                return (
                  <div key={level.label} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold w-8 text-right text-muted-foreground">{level.label}</span>
                    <div className="flex-1 h-6 relative">
                      <div
                        className="h-full rounded-sm flex items-center px-2 transition-all"
                        style={{ width: `${width}%`, backgroundColor: level.color, opacity: 0.8 }}
                      >
                        <span className="text-[10px] font-bold text-white">{level.value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CO₂ National Trend */}
          <div className="rounded-lg border border-border/40 p-3">
            <h4 className="text-xs font-semibold mb-2">Emissões CO₂ — Tendência Nacional (kton)</h4>
            <ChartContainer config={{ co2Kton: { label: "CO₂ (kton)", color: "hsl(var(--muted-foreground))" } }} className="h-[180px] w-full">
              <AreaChart data={co2Trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="co2Kton" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </div>
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
              {sorted.map((row) => {
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
