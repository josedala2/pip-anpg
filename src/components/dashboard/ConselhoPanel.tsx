import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import { calculateStrategicScore, type StrategicScore, type StrategicClassification, classificationConfig, urgencyConfig } from "@/lib/strategicScoring";
import { calculateEconomicScore, type EconomicScoreResult, getNationalEconomicKPIs, classificationColors } from "@/lib/economicScoring";
import { evaluateAlerts, evaluateForecastAlerts } from "@/lib/alertsEngine";
import {
  BarChart3, Shield, AlertTriangle, TrendingDown, TrendingUp,
  Clock, FileCheck, ChevronDown, ChevronUp, ArrowUpRight,
  Landmark, Droplets, CircleDollarSign, Scale
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Cell } from "recharts";

// ── Health traffic light for each concession ──

type HealthStatus = "green" | "yellow" | "red";

interface ConcessionHealth {
  block: OilBlock;
  strategic: StrategicScore;
  economic: EconomicScoreResult;
  health: HealthStatus;
  healthLabel: string;
  healthFlags: string[];
  remainingYears: number | null;
  suggestedAction: string;
  actionUrgency: string;
}

function getContractRemainingYears(block: OilBlock): number | null {
  const end = block.contractInfo?.productionPeriodEnd;
  if (!end) return null;
  const endYear = parseInt(end.split("/").pop() || end.split("-").pop() || "0");
  if (endYear < 2000) return null;
  return endYear - 2026;
}

interface HealthFactors {
  strategic: StrategicScore;
  economic: EconomicScoreResult;
  remainingYears: number | null;
  block: OilBlock;
}

function computeHealth({ strategic, economic, remainingYears, block }: HealthFactors): { health: HealthStatus; label: string; flags: string[] } {
  const combined = (strategic.totalScore * 0.5) + (economic.totalScore * 0.5);
  const flags: string[] = [];
  let redFlags = 0;
  let yellowFlags = 0;

  // 1. Contract risk
  if (remainingYears !== null && remainingYears < 2) { redFlags++; flags.push("Prazo contratual < 2 anos"); }
  else if (remainingYears !== null && remainingYears < 5) { yellowFlags++; flags.push("Prazo contratual < 5 anos"); }

  // 2. Facility age (from productionStartYear)
  const startYear = block.facilityData?.productionStartYear;
  if (startYear) {
    const age = 2026 - startYear;
    if (age > 40) { redFlags++; flags.push(`Instalações com ${age} anos (>40)`); }
    else if (age > 30) { yellowFlags++; flags.push(`Instalações com ${age} anos (>30)`); }
  }

  // 3. Capacity utilization
  const capacity = block.facilityData?.capacityBOPD;
  if (capacity && capacity > 0 && block.dailyProduction > 0) {
    const utilization = (block.dailyProduction / capacity) * 100;
    if (utilization < 40) { redFlags++; flags.push(`Utilização ${utilization.toFixed(0)}% (<40%)`); }
    else if (utilization < 60) { yellowFlags++; flags.push(`Utilização ${utilization.toFixed(0)}% (<60%)`); }
  }

  // 4. Production decline (3-vs-3 method)
  const ph = block.productionHistory;
  if (ph && ph.length >= 6) {
    const first3Avg = (ph[0].value + ph[1].value + ph[2].value) / 3;
    const last3Avg = (ph[ph.length - 3].value + ph[ph.length - 2].value + ph[ph.length - 1].value) / 3;
    if (first3Avg > 0) {
      const declinePct = ((last3Avg - first3Avg) / first3Avg) * 100;
      if (declinePct < -25) { redFlags++; flags.push(`Declínio ${declinePct.toFixed(0)}% (>25%)`); }
      else if (declinePct < -15) { yellowFlags++; flags.push(`Declínio ${declinePct.toFixed(0)}% (>15%)`); }
    }
  }

  // 5. Low production volume (absolute threshold)
  if (block.phase === "Production" && block.dailyProduction < 1000) {
    redFlags++; flags.push(`Produção residual: ${block.dailyProduction.toLocaleString()} BOPD`);
  } else if (block.phase === "Production" && block.dailyProduction < 5000) {
    yellowFlags++; flags.push(`Produção baixa: ${block.dailyProduction.toLocaleString()} BOPD`);
  }

  // 6. Combined score baseline
  if (combined < 35) { redFlags++; flags.push(`Score combinado baixo: ${combined.toFixed(0)}`); }
  else if (combined < 60) { yellowFlags++; flags.push(`Score combinado moderado: ${combined.toFixed(0)}`); }

  // Final verdict: any red flag or 3+ yellow flags → escalate
  if (redFlags >= 1) return { health: "red", label: "Crítico", flags };
  if (yellowFlags >= 2) return { health: "yellow", label: "Atenção", flags };
  if (yellowFlags >= 1 && combined < 70) return { health: "yellow", label: "Atenção", flags };
  return { health: "green", label: "Saudável", flags };
}

