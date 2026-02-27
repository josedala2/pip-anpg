import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { oilBlocks } from "@/data/angolaBlocks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { AlertTriangle, Target, Layers, Droplets, Filter, ChevronDown } from "lucide-react";
import { ExplorationSummaryTable } from "./ExplorationSummaryTable";
import { ProspectsTable } from "./ProspectsTable";
import { ProspectsSummary } from "./ProspectsSummary";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const phaseColor = (phase: string) => {
  switch (phase) {
    case "Production": return "bg-success/15 text-success border-success/30";
    case "Development": return "bg-warning/15 text-warning border-warning/30";
    case "Exploration": return "bg-primary/15 text-primary border-primary/30";
    case "Suspended": return "bg-danger/15 text-danger border-danger/30";
    case "Bidding": return "bg-[hsl(280,65%,60%)]/15 text-[hsl(280,65%,60%)] border-[hsl(280,65%,60%)]/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const operators = [...new Set(oilBlocks.map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.map(b => b.basin))].sort();
const blockNames = oilBlocks.map(b => ({ id: b.id, name: b.name })).sort((a, b) => a.name.localeCompare(b.name));
const phases = ["Production", "Development", "Exploration", "Bidding", "Suspended"];

const basinLabel: Record<string, string> = {
  "Lower Congo": "Bacia do Congo",
  "Congo": "Bacia do Congo",
  "Kwanza": "Bacia do Kwanza",
  "Namibe": "Bacia do Namibe",
  "Benguela": "Bacia de Benguela",
};

export const ExplorationPanel = () => {
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterBasin, setFilterBasin] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");

  const filteredBlocks = useMemo(() => {
    return oilBlocks.filter(b => {
      if (filterBlock !== "all" && b.id !== filterBlock) return false;
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      if (filterPhase !== "all" && b.phase !== filterPhase) return false;
      return true;
    });
  }, [filterOperator, filterBasin, filterPhase, filterBlock]);

  const stats = useMemo(() => {
    const totalProd = filteredBlocks.reduce((s, b) => s + b.dailyProduction, 0);
    const totalReserves = filteredBlocks.reduce((s, b) => s + b.estimatedReserves, 0);
    const totalInvest = filteredBlocks.reduce((s, b) => s + b.accumulatedInvestment, 0);
    return { totalProd, totalReserves, totalInvest, count: filteredBlocks.length };
  }, [filteredBlocks]);

  // Aggregate seismic data from all filtered blocks
  const seismicChartData = useMemo(() => {
    const yearMap: Record<number, { s2D: number; s3D: number; s4D: number }> = {};
    filteredBlocks.forEach(b => {
      (b.seismicData || []).forEach(d => {
        if (!yearMap[d.year]) yearMap[d.year] = { s2D: 0, s3D: 0, s4D: 0 };
        yearMap[d.year].s2D += d.seismic2D;
        yearMap[d.year].s3D += d.seismic3D;
        yearMap[d.year].s4D += d.seismic4D;
      });
    });
    return Object.entries(yearMap)
      .map(([year, v]) => ({ year, "2D": v.s2D, "3D": v.s3D, "4D": v.s4D }))
      .filter(d => d["2D"] > 0 || d["3D"] > 0 || d["4D"] > 0)
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [filteredBlocks]);

  // Aggregate wells data from all filtered blocks
  const wellsChartData = useMemo(() => {
    const yearMap: Record<number, { pesquisa: number; avaliacao: number }> = {};
    filteredBlocks.forEach(b => {
      (b.wellsData || []).forEach(d => {
        if (!yearMap[d.year]) yearMap[d.year] = { pesquisa: 0, avaliacao: 0 };
        yearMap[d.year].pesquisa += d.pesquisa;
        yearMap[d.year].avaliacao += d.avaliacao;
      });
    });
    return Object.entries(yearMap)
      .map(([year, v]) => ({ year, Pesquisa: v.pesquisa, Avaliação: v.avaliacao }))
      .filter(d => d.Pesquisa > 0 || d.Avaliação > 0)
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [filteredBlocks]);

  // Aggregate exploration stats from filtered blocks
  const explorationStats = useMemo(() => {
    let total2D = 0, total3D = 0, total4D = 0;
    let totalWells = 0, pesquisaWells = 0, avaliacaoWells = 0;
    const allObjectives = new Set<string>();

    filteredBlocks.forEach(b => {
      (b.seismicData || []).forEach(d => {
        total2D += d.seismic2D;
        total3D += d.seismic3D;
        total4D += d.seismic4D;
      });
      (b.wellsData || []).forEach(d => {
        pesquisaWells += d.pesquisa;
        avaliacaoWells += d.avaliacao;
        totalWells += d.pesquisa + d.avaliacao;
      });
      (b.geologicalObjectives || []).forEach(o => allObjectives.add(o));
    });

    const blocksWithWells = filteredBlocks.filter(b => b.wellsData && b.wellsData.length > 0);
    const blocksWithFields = filteredBlocks.filter(b => b.fields && b.fields.length > 0);
    const totalDiscoveries = blocksWithFields.reduce((s, b) => s + (b.fields?.length || 0), 0);
    const successRate = totalWells > 0 ? Math.round((totalDiscoveries / totalWells) * 100) : 0;

    return {
      total2D, total3D, total4D,
      totalWells, pesquisaWells, avaliacaoWells,
      successRate: Math.min(successRate, 100),
      geologicalObjectives: [...allObjectives].sort(),
      totalReserves: filteredBlocks.reduce((s, b) => s + b.estimatedReserves, 0),
    };
  }, [filteredBlocks]);

  const hasFilters = filterOperator !== "all" || filterBasin !== "all" || filterPhase !== "all" || filterBlock !== "all";
  const scopeLabel = filterBlock !== "all" ? filteredBlocks[0]?.name || "Bloco" : hasFilters ? "Blocos Filtrados" : "Todos os Blocos";

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Block Filters */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
           <CardTitle className="text-sm 2xl:text-lg flex items-center gap-2">
             <Filter className="w-4 h-4 2xl:w-5 2xl:h-5 text-primary" />
            Filtrar por Bloco
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Select value={filterBlock} onValueChange={setFilterBlock}>
              <SelectTrigger className="w-36 md:w-44 h-8 text-xs glass-card border-border/50">
                <SelectValue placeholder="Bloco" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60">
                <SelectItem value="all">Todos Blocos</SelectItem>
                {blockNames.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterOperator} onValueChange={setFilterOperator}>
              <SelectTrigger className="w-36 md:w-44 h-8 text-xs glass-card border-border/50">
                <SelectValue placeholder="Operador" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos Operadores</SelectItem>
                {operators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBasin} onValueChange={setFilterBasin}>
              <SelectTrigger className="w-36 md:w-44 h-8 text-xs glass-card border-border/50">
                <SelectValue placeholder="Bacia" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Bacias</SelectItem>
                {basins.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-36 md:w-44 h-8 text-xs glass-card border-border/50">
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Fases</SelectItem>
                {phases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button
                onClick={() => { setFilterBlock("all"); setFilterOperator("all"); setFilterBasin("all"); setFilterPhase("all"); }}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Filtered Blocks - Grouped by Basin */}
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {stats.count} bloco{stats.count !== 1 ? "s" : ""} contemplado{stats.count !== 1 ? "s" : ""}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {stats.totalProd > 0 ? `${(stats.totalProd / 1000).toFixed(0)}k BOPD` : ""} · {stats.totalReserves.toLocaleString()} MMbbl · ${(stats.totalInvest / 1000).toFixed(1)}B investido
              </span>
            </div>
            {(() => {
              const groups: Record<string, typeof filteredBlocks> = {};
              filteredBlocks.forEach(b => {
                if (!groups[b.basin]) groups[b.basin] = [];
                groups[b.basin].push(b);
              });
              return Object.entries(groups)
                .sort((a, b) => b[1].reduce((s, bl) => s + bl.dailyProduction, 0) - a[1].reduce((s, bl) => s + bl.dailyProduction, 0))
                .map(([basin, blocks]) => (
                  <Collapsible key={basin} defaultOpen={blocks.length <= 15}>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-semibold">{basinLabel[basin] || basin}</span>
                        <span className="text-[9px] text-muted-foreground">({blocks.length})</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="flex flex-wrap gap-1 pt-1 pb-2 pl-4">
                        {blocks.map(block => (
                          <Badge
                            key={block.id}
                            variant="outline"
                            className={`text-[10px] font-medium ${phaseColor(block.phase)}`}
                          >
                            {block.name}
                            {block.dailyProduction > 0 && (
                              <span className="ml-1 opacity-70">{(block.dailyProduction / 1000).toFixed(0)}k</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Seismic Total Acquired */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <Layers className="w-5 h-5 text-primary shrink-0" />
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sísmica Total Adquirida</div>
          <div className="font-bold font-mono text-lg 2xl:text-xl">
            {explorationStats.total2D.toLocaleString()} <span className="text-xs text-muted-foreground">km (2D)</span>
            {" · "}
            {explorationStats.total3D.toLocaleString()} <span className="text-xs text-muted-foreground">km² (3D)</span>
            {explorationStats.total4D > 0 && (
              <>
                {" · "}
                {explorationStats.total4D.toLocaleString()} <span className="text-xs text-muted-foreground">km² (4D)</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 2xl:gap-4">
        {[
          { icon: Layers, label: "Sísmica 2D", value: `${explorationStats.total2D.toLocaleString()} km`, color: "text-warning" },
          { icon: Layers, label: "Sísmica 3D", value: `${explorationStats.total3D.toLocaleString()} km²`, color: "text-success" },
          { icon: Target, label: "Taxa de Sucesso", value: `${explorationStats.successRate}%`, color: "text-primary" },
          { icon: Droplets, label: "Reservas Totais", value: `${explorationStats.totalReserves.toLocaleString()} MMbbl`, color: "text-primary" },
        ].map(s => (
          <Card key={s.label} className="glass-card">
           <CardContent className="p-4 2xl:p-5 flex items-center gap-3">
               <s.icon className={`w-5 h-5 2xl:w-6 2xl:h-6 ${s.color} shrink-0`} />
               <div>
                 <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                 <div className="text-lg 2xl:text-xl font-bold font-mono">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wells Stats Row */}
      <div className="grid grid-cols-3 gap-3 2xl:gap-4">
        <Card className="glass-card">
           <CardContent className="p-4 2xl:p-6 text-center">
             <div className="text-xs 2xl:text-sm text-muted-foreground mb-1">Total Poços Exploração</div>
             <div className="text-3xl 2xl:text-4xl font-bold font-mono">{explorationStats.totalWells}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
           <CardContent className="p-4 2xl:p-6 text-center">
             <div className="text-xs 2xl:text-sm text-muted-foreground mb-1">Pesquisa</div>
             <div className="text-3xl 2xl:text-4xl font-bold font-mono text-primary">{explorationStats.pesquisaWells}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
           <CardContent className="p-4 2xl:p-6 text-center">
             <div className="text-xs 2xl:text-sm text-muted-foreground mb-1">Avaliação</div>
             <div className="text-3xl 2xl:text-4xl font-bold font-mono text-warning">{explorationStats.avaliacaoWells}</div>
          </CardContent>
        </Card>
      </div>

      {/* Scope indicator */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
          {scopeLabel} ({stats.count})
        </Badge>
        {seismicChartData.length === 0 && wellsChartData.length === 0 && (
          <span className="text-xs text-muted-foreground">Sem dados de exploração disponíveis para esta selecção</span>
        )}
      </div>

      {/* Seismic Chart */}
      {seismicChartData.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Sísmica Adquirida — {scopeLabel}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
             <ResponsiveContainer width="100%" height={360}>
              <BarChart data={seismicChartData} barGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" interval={2} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" width={50} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="2D" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} name="2D (km)" />
                <Bar dataKey="3D" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} name="3D (km²)" />
                <Bar dataKey="4D" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="4D (km²)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Wells Chart */}
      {wellsChartData.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Poços de Avaliação vs Pesquisa — {scopeLabel}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={wellsChartData} barGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" interval={2} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Pesquisa" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Avaliação" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Table */}
      <ExplorationSummaryTable blocks={filteredBlocks} scopeLabel={scopeLabel} />

      {/* Prospects Summary - Consolidated by Reservoir/Basin */}
      <ProspectsSummary blocks={filteredBlocks} scopeLabel={scopeLabel} />

      {/* Prospects Table */}
      <ProspectsTable blocks={filteredBlocks} scopeLabel={scopeLabel} />

      {/* Challenges */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Desafios do Sector
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <ul className="space-y-2">
            {[
              "Alto índice de poços secos e custos operacionais elevados",
              "Baixa qualidade do dado sísmico em algumas bacias",
              "Elevado número de descobertas não desenvolvidas",
              "Optimizar a Rocha Geradora Bucomazi como reservatório não convencional",
              "Exposição excessiva ao risco financeiro e falta de capital",
            ].map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
