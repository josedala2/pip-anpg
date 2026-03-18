import { useMemo } from "react";
import type { OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock, DollarSign, ShieldCheck, Activity, Factory, TrendingDown, Eye,
  ArrowRight, CheckCircle2,
} from "lucide-react";

type SemaphoreLevel = "green" | "yellow" | "red";

interface Prediction {
  criterion: string;
  icon: React.ElementType;
  currentLevel: SemaphoreLevel;
  nextLevel: SemaphoreLevel | null;
  monthsUntilChange: number | null;
  dateEstimate: string | null;
  detail: string;
}

const levelStyles: Record<SemaphoreLevel, { bg: string; text: string; dot: string; border: string }> = {
  green: { bg: "bg-success/10", text: "text-success", dot: "bg-success", border: "border-success/30" },
  yellow: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", border: "border-warning/30" },
  red: { bg: "bg-danger/10", text: "text-danger", dot: "bg-danger", border: "border-danger/30" },
};

const levelLabel: Record<SemaphoreLevel, string> = {
  green: "Verde",
  yellow: "Amarelo",
  red: "Vermelho",
};

const formatDate = (d: Date) => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

interface SemaphoreForecastPanelProps {
  block: OilBlock;
}

export const SemaphoreForecastPanel = ({ block }: SemaphoreForecastPanelProps) => {
  const now = new Date();
  const ci = block.contractInfo;

  const predictions = useMemo<Prediction[]>(() => {
    const list: Prediction[] = [];

    // 1. Contract expiry — deterministic
    const contractEnd = ci?.productionPeriodEnd ? new Date(ci.productionPeriodEnd) : null;
    if (contractEnd) {
      const monthsRemaining = Math.max(0,
        (contractEnd.getFullYear() - now.getFullYear()) * 12 + (contractEnd.getMonth() - now.getMonth())
      );
      const currentLevel: SemaphoreLevel = monthsRemaining < 12 ? "red" : monthsRemaining < 36 ? "yellow" : "green";

      if (currentLevel === "green") {
        const monthsToYellow = monthsRemaining - 36;
        const d = new Date(now);
        d.setMonth(d.getMonth() + monthsToYellow);
        list.push({
          criterion: "Prazo Contratual",
          icon: Clock,
          currentLevel: "green",
          nextLevel: "yellow",
          monthsUntilChange: monthsToYellow,
          dateEstimate: formatDate(d),
          detail: `Entrará em alerta quando restar < 36 meses (${Math.floor(monthsToYellow / 12)}a ${monthsToYellow % 12}m)`,
        });
      } else if (currentLevel === "yellow") {
        const monthsToRed = monthsRemaining - 12;
        const d = new Date(now);
        d.setMonth(d.getMonth() + monthsToRed);
        list.push({
          criterion: "Prazo Contratual",
          icon: Clock,
          currentLevel: "yellow",
          nextLevel: "red",
          monthsUntilChange: monthsToRed,
          dateEstimate: formatDate(d),
          detail: `Passará a crítico quando restar < 12 meses (${Math.floor(monthsToRed / 12)}a ${monthsToRed % 12}m)`,
        });
      } else {
        list.push({
          criterion: "Prazo Contratual",
          icon: Clock,
          currentLevel: "red",
          nextLevel: null,
          monthsUntilChange: null,
          dateEstimate: null,
          detail: "Já em estado crítico — contrato próximo do vencimento",
        });
      }
    }

    // 2. Production decline — extrapolate monthly rate
    const h = block.productionHistory;
    if (h.length >= 6) {
      const first3 = h.slice(0, 3).reduce((s, v) => s + v.value, 0) / 3;
      const last3 = h.slice(-3).reduce((s, v) => s + v.value, 0) / 3;
      const currentDecline = first3 > 0 ? ((last3 - first3) / first3) * 100 : 0;
      // Monthly decline rate (over the span of the history)
      const spanMonths = h.length;
      const monthlyRate = spanMonths > 0 && first3 > 0 ? ((last3 / first3) ** (1 / spanMonths) - 1) : 0;

      const currentLevel: SemaphoreLevel = currentDecline < -25 ? "red" : currentDecline < -15 ? "yellow" : "green";

      if (currentLevel === "green" && monthlyRate < 0) {
        // Project when cumulative decline reaches -15%
        // (1 + monthlyRate)^n = 0.85
        const n = Math.log(0.85) / Math.log(1 + monthlyRate);
        const monthsToYellow = Math.max(0, Math.ceil(n - spanMonths));
        if (monthsToYellow < 120) {
          const d = new Date(now);
          d.setMonth(d.getMonth() + monthsToYellow);
          list.push({
            criterion: "Declínio Produção",
            icon: Activity,
            currentLevel: "green",
            nextLevel: "yellow",
            monthsUntilChange: monthsToYellow,
            dateEstimate: formatDate(d),
            detail: `Taxa mensal: ${(monthlyRate * 100).toFixed(2)}% — atingirá -15% em ~${Math.floor(monthsToYellow / 12)}a ${monthsToYellow % 12}m`,
          });
        } else {
          list.push({
            criterion: "Declínio Produção",
            icon: Activity,
            currentLevel: "green",
            nextLevel: null,
            monthsUntilChange: null,
            dateEstimate: null,
            detail: `Declínio estável (${currentDecline.toFixed(1)}%) — sem mudança prevista a médio prazo`,
          });
        }
      } else if (currentLevel === "yellow" && monthlyRate < 0) {
        const n = Math.log(0.75) / Math.log(1 + monthlyRate);
        const monthsToRed = Math.max(0, Math.ceil(n - spanMonths));
        const d = new Date(now);
        d.setMonth(d.getMonth() + monthsToRed);
        list.push({
          criterion: "Declínio Produção",
          icon: Activity,
          currentLevel: "yellow",
          nextLevel: "red",
          monthsUntilChange: monthsToRed,
          dateEstimate: formatDate(d),
          detail: `Declínio acelerado — atingirá -25% em ~${Math.floor(monthsToRed / 12)}a ${monthsToRed % 12}m`,
        });
      } else {
        list.push({
          criterion: "Declínio Produção",
          icon: Activity,
          currentLevel,
          nextLevel: null,
          monthsUntilChange: null,
          dateEstimate: null,
          detail: currentLevel === "red"
            ? "Já em estado crítico — declínio acentuado"
            : "Produção estável — sem alerta previsto",
        });
      }
    }

    // 3. CAPEX deviation — extrapolate year-over-year trend
    const ch = block.capexHistory;
    if (ch.length >= 2) {
      const totalPlanned = ch.reduce((s, v) => s + v.planned, 0);
      const totalActual = ch.reduce((s, v) => s + v.actual, 0);
      const currentDev = totalPlanned > 0 ? ((totalActual - totalPlanned) / totalPlanned) * 100 : 0;

      // Year-over-year deviation trend
      const yearlyDevs = ch.map(c => c.planned > 0 ? ((c.actual - c.planned) / c.planned) * 100 : 0);
      const lastDev = yearlyDevs[yearlyDevs.length - 1];
      const prevDev = yearlyDevs[yearlyDevs.length - 2];
      const devTrend = lastDev - prevDev; // worsening if more negative

      const currentLevel: SemaphoreLevel = currentDev < -20 ? "red" : currentDev < -10 ? "yellow" : "green";

      if (currentLevel === "green" && devTrend < 0) {
        // Estimate when cumulative deviation crosses -10%
        const gap = -10 - currentDev;
        const yearsToYellow = Math.ceil(Math.abs(gap / devTrend));
        if (yearsToYellow <= 10) {
          const d = new Date(now);
          d.setFullYear(d.getFullYear() + yearsToYellow);
          list.push({
            criterion: "Tendência CAPEX",
            icon: DollarSign,
            currentLevel: "green",
            nextLevel: "yellow",
            monthsUntilChange: yearsToYellow * 12,
            dateEstimate: formatDate(d),
            detail: `Desvio a agravar-se ${devTrend.toFixed(1)}pp/ano — alerta em ~${yearsToYellow}a`,
          });
        } else {
          list.push({
            criterion: "Tendência CAPEX",
            icon: DollarSign,
            currentLevel: "green",
            nextLevel: null,
            monthsUntilChange: null,
            dateEstimate: null,
            detail: `Desvio actual: ${currentDev.toFixed(1)}% — sem mudança prevista a médio prazo`,
          });
        }
      } else if (currentLevel === "yellow" && devTrend < 0) {
        const gap = -20 - currentDev;
        const yearsToRed = Math.ceil(Math.abs(gap / devTrend));
        const d = new Date(now);
        d.setFullYear(d.getFullYear() + yearsToRed);
        list.push({
          criterion: "Tendência CAPEX",
          icon: DollarSign,
          currentLevel: "yellow",
          nextLevel: "red",
          monthsUntilChange: yearsToRed * 12,
          dateEstimate: formatDate(d),
          detail: `Desvio CAPEX a agravar-se — passará a crítico em ~${yearsToRed}a`,
        });
      } else {
        list.push({
          criterion: "Tendência CAPEX",
          icon: DollarSign,
          currentLevel,
          nextLevel: null,
          monthsUntilChange: null,
          dateEstimate: null,
          detail: currentLevel === "red"
            ? "Já em estado crítico — CAPEX muito abaixo do planeado"
            : "Tendência CAPEX estável — sem alerta previsto",
        });
      }
    }

    // 4. Facility age — deterministic (+1 year per year)
    const specs = block.facilityData?.platformSpecs;
    if (specs && specs.length > 0) {
      const currentYear = now.getFullYear();
      let oldest = { name: "", age: 0 };
      for (const s of specs) {
        if (s.installationYear) {
          const age = currentYear - s.installationYear;
          if (age > oldest.age) oldest = { name: s.name, age };
        }
      }
      if (oldest.age > 0) {
        const currentLevel: SemaphoreLevel = oldest.age > 40 ? "red" : oldest.age > 30 ? "yellow" : "green";

        if (currentLevel === "green") {
          const yearsToYellow = 30 - oldest.age;
          list.push({
            criterion: "Idade Instalações",
            icon: Factory,
            currentLevel: "green",
            nextLevel: "yellow",
            monthsUntilChange: yearsToYellow * 12,
            dateEstimate: `${currentYear + yearsToYellow}`,
            detail: `${oldest.name} terá 30 anos em ${currentYear + yearsToYellow}`,
          });
        } else if (currentLevel === "yellow") {
          const yearsToRed = 40 - oldest.age;
          list.push({
            criterion: "Idade Instalações",
            icon: Factory,
            currentLevel: "yellow",
            nextLevel: "red",
            monthsUntilChange: yearsToRed * 12,
            dateEstimate: `${currentYear + yearsToRed}`,
            detail: `${oldest.name} terá 40 anos em ${currentYear + yearsToRed}`,
          });
        } else {
          list.push({
            criterion: "Idade Instalações",
            icon: Factory,
            currentLevel: "red",
            nextLevel: null,
            monthsUntilChange: null,
            dateEstimate: null,
            detail: `${oldest.name} já tem ${oldest.age} anos — estado crítico`,
          });
        }
      }
    }

    // 5. Execution rate — static, no trend projection
    {
      const currentLevel: SemaphoreLevel = block.executionRate < 50 ? "red" : block.executionRate < 70 ? "yellow" : "green";
      list.push({
        criterion: "Taxa Execução",
        icon: TrendingDown,
        currentLevel,
        nextLevel: null,
        monthsUntilChange: null,
        dateEstimate: null,
        detail: currentLevel === "green"
          ? `Execução a ${block.executionRate}% — sem risco identificado`
          : currentLevel === "yellow"
            ? `Execução a ${block.executionRate}% — necessita acompanhamento`
            : `Execução a ${block.executionRate}% — intervenção urgente necessária`,
      });
    }

    // 6. Compliance — static
    {
      const currentLevel: SemaphoreLevel = block.complianceScore < 70 ? "red" : block.complianceScore < 85 ? "yellow" : "green";
      list.push({
        criterion: "Compliance",
        icon: ShieldCheck,
        currentLevel,
        nextLevel: null,
        monthsUntilChange: null,
        dateEstimate: null,
        detail: currentLevel === "green"
          ? `Score ${block.complianceScore}% — dentro dos limites`
          : currentLevel === "yellow"
            ? `Score ${block.complianceScore}% — monitorizar de perto`
            : `Score ${block.complianceScore}% — acção correctiva necessária`,
      });
    }

    // Sort: items with upcoming changes first
    list.sort((a, b) => {
      if (a.monthsUntilChange !== null && b.monthsUntilChange !== null)
        return a.monthsUntilChange - b.monthsUntilChange;
      if (a.monthsUntilChange !== null) return -1;
      if (b.monthsUntilChange !== null) return 1;
      return 0;
    });

    return list;
  }, [block, ci]);

  // Overall forecast: soonest transition
  const soonest = predictions.find(p => p.nextLevel !== null && p.monthsUntilChange !== null);

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Previsão de Mudança do Semáforo
          {soonest && (
            <span className={`ml-auto text-xs font-normal ${levelStyles[soonest.nextLevel!].text}`}>
              Próxima mudança: {soonest.dateEstimate}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {predictions.map((pred, i) => {
            const currentStyle = levelStyles[pred.currentLevel];
            const nextStyle = pred.nextLevel ? levelStyles[pred.nextLevel] : null;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border ${currentStyle.border} ${currentStyle.bg}`}
              >
                {/* Icon */}
                <pred.icon className={`w-4 h-4 ${currentStyle.text} shrink-0`} />

                {/* Criterion name */}
                <div className="min-w-[120px]">
                  <span className="text-sm font-semibold text-foreground">{pred.criterion}</span>
                </div>

                {/* Current → Next level */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${currentStyle.dot}`} />
                  <span className={`text-xs font-medium ${currentStyle.text}`}>{levelLabel[pred.currentLevel]}</span>
                  {pred.nextLevel && nextStyle && (
                    <>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <div className={`w-2.5 h-2.5 rounded-full ${nextStyle.dot}`} />
                      <span className={`text-xs font-medium ${nextStyle.text}`}>{levelLabel[pred.nextLevel]}</span>
                    </>
                  )}
                </div>

                {/* Date estimate */}
                <div className="ml-auto text-right shrink-0">
                  {pred.dateEstimate ? (
                    <span className={`text-xs font-mono font-bold ${nextStyle?.text ?? currentStyle.text}`}>
                      {pred.dateEstimate}
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  )}
                </div>

                {/* Detail tooltip — visible on wider screens */}
                <span className="hidden xl:inline text-[10px] text-muted-foreground max-w-[250px] truncate" title={pred.detail}>
                  {pred.detail}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