function getSuggestedAction(strategic: StrategicScore, remainingYears: number | null): { action: string; urgency: string } {
  if (remainingYears !== null && remainingYears <= 1) return { action: "Renovar / Decidir", urgency: "Imediata" };
  if (remainingYears !== null && remainingYears <= 3) return { action: "Preparar Renovação", urgency: "Elevada" };

  switch (strategic.classification) {
    case "Preparar Abandono": return { action: "Avaliar Abandono", urgency: "Elevada" };
    case "Renegociar": return { action: "Renegociar Termos", urgency: "Imediata" };
    case "Relicitar": return { action: "Preparar Relicitação", urgency: "Elevada" };
    case "Revitalizar": return { action: "Plano Revitalização", urgency: "Moderada" };
    case "Monitorar": return { action: "Monitorar", urgency: "Baixa" };
    default: return { action: "Manter Estratégia", urgency: "Baixa" };
  }
}

// ── Health dot component ──
const HealthDot = ({ status }: { status: HealthStatus }) => {
  const colors: Record<HealthStatus, string> = {
    green: "bg-success",
    yellow: "bg-warning",
    red: "bg-danger animate-pulse",
  };
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[status]}`} />;
};

// ── Urgency badge ──
const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  const styles: Record<string, string> = {
    "Imediata": "bg-danger/15 text-danger border-danger/30",
    "Elevada": "bg-warning/15 text-warning border-warning/30",
    "Moderada": "bg-[hsl(var(--chart-3))]/15 text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3))]/30",
    "Baixa": "bg-success/15 text-success border-success/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[urgency] || styles["Baixa"]}`}>
      {urgency}
    </span>
  );
};

