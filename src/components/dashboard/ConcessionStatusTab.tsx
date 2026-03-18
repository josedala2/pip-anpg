import { useMemo } from "react";
import type { OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, CheckCircle2, Clock, DollarSign, TrendingDown,
  ShieldCheck, Landmark, Scale, Calendar, Droplets, Activity, Factory, Gauge,
} from "lucide-react";
import { SemaphoreForecastPanel } from "./SemaphoreForecastPanel";
import { SemaphoreHistoryPanel } from "./SemaphoreHistoryPanel";
import { SemaphoreTimelineChart } from "./SemaphoreTimelineChart";

interface ConcessionStatusTabProps {
  block: OilBlock;
}

type SemaphoreLevel = "green" | "yellow" | "red";

interface Alert {
  severity: SemaphoreLevel;
  message: string;
  icon: React.ElementType;
}

const semaphoreStyles: Record<SemaphoreLevel, { bg: string; text: string; border: string; dot: string }> = {
  green: { bg: "bg-success/10", text: "text-success", border: "border-success/30", dot: "bg-success" },
  yellow: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30", dot: "bg-warning" },
  red: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/30", dot: "bg-danger" },
};

const semaphoreLabel: Record<SemaphoreLevel, string> = {
  green: "Saudável",
  yellow: "Atenção",
  red: "Crítico",
};

