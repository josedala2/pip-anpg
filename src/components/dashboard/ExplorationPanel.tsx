import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { seismicHistory, wellsHistory, nationalStats, oilBlocks } from "@/data/angolaBlocks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { AlertTriangle, Target, Layers, Droplets, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

const seismicChartData = seismicHistory
  .filter(d => d.seismic2D > 0 || d.seismic3D > 0 || d.seismic4D > 0)
  .map(d => ({ year: d.year.toString(), "2D": d.seismic2D, "3D": d.seismic3D, "4D": d.seismic4D }));

const wellsChartData = wellsHistory
  .filter(d => d.pesquisa > 0 || d.avaliacao > 0)
  .map(d => ({ year: d.year.toString(), Pesquisa: d.pesquisa, Avaliação: d.avaliacao }));

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const operators = [...new Set(oilBlocks.map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.map(b => b.basin))].sort();
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

  const filteredBlocks = useMemo(() => {
    return oilBlocks.filter(b => {
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      if (filterPhase !== "all" && b.phase !== filterPhase) return false;
      return true;
    });
  }, [filterOperator, filterBasin, filterPhase]);

  const stats = useMemo(() => {
    const totalProd = filteredBlocks.reduce((s, b) => s + b.dailyProduction, 0);
    const totalReserves = filteredBlocks.reduce((s, b) => s + b.estimatedReserves, 0);
    const totalInvest = filteredBlocks.reduce((s, b) => s + b.accumulatedInvestment, 0);
    return { totalProd, totalReserves, totalInvest, count: filteredBlocks.length };
  }, [filteredBlocks]);

  const hasFilters = filterOperator !== "all" || filterBasin !== "all" || filterPhase !== "all";

  return (
    <div className="space-y-6">
      {/* Block Filters */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Filtrar por Bloco
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-wrap gap-2 md:gap-3">
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
                onClick={() => { setFilterOperator("all"); setFilterBasin("all"); setFilterPhase("all"); }}
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

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Layers, label: "Sísmica 2D", value: `${nationalStats.seismicAcquired2D.toLocaleString()} km`, color: "text-warning" },
          { icon: Layers, label: "Sísmica 3D", value: `${nationalStats.seismicAcquired3D.toLocaleString()} km²`, color: "text-success" },
          { icon: Target, label: "Taxa de Sucesso", value: `${nationalStats.successRate}%`, color: "text-primary" },
          { icon: Droplets, label: "Descoberta (STOOIP)", value: `${(nationalStats.discoverySTOOIP / 1000).toFixed(0)}B bbl`, color: "text-primary" },
        ].map(s => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-lg font-bold font-mono">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wells Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Poços Exploração</div>
            <div className="text-3xl font-bold font-mono">{nationalStats.totalExplorationWells}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Pesquisa</div>
            <div className="text-3xl font-bold font-mono text-primary">{nationalStats.pesquisaWells}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Avaliação</div>
            <div className="text-3xl font-bold font-mono text-warning">{nationalStats.avaliacaoWells}</div>
          </CardContent>
        </Card>
      </div>

      {/* Seismic Chart */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Sísmica Adquirida (1960–2012)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={280}>
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

      {/* Wells Chart */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Poços de Avaliação vs Pesquisa (1966–2025)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={280}>
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

      {/* Resources & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Recursos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="glass-card p-3 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Descoberta (não desenvolvida)</div>
              <div className="font-bold font-mono">{nationalStats.undevelopedDiscoverySTOOIP} <span className="text-xs text-muted-foreground">MMBO</span> · {nationalStats.undevelopedDiscoveryGIIP.toLocaleString()} <span className="text-xs text-muted-foreground">BCF</span></div>
            </div>
            <div className="glass-card p-3 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Prospectivo</div>
              <div className="font-bold font-mono">{nationalStats.prospectiveSTOOIP.toLocaleString()} <span className="text-xs text-muted-foreground">MMBO</span> · {nationalStats.prospectiveGIIP.toLocaleString()} <span className="text-xs text-muted-foreground">BCF</span></div>
            </div>
            <div className="glass-card p-3 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Objectivos Geológicos</div>
              <div className="flex gap-2 flex-wrap">
                {nationalStats.geologicalObjectives.map(o => (
                  <span key={o} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">{o}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Desafios
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ul className="space-y-2">
              {nationalStats.challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