export const ConselhoPanel = () => {
  const [sortBy, setSortBy] = useState<"health" | "score" | "contract" | "action">("health");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");

  // ── Compute all data ──
  const { concessions, macro, alerts, trends } = useMemo(() => {
    const activeBlocks = oilBlocks.filter(b => b && b.phase !== "Bidding");

    const concessions: ConcessionHealth[] = activeBlocks.map(block => {
      const strategic = calculateStrategicScore(block);
      const economic = calculateEconomicScore(block);
      const remainingYears = getContractRemainingYears(block);
      const { health, label, flags } = computeHealth({ strategic, economic, remainingYears, block });
      const { action, urgency } = getSuggestedAction(strategic, remainingYears);

      return {
        block,
        strategic,
        economic,
        health,
        healthLabel: label,
        healthFlags: flags,
        remainingYears,
        suggestedAction: action,
        actionUrgency: urgency,
      };
    });

    // Macro KPIs
    const producing = activeBlocks.filter(b => b.phase === "Production");
    const totalProduction = producing.reduce((s, b) => s + b.dailyProduction, 0);
    const overview = getNationalEconomicKPIs(activeBlocks);
    const criticalCount = concessions.filter(c => c.health === "red").length;
    const renewSoon = concessions.filter(c => c.remainingYears !== null && c.remainingYears <= 3).length;

    const macro = {
      totalProduction,
      stateRevenue: overview.totalStateRevenue,
      criticalConcessions: criticalCount,
      renewSoon,
      totalActive: activeBlocks.length,
    };

    // Alerts summary
    let critAlerts: any[] = [];
    try {
      const opAlerts = evaluateAlerts();
      const fAlerts = evaluateForecastAlerts();
      const allAlerts = [...opAlerts, ...fAlerts];
      critAlerts = allAlerts.filter(a => a.severity === "critical").slice(0, 5);
    } catch { /* safe fallback */ }

    // Trends - use capexHistory years as proxy for annual production
    const yearMap: Record<number, number> = {};
    activeBlocks.forEach(b => {
      b.capexHistory.forEach(h => {
        const yr = parseInt(h.year);
        if (!isNaN(yr)) yearMap[yr] = (yearMap[yr] || 0) + b.dailyProduction;
      });
    });
    const trends = Object.entries(yearMap)
      .map(([year, value]) => ({ year: parseInt(year), value: Math.round(value) }))
      .filter(t => t.year >= 2018)
      .sort((a, b) => a.year - b.year);

    return { concessions, macro, alerts: critAlerts, trends };
  }, []);

  // ── Sort concessions ──
  const sorted = useMemo(() => {
    const healthOrder: Record<HealthStatus, number> = { red: 0, yellow: 1, green: 2 };
    const urgencyOrder: Record<string, number> = { "Imediata": 0, "Elevada": 1, "Moderada": 2, "Baixa": 3 };

    const filtered = classFilter === "all"
      ? concessions
      : concessions.filter(c => c.strategic.classification === classFilter);

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "health": cmp = healthOrder[a.health] - healthOrder[b.health]; break;
        case "score": cmp = a.strategic.totalScore - b.strategic.totalScore; break;
        case "contract": cmp = (a.remainingYears ?? 99) - (b.remainingYears ?? 99); break;
        case "action": cmp = urgencyOrder[a.actionUrgency] - urgencyOrder[b.actionUrgency]; break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [concessions, sortBy, sortAsc, classFilter]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    sortBy === col
      ? sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
      : null
  );

  // Classification distribution for mini chart
  const classDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    concessions.forEach(c => {
      counts[c.strategic.classification] = (counts[c.strategic.classification] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [concessions]);

  const barColors: Record<string, string> = {
    "Manter & Optimizar": "hsl(152, 50%, 38%)",
    "Monitorar": "hsl(215, 12%, 50%)",
    "Revitalizar": "hsl(199, 70%, 45%)",
    "Renegociar": "hsl(38, 75%, 48%)",
    "Preparar Abandono": "hsl(0, 65%, 42%)",
    "Relicitar": "hsl(280, 50%, 55%)",
  };

  return (
    <div className="space-y-5 p-4 md:p-6 2xl:p-8 max-w-[1920px] 3xl:max-w-[2400px] mx-auto">
      {/* ── Zone A: Executive Summary Line ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Painel do Conselho de Administração
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão decisória sobre {macro.totalActive} concessões activas · Dados actualizados a Janeiro 2026
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {macro.criticalConcessions > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="w-3 h-3" />
              {macro.criticalConcessions} concessões críticas
            </Badge>
          )}
          {macro.renewSoon > 0 && (
            <Badge className="text-xs gap-1 bg-warning/15 text-warning border-warning/30">
              <Clock className="w-3 h-3" />
              {macro.renewSoon} a renovar em 3 anos
            </Badge>
          )}
        </div>
      </div>

      {/* ── Zone B: 4 Macro KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MacroKPI
          icon={Droplets}
          label="Produção Nacional"
          value={`${(macro.totalProduction / 1000).toFixed(0)}K`}
          unit="bbl/dia"
          trend={macro.totalProduction > 1100000 ? "up" : "down"}
        />
        <MacroKPI
          icon={CircleDollarSign}
          label="Receita Estado"
          value={`$${(macro.stateRevenue / 1000).toFixed(1)}B`}
          unit="USD/ano estimado"
          trend="up"
        />
        <MacroKPI
          icon={AlertTriangle}
          label="Concessões em Risco"
          value={`${macro.criticalConcessions}`}
          unit={`de ${macro.totalActive} activas`}
          trend="alert"
          alert={macro.criticalConcessions > 3}
        />
        <MacroKPI
          icon={Scale}
          label="Renovações Próximas"
          value={`${macro.renewSoon}`}
          unit="nos próximos 3 anos"
          trend={macro.renewSoon > 5 ? "alert" : "neutral"}
        />
      </div>

      {/* ── Zone C + D side by side ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Zone C: Decision Matrix (2/3) */}
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Matriz de Decisão — Concessões
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">
                  Semáforo de saúde combinado (Score Estratégico + Económico). Clique numa linha para detalhes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="h-7 w-[180px] text-[11px]">
                    <SelectValue placeholder="Todas classificações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas classificações</SelectItem>
                    <SelectItem value="Manter & Optimizar">Manter & Optimizar</SelectItem>
                    <SelectItem value="Revitalizar">Revitalizar</SelectItem>
                    <SelectItem value="Renegociar">Renegociar</SelectItem>
                    <SelectItem value="Monitorar">Monitorar</SelectItem>
                    <SelectItem value="Preparar Abandono">Preparar Abandono</SelectItem>
                    <SelectItem value="Relicitar">Relicitar</SelectItem>
                  </SelectContent>
                </Select>
                {classFilter !== "all" && (
                  <span className="text-[10px] text-muted-foreground">{sorted.length} resultado(s)</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="max-h-[480px] overflow-auto rounded-md border border-border/40">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-10 text-[10px] cursor-pointer" onClick={() => toggleSort("health")}>
                      Saúde <SortIcon col="health" />
                    </TableHead>
                    <TableHead className="text-[10px]">Concessão</TableHead>
                    <TableHead className="text-[10px]">Operador</TableHead>
                    <TableHead className="text-[10px] text-right">Produção</TableHead>
                    <TableHead className="text-[10px] text-right cursor-pointer" onClick={() => toggleSort("score")}>
                      Score Est. <SortIcon col="score" />
                    </TableHead>
                    <TableHead className="text-[10px] text-right">Score Econ.</TableHead>
                    <TableHead className="text-[10px] text-right cursor-pointer" onClick={() => toggleSort("contract")}>
                      Prazo <SortIcon col="contract" />
                    </TableHead>
                    <TableHead className="text-[10px]">Classificação</TableHead>
                    <TableHead className="text-[10px] cursor-pointer" onClick={() => toggleSort("action")}>
                      Acção <SortIcon col="action" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map(c => (
                    <>
                      <TableRow
                        key={c.block.id}
                        className="cursor-pointer hover:bg-accent/40 transition-colors"
                        onClick={() => setExpandedRow(expandedRow === c.block.id ? null : c.block.id)}
                      >
                        <TableCell className="py-2 px-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger><HealthDot status={c.health} /></TooltipTrigger>
                              <TooltipContent className="text-xs max-w-[280px]">
                                <p className="font-semibold mb-1">{c.healthLabel}</p>
                                {c.healthFlags.length > 0 && (
                                  <ul className="space-y-0.5 text-[10px] text-muted-foreground">
                                    {c.healthFlags.map((f, i) => (
                                      <li key={i}>• {f}</li>
                                    ))}
                                  </ul>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="py-2 text-xs font-medium">
                          <span className="flex items-center gap-1.5">
                            {c.block.name}
                            {c.block.pendingRealData && <PendingDataBadge compact />}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-[11px] text-muted-foreground">{c.block.operator}</TableCell>
                        <TableCell className="py-2 text-xs text-right font-mono">
                          {c.block.dailyProduction > 0
                            ? <span className="text-foreground">{(c.block.dailyProduction / 1000).toFixed(1)}k</span>
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell className="py-2 text-xs text-right font-mono font-semibold">
                          {c.strategic.totalScore}
                        </TableCell>
                        <TableCell className="py-2 text-xs text-right font-mono">
                          <span className={
                            c.economic.totalScore >= 60 ? "text-success" :
                            c.economic.totalScore >= 40 ? "text-warning" : "text-danger"
                          }>
                            {c.economic.totalScore}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-right">
                          {c.remainingYears !== null ? (
                            <span className={c.remainingYears <= 2 ? "text-danger font-semibold" : c.remainingYears <= 5 ? "text-warning" : ""}>
                              {c.remainingYears} anos
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${classificationConfig[c.strategic.classification]?.bgColor || ""} ${classificationConfig[c.strategic.classification]?.color || ""}`}>
                            {c.strategic.classification}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            <UrgencyBadge urgency={c.actionUrgency} />
                            <span className="text-[10px] text-muted-foreground hidden lg:inline">{c.suggestedAction}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRow === c.block.id && (
                        <TableRow key={`${c.block.id}-detail`} className="bg-accent/20">
                          <TableCell colSpan={9} className="py-3 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="font-semibold text-foreground mb-1">Recomendação</p>
                                <p className="text-muted-foreground">{c.strategic.recommendation}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground mb-1">Risco de Inacção</p>
                                <p className="text-muted-foreground">{c.strategic.riskOfInaction}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground mb-1">Impacto Esperado</p>
                                <p className="text-muted-foreground">{c.strategic.expectedImpact}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="font-semibold text-foreground mb-1">Indicadores-Chave</p>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Reservas</span>
                                  <span className="font-medium">{c.block.estimatedReserves > 0 ? `${c.block.estimatedReserves} MMbbl` : "—"}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">OPEX/bbl</span>
                                  <span className="font-medium">${c.economic.opexPerBarrel.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Break-even</span>
                                  <span className="font-medium">${c.economic.breakeven.toFixed(0)}/bbl</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Compliance</span>
                                  <span className="font-medium">{c.block.complianceScore}%</span>
                                </div>
                                {c.block.facilityData?.utilizationRate != null && (
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Utilização</span>
                                    <span className="font-medium">{c.block.facilityData.utilizationRate}%</span>
                                  </div>
                                )}
                                {c.block.developmentProjects && c.block.developmentProjects.length > 0 && (
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Proj. Desenv.</span>
                                    <span className="font-medium">{c.block.developmentProjects.length} activos</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Zone D: Right sidebar — Alerts + Opportunities + Distribution */}
        <div className="space-y-4">
          {/* Alerts */}
          <Card className="border-danger/20">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-danger">
                <AlertTriangle className="w-3.5 h-3.5" />
                Alertas de Alto Impacto
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {alerts.length === 0 ? (
                <p className="text-[11px] text-muted-foreground py-2">Sem alertas críticos.</p>
              ) : (
                <div className="space-y-1.5">
                  {alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-danger/5 border border-danger/10">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{a.blockName}: {a.title}</p>
                        <p className="text-[10px] text-muted-foreground">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="border-success/20">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-success">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-1.5">
                {concessions.filter(c => c.remainingYears !== null && c.remainingYears <= 3 && c.strategic.totalScore >= 50).slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-success/5 border border-success/10">
                    <ArrowUpRight className="w-3 h-3 text-success mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium">{c.block.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Score {c.strategic.totalScore} · Renovação em {c.remainingYears} anos — bom candidato a extensão
                      </p>
                    </div>
                  </div>
                ))}
                {oilBlocks.filter(b => b?.phase === "Bidding").length > 0 && (
                  <div className="flex items-start gap-2 p-2 rounded-md bg-[hsl(var(--chart-4))]/5 border border-[hsl(var(--chart-4))]/10">
                    <FileCheck className="w-3 h-3 text-[hsl(var(--chart-4))] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium">Blocos em Licitação</p>
                      <p className="text-[10px] text-muted-foreground">
                        {oilBlocks.filter(b => b?.phase === "Bidding").length} blocos disponíveis para atribuição
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Classification Distribution */}
          <Card className="border-border/60">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                Distribuição Estratégica
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={classDistribution} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(v: number) => [`${v} blocos`, ""]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                    {classDistribution.map((entry) => (
                      <Cell key={entry.name} fill={barColors[entry.name] || "hsl(215, 12%, 50%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Zone E: National Trend ── */}
      <Card className="border-border/60">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Tendência de Produção Nacional (bbl/dia)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={trends} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200, 45%, 28%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(200, 45%, 28%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 84%)" strokeOpacity={0.4} />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} width={45} />
              <RechartsTooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v: number) => [`${v.toLocaleString()} bbl/dia`, "Produção"]}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(200, 45%, 28%)" fill="url(#prodGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Macro KPI Card ──

const MacroKPI = ({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  alert = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "alert" | "neutral";
  alert?: boolean;
}) => {
  const trendColors: Record<string, string> = {
    up: "text-success",
    down: "text-danger",
    alert: "text-danger",
    neutral: "text-muted-foreground",
  };
  return (
    <Card className={`border-border/60 ${alert ? "ring-1 ring-danger/30" : ""}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${alert ? "bg-danger/10" : "bg-primary/10"}`}>
          <Icon className={`w-5 h-5 ${alert ? "text-danger" : "text-primary"}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className={`text-xl font-bold ${trendColors[trend]}`}>{value}</p>
          <p className="text-[10px] text-muted-foreground">{unit}</p>
        </div>
      </CardContent>
    </Card>
  );
};