export const ConcessionStatusTab = ({ block }: ConcessionStatusTabProps) => {
  const ci = block.contractInfo;
  const now = new Date();

  const contractEnd = ci?.productionPeriodEnd ? new Date(ci.productionPeriodEnd) : null;
  const contractStart = ci?.signingDate ? new Date(ci.signingDate) : new Date(block.contractDate);
  const prodStart = ci?.productionPeriodStart ? new Date(ci.productionPeriodStart) : null;

  // Time remaining
  const monthsRemaining = contractEnd
    ? Math.max(0, (contractEnd.getFullYear() - now.getFullYear()) * 12 + (contractEnd.getMonth() - now.getMonth()))
    : null;
  const yearsRemaining = monthsRemaining !== null ? Math.floor(monthsRemaining / 12) : null;
  const monthsRemainder = monthsRemaining !== null ? monthsRemaining % 12 : null;

  // Timeline progress
  const timelineProgress = useMemo(() => {
    if (!contractEnd) return null;
    const total = contractEnd.getTime() - contractStart.getTime();
    const elapsed = now.getTime() - contractStart.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [contractStart, contractEnd]);

  // Production decline (refined: avg last 3 vs avg first 3)
  const prodDecline = useMemo(() => {
    const h = block.productionHistory;
    if (h.length < 4) return null;
    const first3 = h.slice(0, 3).reduce((s, v) => s + v.value, 0) / 3;
    const last3 = h.slice(-3).reduce((s, v) => s + v.value, 0) / 3;
    if (first3 === 0) return null;
    return ((last3 - first3) / first3) * 100;
  }, [block.productionHistory]);

  // CAPEX deviation (avg actual vs planned)
  const capexDeviation = useMemo(() => {
    const ch = block.capexHistory;
    if (!ch || ch.length === 0) return null;
    const totalPlanned = ch.reduce((s, v) => s + v.planned, 0);
    if (totalPlanned === 0) return null;
    const totalActual = ch.reduce((s, v) => s + v.actual, 0);
    return ((totalActual - totalPlanned) / totalPlanned) * 100;
  }, [block.capexHistory]);

  // Facility age (oldest installation)
  const oldestFacility = useMemo(() => {
    const specs = block.facilityData?.platformSpecs;
    if (!specs || specs.length === 0) return null;
    const currentYear = now.getFullYear();
    let oldest: { name: string; age: number } | null = null;
    for (const s of specs) {
      if (s.installationYear) {
        const age = currentYear - s.installationYear;
        if (!oldest || age > oldest.age) {
          oldest = { name: s.name, age };
        }
      }
    }
    return oldest;
  }, [block.facilityData?.platformSpecs]);

  // Alerts (7 criteria)
  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = [];

    // 1. Contract expiry
    if (monthsRemaining !== null && monthsRemaining < 36) {
      list.push({
        severity: monthsRemaining < 12 ? "red" : "yellow",
        message: `Contrato expira em ${yearsRemaining}a ${monthsRemainder}m`,
        icon: Clock,
      });
    }
    // 2. Execution rate
    if (block.executionRate < 70) {
      list.push({
        severity: block.executionRate < 50 ? "red" : "yellow",
        message: `Taxa de execução baixa: ${block.executionRate}%`,
        icon: TrendingDown,
      });
    }
    // 3. Compliance
    if (block.complianceScore < 85) {
      list.push({
        severity: block.complianceScore < 70 ? "red" : "yellow",
        message: `Compliance abaixo do limiar: ${block.complianceScore}%`,
        icon: ShieldCheck,
      });
    }
    // 4. Production decline (refined)
    if (prodDecline !== null && prodDecline < -15) {
      list.push({
        severity: prodDecline < -25 ? "red" : "yellow",
        message: `Produção em declínio: ${prodDecline.toFixed(1)}%`,
        icon: Activity,
      });
    }
    // 5. CAPEX deviation
    if (capexDeviation !== null && capexDeviation < -10) {
      list.push({
        severity: capexDeviation < -20 ? "red" : "yellow",
        message: `CAPEX abaixo do planeado: ${capexDeviation.toFixed(1)}%`,
        icon: DollarSign,
      });
    }
    // 6. Facility age
    if (oldestFacility && oldestFacility.age > 30) {
      list.push({
        severity: oldestFacility.age > 40 ? "red" : "yellow",
        message: `Instalação mais antiga: ${oldestFacility.name} (${oldestFacility.age}a)`,
        icon: Factory,
      });
    }

    if (list.length === 0) {
      list.push({ severity: "green", message: "Sem alertas — concessão em bom estado", icon: CheckCircle2 });
    }
    return list;
  }, [monthsRemaining, block.executionRate, block.complianceScore, prodDecline, capexDeviation, oldestFacility]);

  // Overall semaphore
  const overallStatus = useMemo<SemaphoreLevel>(() => {
    if (alerts.some(a => a.severity === "red")) return "red";
    if (alerts.some(a => a.severity === "yellow")) return "yellow";
    return "green";
  }, [alerts]);

  const sStyle = semaphoreStyles[overallStatus];

  // Fiscal conditions
  const fc = ci?.fiscalConditions;

  // KPI data
  const kpiCards = [
    {
      label: "Tempo Restante",
      value: yearsRemaining !== null ? `${yearsRemaining}a ${monthsRemainder}m` : "N/D",
      icon: Clock,
      color: monthsRemaining !== null && monthsRemaining < 36 ? "text-danger" : "text-primary",
    },
    {
      label: "Investimento Executado",
      value: `${block.executionRate}%`,
      sub: `$${block.accumulatedInvestment.toLocaleString()}M / $${block.plannedInvestment.toLocaleString()}M`,
      icon: DollarSign,
      color: block.executionRate >= 80 ? "text-success" : block.executionRate >= 60 ? "text-warning" : "text-danger",
    },
    {
      label: "Reservas Estimadas",
      value: `${block.estimatedReserves} Mb`,
      icon: Droplets,
      color: "text-primary",
    },
    {
      label: "Compliance",
      value: `${block.complianceScore}%`,
      icon: ShieldCheck,
      color: block.complianceScore >= 90 ? "text-success" : block.complianceScore >= 70 ? "text-warning" : "text-danger",
    },
    {
      label: "Declínio Produção",
      value: prodDecline !== null ? `${prodDecline.toFixed(1)}%` : "N/D",
      icon: Gauge,
      color: prodDecline === null ? "text-muted-foreground"
        : prodDecline < -25 ? "text-danger"
        : prodDecline < -15 ? "text-warning"
        : "text-success",
    },
    {
      label: "Idade Máx. Instalação",
      value: oldestFacility ? `${oldestFacility.age}a` : "N/D",
      sub: oldestFacility?.name,
      icon: Factory,
      color: !oldestFacility ? "text-muted-foreground"
        : oldestFacility.age > 40 ? "text-danger"
        : oldestFacility.age > 30 ? "text-warning"
        : "text-success",
    },
  ];

  return (
    <div className="space-y-4 2xl:space-y-6">
      {/* Row 1: Semaphore + KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 2xl:gap-5">
        {/* Semaphore Card */}
        <Card className={`glass-card border-2 ${sStyle.border} md:col-span-1`}>
          <CardContent className="p-4 2xl:p-6 flex flex-col items-center justify-center text-center h-full gap-2">
            <div className={`w-16 h-16 2xl:w-20 2xl:h-20 rounded-full ${sStyle.bg} flex items-center justify-center`}>
              <div className={`w-8 h-8 2xl:w-10 2xl:h-10 rounded-full ${sStyle.dot} animate-pulse`} />
            </div>
            <span className={`text-lg 2xl:text-xl font-bold ${sStyle.text}`}>{semaphoreLabel[overallStatus]}</span>
            <span className="text-[10px] 2xl:text-xs text-muted-foreground uppercase tracking-wider">Estado da Concessão</span>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {kpiCards.map(kpi => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="p-4 2xl:p-6">
              <div className="flex items-center gap-2 mb-1.5">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-[10px] 2xl:text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div className={`text-2xl 2xl:text-3xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
              {"sub" in kpi && kpi.sub && <div className="text-[10px] 2xl:text-xs text-muted-foreground mt-1">{kpi.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Timeline */}
      {contractEnd && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Timeline da Concessão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="relative">
              <div className="h-3 2xl:h-4 bg-secondary rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                  style={{ width: `${timelineProgress ?? 0}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground"
                  style={{ left: `${timelineProgress ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] 2xl:text-xs text-muted-foreground">
                <div className="text-left">
                  <div className="font-semibold text-foreground">Assinatura</div>
                  <div>{contractStart.getFullYear()}</div>
                </div>
                {prodStart && (
                  <div className="text-center">
                    <div className="font-semibold text-foreground">Início Produção</div>
                    <div>{prodStart.getFullYear()}</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-foreground">Hoje</div>
                  <div>{now.getFullYear()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">Fim do Contrato</div>
                  <div>{contractEnd.getFullYear()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 3: Alerts + Contract Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-6">
        {/* Alerts */}
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Alertas & Acções ({alerts.length} critérios)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {alerts.map((alert, i) => {
              const as = semaphoreStyles[alert.severity];
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${as.bg} border ${as.border}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${as.dot} shrink-0`} />
                  <alert.icon className={`w-4 h-4 ${as.text} shrink-0`} />
                  <span className={`text-sm ${as.text} font-medium`}>{alert.message}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Contract Summary */}
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
              <Landmark className="w-4 h-4 text-warning" />
              Resumo Contratual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 text-sm">
              {[
                ci?.contractType && ["Tipo de Contrato", ci.contractType],
                ci?.decretoLei && ["Decreto-Lei", ci.decretoLei],
                ci?.signingDate && ["Data de Assinatura", new Date(ci.signingDate).toLocaleDateString("pt-AO")],
                ci?.productionPeriodStart && ci?.productionPeriodEnd && [
                  "Período de Produção",
                  `${new Date(ci.productionPeriodStart).getFullYear()} — ${new Date(ci.productionPeriodEnd).getFullYear()}`,
                ],
                ci?.signatureBonus && ["Bónus de Assinatura", `$${ci.signatureBonus.toLocaleString()}M`],
                ci?.socialBonus && ["Bónus Social", `$${ci.socialBonus.toLocaleString()}M`],
                block.phase && ["Fase Actual", block.phase],
                block.operator && ["Operador", block.operator],
              ]
                .filter(Boolean)
                .map((item) => {
                  const [label, value] = item as [string, string];
                  return (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right">{value}</span>
                    </div>
                  );
                })}
              {!ci && (
                <p className="text-muted-foreground text-xs py-4 text-center">Informação contratual não disponível para este bloco.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3b: Semaphore Forecast */}
      <SemaphoreForecastPanel block={block} />

      {/* Row 3c: Semaphore History */}
      <SemaphoreHistoryPanel block={block} />

      {/* Row 3d: Semaphore Timeline Projection (5 years) */}
      <SemaphoreTimelineChart block={block} />

      {/* Row 4: Fiscal Conditions */}
      {fc && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Condições Fiscais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                fc.costRecoveryPreProd != null && { label: "Cost Recovery (Pré-Prod)", value: `${fc.costRecoveryPreProd}%` },
                fc.costRecoveryPostProd != null && { label: "Cost Recovery (Pós-Prod)", value: `${fc.costRecoveryPostProd}%` },
                fc.irp != null && { label: "IRP", value: `${fc.irp}%` },
                fc.ipp != null && { label: "IPP", value: `${fc.ipp}%` },
                fc.itp != null && { label: "ITP", value: `${fc.itp}%` },
                fc.productionPremium != null && { label: "Prémio de Produção", value: `$${fc.productionPremium}/bbl` },
              ]
                .filter(Boolean)
                .map((item) => {
                  const { label, value } = item as { label: string; value: string };
                  return (
                    <div key={label} className="glass-card p-3 2xl:p-4 rounded-lg">
                      <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
                      <div className="text-base 2xl:text-lg font-bold font-mono">{value}</div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 5: Execution progress bar */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-warning" />
            Progresso de Investimento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Acumulado: ${block.accumulatedInvestment.toLocaleString()}M</span>
              <span>Planeado: ${block.plannedInvestment.toLocaleString()}M</span>
            </div>
            <Progress value={block.executionRate} className="h-3" />
            <div className="text-right text-xs font-mono font-semibold">{block.executionRate}%</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
