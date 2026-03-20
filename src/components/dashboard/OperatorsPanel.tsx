import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { ConcessionMap } from "./ConcessionMap";
import { BlockDetail } from "./BlockDetail";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartWrapper } from "./ChartWrapper";
import { AnimatedCounter } from "./AnimatedCounter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line,
} from "recharts";
import {
  Search, ArrowLeft, Building2, Layers, BarChart3, Droplets, FileText, ShieldCheck, Factory, TrendingUp, MapPin,
  ChevronUp, ChevronDown, Minus,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";
import { SortableHead } from "@/components/ui/sortable-head";
import { useTableSort } from "@/hooks/useTableSort";

export interface OperatorSummary {
  name: string;
  blocks: OilBlock[];
  totalProduction: number;
  totalReserves: number;
  totalAccumulatedInvestment: number;
  totalPlannedInvestment: number;
  avgCompliance: number;
  avgRisk: number;
  blockCount: number;
  basins: string[];
  phases: string[];
  waterDepths: string[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210, 70%, 50%)",
  "hsl(30, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(340, 65%, 50%)",
  "hsl(260, 55%, 55%)",
  "hsl(180, 50%, 45%)",
  "hsl(60, 70%, 50%)",
];

type SortKey = "production" | "blocks" | "reserves" | "investment" | "compliance";

export function buildOperators(): OperatorSummary[] {
  const map = new Map<string, OilBlock[]>();
  for (const b of oilBlocks) {
    const existing = map.get(b.operator) || [];
    existing.push(b);
    map.set(b.operator, existing);
  }
  return Array.from(map.entries()).map(([name, blocks]) => ({
    name,
    blocks,
    totalProduction: blocks.reduce((s, b) => s + b.dailyProduction, 0),
    totalReserves: blocks.reduce((s, b) => s + b.estimatedReserves, 0),
    totalAccumulatedInvestment: blocks.reduce((s, b) => s + b.accumulatedInvestment, 0),
    totalPlannedInvestment: blocks.reduce((s, b) => s + b.plannedInvestment, 0),
    avgCompliance: blocks.reduce((s, b) => s + b.complianceScore, 0) / blocks.length,
    avgRisk: blocks.reduce((s, b) => s + b.riskScore, 0) / blocks.length,
    blockCount: blocks.length,
    basins: [...new Set(blocks.map(b => b.basin))],
    phases: [...new Set(blocks.map(b => b.phase))],
    waterDepths: [...new Set(blocks.map(b => b.waterDepth))],
  }));
}

// ── List View ──────────────────────────────────────────────
function OperatorListView({ operators }: { operators: OperatorSummary[] }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("production");

  const totalProd = useMemo(() => operators.reduce((s, o) => s + o.totalProduction, 0), [operators]);

  const filtered = useMemo(() => {
    let list = operators;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q));
    }
    const sorters: Record<SortKey, (a: OperatorSummary, b: OperatorSummary) => number> = {
      production: (a, b) => b.totalProduction - a.totalProduction,
      blocks: (a, b) => b.blockCount - a.blockCount,
      reserves: (a, b) => b.totalReserves - a.totalReserves,
      investment: (a, b) => b.totalAccumulatedInvestment - a.totalAccumulatedInvestment,
      compliance: (a, b) => b.avgCompliance - a.avgCompliance,
    };
    return [...list].sort(sorters[sortBy]);
  }, [operators, search, sortBy]);

  const [chartMetric, setChartMetric] = useState<"totalProduction" | "totalReserves" | "totalAccumulatedInvestment">("totalProduction");

  const chartMetricConfig: Record<typeof chartMetric, { label: string; suffix: string; formatter: (v: number) => string }> = {
    totalProduction: { label: "Produção", suffix: "BOPD", formatter: (v) => `${v.toLocaleString()} BOPD` },
    totalReserves: { label: "Reservas", suffix: "MMbbl", formatter: (v) => `${v.toLocaleString()} MMbbl` },
    totalAccumulatedInvestment: { label: "Investimento", suffix: "M USD", formatter: (v) => `${v.toLocaleString()} M USD` },
  };

  const currentMetric = chartMetricConfig[chartMetric];
  const chartTotal = useMemo(() => filtered.reduce((s, o) => s + o[chartMetric], 0), [filtered, chartMetric]);

  const pieData = useMemo(() =>
    [...operators]
      .sort((a, b) => b.totalProduction - a.totalProduction)
      .map(o => ({ name: o.name, value: o.totalProduction })),
    [operators]
  );

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">Operadores <InfoTooltip text={tooltipDescriptions["Operadores"]} /></p>
            <p className="text-2xl font-bold text-primary"><AnimatedCounter target={operators.length} /></p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">Produção Total <InfoTooltip text={tooltipDescriptions["Produção Total"]} /></p>
            <p className="text-2xl font-bold text-primary"><AnimatedCounter target={totalProd} suffix=" BOPD" /></p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">Reservas Totais <InfoTooltip text={tooltipDescriptions["Reservas Totais"]} /></p>
            <p className="text-2xl font-bold text-primary">
              <AnimatedCounter target={operators.reduce((s, o) => s + o.totalReserves, 0)} suffix=" MMbbl" />
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Investimento Acumulado</p>
            <p className="text-2xl font-bold text-primary">
              <AnimatedCounter target={operators.reduce((s, o) => s + o.totalAccumulatedInvestment, 0)} prefix="$" suffix="MM" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Quota de Produção */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          title={`Ranking por ${currentMetric.label}`}
          icon={<BarChart3 className="w-4 h-4" />}
          height={Math.max(350, filtered.length * 38 + 60)}
          headerExtra={
            <Select value={chartMetric} onValueChange={(v) => setChartMetric(v as typeof chartMetric)}>
              <SelectTrigger className="h-7 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalProduction">Produção</SelectItem>
                <SelectItem value="totalReserves">Reservas</SelectItem>
                <SelectItem value="totalAccumulatedInvestment">Investimento</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered} layout="vertical" margin={{ left: 110, right: 70, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={105} />
              <Tooltip formatter={(v: number) => currentMetric.formatter(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey={chartMetric} name={currentMetric.label} radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))", formatter: (v: number) => chartTotal > 0 ? `${((v / chartTotal) * 100).toFixed(1)}%` : "" }}>
                {filtered.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Produção por Operador (BOPD)" icon={<Droplets className="w-4 h-4" />} height={350}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered.slice(0, 12)} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={95} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} BOPD`} />
              <Bar dataKey="totalProduction" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar operador..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={v => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production">Produção</SelectItem>
            <SelectItem value="blocks">Nº Blocos</SelectItem>
            <SelectItem value="reserves">Reservas</SelectItem>
            <SelectItem value="investment">Investimento</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(op => (
          <Card
            key={op.name}
            className="glass-card cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
            onClick={() => navigate(`/operator/${encodeURIComponent(op.name)}`)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {op.name}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">{op.blockCount} bloco{op.blockCount !== 1 ? "s" : ""}</Badge>
              </div>
              <CardDescription className="text-xs">{op.basins.join(", ")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Produção</p>
                  <p className="font-semibold text-foreground">{op.totalProduction.toLocaleString()} BOPD</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reservas</p>
                  <p className="font-semibold text-foreground">{op.totalReserves.toLocaleString()} MMbbl</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Investimento</p>
                  <p className="font-semibold text-foreground">${op.totalAccumulatedInvestment.toLocaleString()}MM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Compliance</p>
                  <p className={`font-semibold ${op.avgCompliance >= 90 ? "text-green-500" : op.avgCompliance >= 75 ? "text-yellow-500" : "text-red-500"}`}>
                    {op.avgCompliance.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {op.phases.map(p => (
                  <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0">{p}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Detail View ────────────────────────────────────────────
export function OperatorDetailView({ operator, onBack }: { operator: OperatorSummary; onBack: () => void }) {
  const { blocks } = operator;
  const [selectedBlock, setSelectedBlock] = useState<OilBlock | null>(null);
  const [detailSearch, setDetailSearch] = useState("");
  // Table sort states
  const blocksTableData = useMemo(() => {
    const q = detailSearch.toLowerCase();
    return blocks
      .map(b => ({
        id: b.id, name: b.name, phase: b.phase, basin: b.basin, waterDepth: b.waterDepth || "",
        dailyProduction: b.dailyProduction, estimatedReserves: b.estimatedReserves,
        complianceScore: b.complianceScore, contractDate: b.contractDate || "",
        accumulatedInvestment: b.accumulatedInvestment, plannedInvestment: b.plannedInvestment,
        executionRate: b.executionRate, opexPerBarrel: b.economicData?.opexPerBarrel || 0,
      }))
      .filter(b => !q || b.name.toLowerCase().includes(q) || b.phase.toLowerCase().includes(q) || b.basin.toLowerCase().includes(q));
  }, [blocks, detailSearch]);
  const blocksSort = useTableSort(blocksTableData, "dailyProduction", "desc", ["name", "phase", "basin", "waterDepth", "contractDate"]);
  const econSort = useTableSort(blocksTableData, "accumulatedInvestment", "desc", ["name"]);
  const fieldsData = useMemo(() => {
    const q = detailSearch.toLowerCase();
    return blocks.flatMap(b => (b.fields || []).map(f => ({
      blockName: b.name, fieldName: f.name, status: f.status, discoveryYear: f.discoveryYear || 0,
      peakProduction: f.peakProduction || 0,
    }))).filter(f => !q || f.blockName.toLowerCase().includes(q) || f.fieldName.toLowerCase().includes(q) || f.status.toLowerCase().includes(q));
  }, [blocks, detailSearch]);
  const fieldsSort = useTableSort(fieldsData, "peakProduction", "desc", ["blockName", "fieldName", "status"]);
  // Facilities data for sorting
  const facilitiesData = useMemo(() => {
    const q = detailSearch.toLowerCase();
    const platforms: { name: string; type: string; block: string; status: string; capacity: string }[] = [];
    blocks.forEach(b => {
      b.facilityData?.platformSpecs?.forEach(p => {
        platforms.push({ name: p.name, type: p.type, block: b.name, status: p.status, capacity: p.capacity || "" });
      });
    });
    return platforms.filter(p => !q || p.name.toLowerCase().includes(q) || p.block.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
  }, [blocks, detailSearch]);
  const facilitiesSort = useTableSort(facilitiesData, "name", "asc", ["name", "type", "block", "status", "capacity"]);

  // Aggregate production history
  const aggregatedHistory = useMemo(() => {
    if (!blocks.length || !blocks[0].productionHistory?.length) return [];
    const months = blocks[0].productionHistory.map(h => h.month);
    return months.map((month, i) => ({
      month,
      value: blocks.reduce((s, b) => s + (b.productionHistory[i]?.value || 0), 0),
    }));
  }, [blocks]);

  // Aggregate HSE
  const aggregatedHSE = useMemo(() => {
    const allYears = new Set<number>();
    blocks.forEach(b => b.hseData?.forEach(h => allYears.add(h.year)));
    return [...allYears].sort().map(year => {
      const yearData = blocks.flatMap(b => (b.hseData || []).filter(h => h.year === year));
      return {
        year,
        fat: yearData.reduce((s, d) => s + d.fat, 0),
        lti: yearData.reduce((s, d) => s + d.lti, 0),
        rwc: yearData.reduce((s, d) => s + d.rwc, 0),
        trir: yearData.length ? yearData.reduce((s, d) => s + d.trir, 0) / yearData.length : 0,
        ltir: yearData.length ? yearData.reduce((s, d) => s + d.ltir, 0) / yearData.length : 0,
      };
    });
  }, [blocks]);

  // Aggregate exploration
  const explorationTotals = useMemo(() => {
    let wells2d = 0, wells3d = 0, pesquisa = 0, avaliacao = 0, discoveries = 0;
    blocks.forEach(b => {
      if (b.explorationSummary) {
        wells2d += b.explorationSummary.totalSeismic2DKm || 0;
        wells3d += b.explorationSummary.totalSeismic3DKm2 || 0;
        pesquisa += b.explorationSummary.totalWellsPesquisa || 0;
        avaliacao += b.explorationSummary.totalWellsAvaliacao || 0;
        discoveries += b.explorationSummary.commercialDiscoveries || 0;
      }
    });
    return { wells2d, wells3d, pesquisa, avaliacao, discoveries };
  }, [blocks]);

  // Facilities aggregate
  const facilities = useMemo(() => {
    const platforms: { name: string; type: string; block: string; status: string; capacity?: string }[] = [];
    let totalCapacity = 0;
    blocks.forEach(b => {
      b.facilityData?.platformSpecs?.forEach(p => {
        platforms.push({ name: p.name, type: p.type, block: b.name, status: p.status, capacity: p.capacity });
      });
      if (b.facilityData?.capacityBOPD) totalCapacity += b.facilityData.capacityBOPD;
    });
    return { platforms, totalCapacity };
  }, [blocks]);

  const prodByBlock = blocks.map(b => ({ name: b.name, production: b.dailyProduction })).sort((a, b) => b.production - a.production);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {operator.name}
          </h2>
          <p className="text-sm text-muted-foreground">{operator.blockCount} blocos • {operator.basins.join(", ")}</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Produção Total", value: `${operator.totalProduction.toLocaleString()} BOPD` },
          { label: "Reservas", value: `${operator.totalReserves.toLocaleString()} MMbbl` },
          { label: "Investimento Acum.", value: `$${operator.totalAccumulatedInvestment.toLocaleString()}MM` },
          { label: "Investimento Plan.", value: `$${operator.totalPlannedInvestment.toLocaleString()}MM` },
          { label: "Compliance Médio", value: `${operator.avgCompliance.toFixed(1)}%` },
        ].map(kpi => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              <p className="text-base font-bold text-primary">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operator Map */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Blocos Operados — {operator.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] relative">
            <ConcessionMap
              blocks={oilBlocks.filter(b => b.operator === operator.name)}
              selectedBlockId={selectedBlock?.id ?? null}
              hoveredBlockId={null}
              onBlockClick={(block) => setSelectedBlock(block)}
              onBlockHover={() => {}}
               highlightOperator={operator.name}
               autoFitBounds
            />
          </div>
        </CardContent>
      </Card>

      {/* Search + Detail Tabs */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar bloco, campo, instalação..." className="pl-9 h-9 text-sm" value={detailSearch} onChange={e => setDetailSearch(e.target.value)} />
      </div>
      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="blocks" className="text-xs gap-1"><Layers className="w-3 h-3" /> Blocos</TabsTrigger>
          <TabsTrigger value="production" className="text-xs gap-1"><Droplets className="w-3 h-3" /> Produção</TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs gap-1"><FileText className="w-3 h-3" /> Contratos</TabsTrigger>
          <TabsTrigger value="exploration" className="text-xs gap-1"><Search className="w-3 h-3" /> Exploração</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs gap-1"><TrendingUp className="w-3 h-3" /> Financeiro</TabsTrigger>
          <TabsTrigger value="hse" className="text-xs gap-1"><ShieldCheck className="w-3 h-3" /> HSE</TabsTrigger>
          <TabsTrigger value="facilities" className="text-xs gap-1"><Factory className="w-3 h-3" /> Instalações</TabsTrigger>
        </TabsList>

        {/* Blocos Operados */}
        <TabsContent value="blocks">
          <Card className="glass-card">
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead label="Bloco" colKey="name" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} />
                    <SortableHead label="Fase" colKey="phase" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} />
                    <SortableHead label="Bacia" colKey="basin" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} />
                    <SortableHead label="Águas" colKey="waterDepth" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} />
                    <SortableHead label="Produção (BOPD)" colKey="dailyProduction" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} align="text-right" />
                    <SortableHead label="Reservas (MMbbl)" colKey="estimatedReserves" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} align="text-right" />
                    <SortableHead label="Compliance" colKey="complianceScore" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} align="text-right" />
                    <SortableHead label="Contrato" colKey="contractDate" sortKey={blocksSort.sortKey} sortDir={blocksSort.sortDir} onSort={blocksSort.handleSort} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocksSort.sorted.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{b.phase}</Badge></TableCell>
                      <TableCell className="text-xs">{b.basin}</TableCell>
                      <TableCell className="text-xs">{b.waterDepth}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{b.dailyProduction.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{b.estimatedReserves.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono text-xs ${b.complianceScore >= 90 ? "text-success" : b.complianceScore >= 75 ? "text-warning" : "text-danger"}`}>
                          {b.complianceScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{b.contractDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produção */}
        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWrapper title="Produção por Bloco" icon={<BarChart3 className="w-4 h-4" />} height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prodByBlock} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} BOPD`} />
                  <Bar dataKey="production" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <ChartWrapper title="Histórico Mensal Agregado" icon={<Droplets className="w-4 h-4" />} height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} BOPD`} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </TabsContent>

        {/* Contratos & Consórcio */}
        <TabsContent value="contracts">
          <div className="space-y-4">
            {blocks.map(b => (
              <Card key={b.id} className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{b.name}</CardTitle>
                  {b.contractInfo?.contractType && (
                    <CardDescription className="text-xs">Tipo: {b.contractInfo.contractType}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {b.contractInfo?.signingDate && (
                      <div><p className="text-muted-foreground">Assinatura</p><p className="font-medium">{b.contractInfo.signingDate}</p></div>
                    )}
                    {b.contractInfo?.effectiveDate && (
                      <div><p className="text-muted-foreground">Entrada em Vigor</p><p className="font-medium">{b.contractInfo.effectiveDate}</p></div>
                    )}
                    {b.contractInfo?.signatureBonus != null && (
                      <div><p className="text-muted-foreground">Bónus Assinatura</p><p className="font-medium">${b.contractInfo.signatureBonus.toLocaleString()}</p></div>
                    )}
                    {b.contractInfo?.productionBonus != null && (
                      <div><p className="text-muted-foreground">Bónus Produção</p><p className="font-medium">${b.contractInfo.productionBonus.toLocaleString()}</p></div>
                    )}
                  </div>

                  {/* Consortium */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Consórcio</p>
                    <div className="flex flex-wrap gap-2">
                      {b.concession.map(c => (
                        <Badge key={c.name} variant={c.isOperator ? "default" : "secondary"} className="text-[10px]">
                          {c.name} — {c.share}%
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Fiscal Conditions */}
                  {b.contractInfo?.fiscalConditions && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Condições Fiscais</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {b.contractInfo.fiscalConditions.irp != null && (
                          <div><p className="text-muted-foreground">IRP</p><p className="font-medium">{b.contractInfo.fiscalConditions.irp}%</p></div>
                        )}
                        {b.contractInfo.fiscalConditions.ipp != null && (
                          <div><p className="text-muted-foreground">IPP</p><p className="font-medium">{b.contractInfo.fiscalConditions.ipp}%</p></div>
                        )}
                        {b.contractInfo.fiscalConditions.costRecoveryPreProd != null && (
                          <div><p className="text-muted-foreground">Cost Recovery (Pré)</p><p className="font-medium">{b.contractInfo.fiscalConditions.costRecoveryPreProd}%</p></div>
                        )}
                        {b.contractInfo.fiscalConditions.costRecoveryPostProd != null && (
                          <div><p className="text-muted-foreground">Cost Recovery (Pós)</p><p className="font-medium">{b.contractInfo.fiscalConditions.costRecoveryPostProd}%</p></div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Exploração */}
        <TabsContent value="exploration">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Sísmica 2D (km)", value: explorationTotals.wells2d.toLocaleString() },
                { label: "Sísmica 3D (km²)", value: explorationTotals.wells3d.toLocaleString() },
                { label: "Poços Pesquisa", value: explorationTotals.pesquisa.toString() },
                { label: "Poços Avaliação", value: explorationTotals.avaliacao.toString() },
                { label: "Descobertas Comerciais", value: explorationTotals.discoveries.toString() },
              ].map(k => (
                <Card key={k.label} className="glass-card">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">{k.label}</p>
                    <p className="text-lg font-bold text-primary">{k.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Fields/Discoveries table */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Descobertas por Bloco</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Bloco" colKey="blockName" sortKey={fieldsSort.sortKey} sortDir={fieldsSort.sortDir} onSort={fieldsSort.handleSort} />
                      <SortableHead label="Campo" colKey="fieldName" sortKey={fieldsSort.sortKey} sortDir={fieldsSort.sortDir} onSort={fieldsSort.handleSort} />
                      <SortableHead label="Status" colKey="status" sortKey={fieldsSort.sortKey} sortDir={fieldsSort.sortDir} onSort={fieldsSort.handleSort} />
                      <SortableHead label="Ano" colKey="discoveryYear" sortKey={fieldsSort.sortKey} sortDir={fieldsSort.sortDir} onSort={fieldsSort.handleSort} />
                      <SortableHead label="Pico (BOPD)" colKey="peakProduction" sortKey={fieldsSort.sortKey} sortDir={fieldsSort.sortDir} onSort={fieldsSort.handleSort} align="text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldsSort.sorted.map((f, i) => (
                      <TableRow key={`${f.blockName}-${f.fieldName}-${i}`}>
                        <TableCell className="text-xs">{f.blockName}</TableCell>
                        <TableCell className="text-xs font-medium">{f.fieldName}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{f.status}</Badge></TableCell>
                        <TableCell className="text-xs">{f.discoveryYear || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{f.peakProduction ? f.peakProduction.toLocaleString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                    {fieldsData.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-6">Sem dados de descobertas disponíveis</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financial">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Investimento Acumulado", value: `$${operator.totalAccumulatedInvestment.toLocaleString()}MM` },
                { label: "Investimento Planeado", value: `$${operator.totalPlannedInvestment.toLocaleString()}MM` },
                { label: "Risco Médio", value: operator.avgRisk.toFixed(1) },
                { label: "Opex/Barril Médio", value: (() => {
                  const ops = blocks.filter(b => b.economicData?.opexPerBarrel);
                  return ops.length ? `$${(ops.reduce((s, b) => s + (b.economicData?.opexPerBarrel || 0), 0) / ops.length).toFixed(2)}/BO` : "—";
                })() },
              ].map(k => (
                <Card key={k.label} className="glass-card">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">{k.label}</p>
                    <p className="text-lg font-bold text-primary">{k.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Investment by block */}
            <ChartWrapper title="Investimento por Bloco (Acumulado vs Planeado)" icon={<TrendingUp className="w-4 h-4" />} height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blocks.map(b => ({ name: b.name, acumulado: b.accumulatedInvestment, planeado: b.plannedInvestment }))} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}MM`} />
                  <Legend />
                  <Bar dataKey="acumulado" name="Acumulado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planeado" name="Planeado" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>

            {/* NPV table per block */}
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Dados Económicos por Bloco</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="Bloco" colKey="name" sortKey={econSort.sortKey} sortDir={econSort.sortDir} onSort={econSort.handleSort} />
                      <SortableHead label="Opex/Barril" colKey="opexPerBarrel" sortKey={econSort.sortKey} sortDir={econSort.sortDir} onSort={econSort.handleSort} align="text-right" />
                      <SortableHead label="Invest. Acum." colKey="accumulatedInvestment" sortKey={econSort.sortKey} sortDir={econSort.sortDir} onSort={econSort.handleSort} align="text-right" />
                      <SortableHead label="Invest. Plan." colKey="plannedInvestment" sortKey={econSort.sortKey} sortDir={econSort.sortDir} onSort={econSort.handleSort} align="text-right" />
                      <SortableHead label="Taxa Execução" colKey="executionRate" sortKey={econSort.sortKey} sortDir={econSort.sortDir} onSort={econSort.handleSort} align="text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {econSort.sorted.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium text-xs">{b.name}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{b.opexPerBarrel ? `$${b.opexPerBarrel}` : "—"}</TableCell>
                        <TableCell className="text-right font-mono text-xs">${b.accumulatedInvestment.toLocaleString()}MM</TableCell>
                        <TableCell className="text-right font-mono text-xs">${b.plannedInvestment.toLocaleString()}MM</TableCell>
                        <TableCell className="text-right font-mono text-xs">{b.executionRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HSE */}
        <TabsContent value="hse">
          <div className="space-y-6">
            {aggregatedHSE.length > 0 ? (
              <>
                <Card className="glass-card">
                  <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Indicadores HSE Agregados</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ano</TableHead>
                          <TableHead className="text-right">Fatalidades</TableHead>
                          <TableHead className="text-right">LTI</TableHead>
                          <TableHead className="text-right">RWC</TableHead>
                          <TableHead className="text-right">TRIR</TableHead>
                          <TableHead className="text-right">LTIR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aggregatedHSE.map(h => (
                          <TableRow key={h.year}>
                            <TableCell className="font-medium">{h.year}</TableCell>
                            <TableCell className={`text-right font-mono ${h.fat > 0 ? "text-red-500 font-bold" : ""}`}>{h.fat}</TableCell>
                            <TableCell className="text-right font-mono">{h.lti}</TableCell>
                            <TableCell className="text-right font-mono">{h.rwc}</TableCell>
                            <TableCell className="text-right font-mono">{h.trir.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{h.ltir.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <ChartWrapper title="Evolução TRIR" icon={<ShieldCheck className="w-4 h-4" />} height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aggregatedHSE}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="trir" name="TRIR" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="ltir" name="LTIR" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartWrapper>
              </>
            ) : (
              <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Sem dados HSE disponíveis para este operador</CardContent></Card>
            )}
          </div>
        </TabsContent>

        {/* Instalações */}
        <TabsContent value="facilities">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Plataformas/FPSOs</p>
                  <p className="text-lg font-bold text-primary">{facilities.platforms.length}</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Capacidade Total</p>
                  <p className="text-lg font-bold text-primary">{facilities.totalCapacity > 0 ? `${facilities.totalCapacity.toLocaleString()} BOPD` : "—"}</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Blocos com Instalações</p>
                  <p className="text-lg font-bold text-primary">{blocks.filter(b => b.facilityData).length}</p>
                </CardContent>
              </Card>
            </div>

            {facilities.platforms.length > 0 ? (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Instalações</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHead label="Nome" colKey="name" sortKey={facilitiesSort.sortKey} sortDir={facilitiesSort.sortDir} onSort={facilitiesSort.handleSort} />
                        <SortableHead label="Tipo" colKey="type" sortKey={facilitiesSort.sortKey} sortDir={facilitiesSort.sortDir} onSort={facilitiesSort.handleSort} />
                        <SortableHead label="Bloco" colKey="block" sortKey={facilitiesSort.sortKey} sortDir={facilitiesSort.sortDir} onSort={facilitiesSort.handleSort} />
                        <SortableHead label="Status" colKey="status" sortKey={facilitiesSort.sortKey} sortDir={facilitiesSort.sortDir} onSort={facilitiesSort.handleSort} />
                        <SortableHead label="Capacidade" colKey="capacity" sortKey={facilitiesSort.sortKey} sortDir={facilitiesSort.sortDir} onSort={facilitiesSort.handleSort} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facilitiesSort.sorted.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-xs">{p.name}</TableCell>
                          <TableCell className="text-xs">{p.type}</TableCell>
                          <TableCell className="text-xs">{p.block}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "Operacional" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{p.capacity || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">Sem dados de instalações disponíveis</CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────
export function OperatorsPanel() {
  const operators = useMemo(() => buildOperators(), []);
  return <OperatorListView operators={operators} />;
}
