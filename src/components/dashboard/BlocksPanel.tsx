import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { oilBlocks, type OilBlock, type WaterDepth } from "@/data/angolaBlocks";
import { Badge } from "@/components/ui/badge";
import { Filter, MapPin, Users, Droplets, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

const operators = [...new Set(oilBlocks.map(b => b.operator))].sort();
const basins = [...new Set(oilBlocks.map(b => b.basin))].sort();
const phases = ["Production", "Development", "Exploration", "Suspended"];
const waterDepths: WaterDepth[] = ["Onshore", "Shallow Water", "Deep Water", "Ultra-Deep Water"];

const phaseColor = (phase: string) => {
  switch (phase) {
    case "Production": return "bg-success/15 text-success border-success/30";
    case "Development": return "bg-warning/15 text-warning border-warning/30";
    case "Exploration": return "bg-primary/15 text-primary border-primary/30";
    case "Suspended": return "bg-danger/15 text-danger border-danger/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const depthLabel: Record<WaterDepth, string> = {
  "Onshore": "Onshore",
  "Shallow Water": "Águas Rasas",
  "Deep Water": "Águas Profundas",
  "Ultra-Deep Water": "Ultra-Profundas",
};

const BlockCard = ({ block }: { block: OilBlock }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="glass-card hover:border-primary/30 transition-all">
      <CardContent className="p-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{block.name}</span>
                <Badge variant="outline" className={`text-[10px] ${phaseColor(block.phase)}`}>
                  {block.phase}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{depthLabel[block.waterDepth]}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{block.operator}</span>
                <span className="mx-1">·</span>
                {block.basin}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {block.dailyProduction > 0 && (
                <div className="text-right">
                  <div className="text-sm font-bold font-mono">{(block.dailyProduction / 1000).toFixed(0)}k</div>
                  <div className="text-[10px] text-muted-foreground">BOPD</div>
                </div>
              )}
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3 animate-fade-in">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Reservas", value: `${block.estimatedReserves} MMbbl`, icon: Droplets },
                { label: "Invest. Acum.", value: `$${(block.accumulatedInvestment / 1000).toFixed(1)}B`, icon: TrendingUp },
                { label: "Execução", value: `${block.executionRate}%`, icon: MapPin },
                { label: "Risco", value: `${block.riskScore}/10`, icon: Users },
              ].map(m => (
                <div key={m.label} className="glass-card p-2 rounded-lg text-center">
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  <div className="text-sm font-bold font-mono">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Concession Partners */}
            {block.concession.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Associação / Consórcio</div>
                <div className="space-y-1">
                  {block.concession.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className={p.isOperator ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {p.name} {p.isOperator && <span className="text-primary text-[10px]">(OP)</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full"
                            style={{ width: `${p.share}%` }}
                          />
                        </div>
                        <span className="font-mono w-12 text-right">{p.share.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contract & Compliance */}
            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              <span>Contrato: {block.contractDate}</span>
              <span>·</span>
              <span>Compliance: {block.complianceScore}%</span>
              <span>·</span>
              <span>Invest. Planeado: ${(block.plannedInvestment / 1000).toFixed(1)}B</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BlocksPanel = () => {
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterBasin, setFilterBasin] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterDepth, setFilterDepth] = useState("all");

  const filteredBlocks = useMemo(() => {
    return oilBlocks.filter(b => {
      if (filterOperator !== "all" && b.operator !== filterOperator) return false;
      if (filterBasin !== "all" && b.basin !== filterBasin) return false;
      if (filterPhase !== "all" && b.phase !== filterPhase) return false;
      if (filterDepth !== "all" && b.waterDepth !== filterDepth) return false;
      return true;
    });
  }, [filterOperator, filterBasin, filterPhase, filterDepth]);

  const stats = useMemo(() => ({
    total: filteredBlocks.length,
    production: filteredBlocks.filter(b => b.phase === "Production").length,
    totalProd: filteredBlocks.reduce((s, b) => s + b.dailyProduction, 0),
    totalReserves: filteredBlocks.reduce((s, b) => s + b.estimatedReserves, 0),
  }), [filteredBlocks]);

  const hasFilters = filterOperator !== "all" || filterBasin !== "all" || filterPhase !== "all" || filterDepth !== "all";

  // Group by water depth
  const grouped = useMemo(() => {
    const groups: Record<string, OilBlock[]> = {};
    filteredBlocks.forEach(b => {
      const key = b.waterDepth;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  }, [filteredBlocks]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Filtros de Concessões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="flex flex-wrap gap-2">
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
            <Select value={filterDepth} onValueChange={setFilterDepth}>
              <SelectTrigger className="w-36 md:w-44 h-8 text-xs glass-card border-border/50">
                <SelectValue placeholder="Profundidade" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Profundidades</SelectItem>
                {waterDepths.map(d => <SelectItem key={d} value={d}>{depthLabel[d]}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button
                onClick={() => { setFilterOperator("all"); setFilterBasin("all"); setFilterPhase("all"); setFilterDepth("all"); }}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="glass-card p-2 rounded-lg text-center">
              <div className="text-[10px] text-muted-foreground">Blocos</div>
              <div className="text-lg font-bold font-mono">{stats.total}</div>
            </div>
            <div className="glass-card p-2 rounded-lg text-center">
              <div className="text-[10px] text-muted-foreground">Em Produção</div>
              <div className="text-lg font-bold font-mono text-success">{stats.production}</div>
            </div>
            <div className="glass-card p-2 rounded-lg text-center">
              <div className="text-[10px] text-muted-foreground">Prod. Total</div>
              <div className="text-lg font-bold font-mono">{(stats.totalProd / 1000).toFixed(0)}k <span className="text-[10px] text-muted-foreground">BOPD</span></div>
            </div>
            <div className="glass-card p-2 rounded-lg text-center">
              <div className="text-[10px] text-muted-foreground">Reservas</div>
              <div className="text-lg font-bold font-mono">{(stats.totalReserves / 1000).toFixed(1)}B <span className="text-[10px] text-muted-foreground">bbl</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks grouped by water depth */}
      {(["Deep Water", "Ultra-Deep Water", "Shallow Water", "Onshore"] as WaterDepth[]).map(depth => {
        const blocks = grouped[depth];
        if (!blocks || blocks.length === 0) return null;
        return (
          <div key={depth} className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {depthLabel[depth]} ({blocks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {blocks.map(block => (
                <BlockCard key={block.id} block={block} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
