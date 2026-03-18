import { useMemo } from "react";
import type { OilBlock } from "@/data/angolaBlocks";
import { ChartWrapper } from "./ChartWrapper";
import { TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SemaphoreLevel = "green" | "yellow" | "red";

const levelColors: Record<SemaphoreLevel, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-success", text: "text-success", label: "Saudável" },
  yellow: { bg: "bg-warning", text: "text-warning", label: "Atenção" },
  red: { bg: "bg-danger", text: "text-danger", label: "Crítico" },
};

interface QuarterData {
  label: string; // e.g. "Q1 2026"
  year: number;
  quarter: number;
  criteria: Record<string, SemaphoreLevel>;
  overall: SemaphoreLevel;
}

interface SemaphoreTimelineChartProps {
  block: OilBlock;
}

export const SemaphoreTimelineChart = ({ block }: SemaphoreTimelineChartProps) => {
  const now = new Date();
  const ci = block.contractInfo;

  // Pre-compute trend rates once
  const monthlyProdRate = useMemo(() => {
    const h = block.productionHistory;
    if (h.length < 4) return 0;
    const first3 = h.slice(0, 3).reduce((s, v) => s + v.value, 0) / 3;
    const last3 = h.slice(-3).reduce((s, v) => s + v.value, 0) / 3;
    if (first3 === 0) return 0;
    return (last3 / first3) ** (1 / h.length) - 1;
  }, [block.productionHistory]);

  const capexYearlyTrend = useMemo(() => {
    const ch = block.capexHistory;
    if (ch.length < 2) return 0;
    const devs = ch.map(c => c.planned > 0 ? ((c.actual - c.planned) / c.planned) * 100 : 0);
    return devs[devs.length - 1] - devs[devs.length - 2];
  }, [block.capexHistory]);

  const currentCapexDev = useMemo(() => {
    const ch = block.capexHistory;
    if (ch.length === 0) return 0;
    const tp = ch.reduce((s, v) => s + v.planned, 0);
    const ta = ch.reduce((s, v) => s + v.actual, 0);
    return tp > 0 ? ((ta - tp) / tp) * 100 : 0;
  }, [block.capexHistory]);

  const currentProdDecline = useMemo(() => {
    const h = block.productionHistory;
    if (h.length < 4) return 0;
    const first3 = h.slice(0, 3).reduce((s, v) => s + v.value, 0) / 3;
    const last3 = h.slice(-3).reduce((s, v) => s + v.value, 0) / 3;
    return first3 > 0 ? ((last3 - first3) / first3) * 100 : 0;
  }, [block.productionHistory]);

  const oldestAge = useMemo(() => {
    const specs = block.facilityData?.platformSpecs;
    if (!specs) return 0;
    let max = 0;
    for (const s of specs) {
      if (s.installationYear) {
        const age = now.getFullYear() - s.installationYear;
        if (age > max) max = age;
      }
    }
    return max;
  }, [block.facilityData?.platformSpecs]);

  const quarters = useMemo<QuarterData[]>(() => {
    const result: QuarterData[] = [];
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const currentYear = now.getFullYear();
    const contractEnd = ci?.productionPeriodEnd ? new Date(ci.productionPeriodEnd) : null;

    for (let qi = 0; qi < 20; qi++) {
      const q = (currentQuarter + qi) % 4;
      const y = currentYear + Math.floor((currentQuarter + qi) / 4);
      const label = `Q${q + 1} ${y}`;
      const monthsFromNow = qi * 3;
      const criteria: Record<string, SemaphoreLevel> = {};

      // 1. Contract expiry
      if (contractEnd) {
        const mr = Math.max(0,
          (contractEnd.getFullYear() - y) * 12 + (contractEnd.getMonth() - (q * 3 + 1))
        );
        criteria["Prazo"] = mr < 12 ? "red" : mr < 36 ? "yellow" : "green";
      }

      // 2. Production decline — extrapolate monthly compound rate
      if (block.productionHistory.length >= 4 && monthlyProdRate < 0) {
        const totalMonths = block.productionHistory.length + monthsFromNow;
        const projectedDecline = ((1 + monthlyProdRate) ** totalMonths - 1) * 100;
        criteria["Produção"] = projectedDecline < -25 ? "red" : projectedDecline < -15 ? "yellow" : "green";
      } else {
        criteria["Produção"] = currentProdDecline < -25 ? "red" : currentProdDecline < -15 ? "yellow" : "green";
      }

      // 3. CAPEX — extrapolate yearly trend
      if (block.capexHistory.length >= 2 && capexYearlyTrend < 0) {
        const yearsFromNow = monthsFromNow / 12;
        const projectedDev = currentCapexDev + capexYearlyTrend * yearsFromNow;
        criteria["CAPEX"] = projectedDev < -20 ? "red" : projectedDev < -10 ? "yellow" : "green";
      } else {
        criteria["CAPEX"] = currentCapexDev < -20 ? "red" : currentCapexDev < -10 ? "yellow" : "green";
      }

      // 4. Facility age — deterministic
      const projectedAge = oldestAge + Math.floor(monthsFromNow / 12);
      criteria["Instalações"] = projectedAge > 40 ? "red" : projectedAge > 30 ? "yellow" : "green";

      // 5. Execution rate (static)
      criteria["Execução"] = block.executionRate < 50 ? "red" : block.executionRate < 70 ? "yellow" : "green";

      // 6. Compliance (static)
      criteria["Compliance"] = block.complianceScore < 70 ? "red" : block.complianceScore < 85 ? "yellow" : "green";

      // Overall
      const levels = Object.values(criteria);
      const overall: SemaphoreLevel = levels.includes("red") ? "red" : levels.includes("yellow") ? "yellow" : "green";

      result.push({ label, year: y, quarter: q, criteria, overall });
    }

    return result;
  }, [block, ci, monthlyProdRate, capexYearlyTrend, currentCapexDev, currentProdDecline, oldestAge]);

  const criteriaNames = ["Prazo", "Produção", "CAPEX", "Instalações", "Execução", "Compliance"];

  // Detect transition points for annotations
  const transitions = useMemo(() => {
    const result: { quarterIdx: number; criterion: string; from: SemaphoreLevel; to: SemaphoreLevel }[] = [];
    for (let i = 1; i < quarters.length; i++) {
      for (const name of criteriaNames) {
        const prev = quarters[i - 1].criteria[name];
        const curr = quarters[i].criteria[name];
        if (prev && curr && prev !== curr) {
          result.push({ quarterIdx: i, criterion: name, from: prev, to: curr });
        }
      }
    }
    return result;
  }, [quarters]);

  return (
    <ChartWrapper
      title="Projecção do Semáforo — Próximos 5 Anos"
      icon={<TrendingUp className="w-4 h-4 text-primary" />}
      height="auto"
      headerExtra={
        <span className="text-[10px] text-muted-foreground">
          {transitions.length} transições previstas
        </span>
      }
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 py-2">
          {/* Year markers */}
          <div className="flex items-center gap-0.5 pl-20">
            {quarters.map((q, i) => {
              const isYearStart = q.quarter === 0 || i === 0;
              return (
                <div key={i} className="flex-1 min-w-0 text-center">
                  {isYearStart && (
                    <span className="text-[9px] 2xl:text-[10px] font-semibold text-foreground">
                      {q.year}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall row */}
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] 2xl:text-xs text-muted-foreground uppercase tracking-wider w-20 shrink-0 font-semibold">
              Global
            </span>
            {quarters.map((q, i) => {
              const hasTransition = transitions.some(t => t.quarterIdx === i);
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="flex-1 min-w-0 relative">
                      <div
                        className={`w-full h-7 2xl:h-8 rounded-sm ${levelColors[q.overall].bg} transition-colors cursor-pointer hover:opacity-80 ${
                          i === 0 ? "ring-2 ring-foreground/20" : ""
                        }`}
                      />
                      {hasTransition && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-foreground" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    <div className="font-semibold">{q.label}</div>
                    <div className={levelColors[q.overall].text}>
                      Estado: {levelColors[q.overall].label}
                    </div>
                    {transitions
                      .filter(t => t.quarterIdx === i)
                      .map((t, ti) => (
                        <div key={ti} className="mt-1 text-[10px]">
                          ⚡ {t.criterion}: {levelColors[t.from].label} → {levelColors[t.to].label}
                        </div>
                      ))}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Quarter labels */}
          <div className="flex items-center gap-0.5 pl-20">
            {quarters.map((q, i) => (
              <div key={i} className="flex-1 min-w-0 text-center">
                <span className="text-[8px] 2xl:text-[9px] text-muted-foreground">
                  Q{q.quarter + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-border/30" />

          {/* Per-criteria rows */}
          {criteriaNames.map(name => (
            <div key={name} className="flex items-center gap-0.5">
              <span className="text-[10px] 2xl:text-xs text-muted-foreground w-20 shrink-0 truncate" title={name}>
                {name}
              </span>
              {quarters.map((q, i) => {
                const level = q.criteria[name] ?? "green";
                const transition = transitions.find(t => t.quarterIdx === i && t.criterion === name);
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div className="flex-1 min-w-0 relative">
                        <div
                          className={`w-full h-4 2xl:h-5 rounded-sm ${levelColors[level].bg} opacity-80 transition-colors cursor-pointer hover:opacity-100 ${
                            i === 0 ? "ring-1 ring-foreground/15" : ""
                          }`}
                        />
                        {transition && (
                          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-foreground" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="font-semibold">{q.label} — {name}</div>
                      <div className={levelColors[level].text}>{levelColors[level].label}</div>
                      {transition && (
                        <div className="mt-1 text-[10px]">
                          ⚡ Mudança: {levelColors[transition.from].label} → {levelColors[transition.to].label}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend + transition summary */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              {(["green", "yellow", "red"] as SemaphoreLevel[]).map(level => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${levelColors[level].bg}`} />
                  <span className="text-[10px] 2xl:text-xs text-muted-foreground">{levelColors[level].label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-foreground" />
                <span className="text-[10px] text-muted-foreground">Transição</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-4 rounded-sm bg-muted ring-1 ring-foreground/15" />
                <span className="text-[10px] text-muted-foreground">Hoje</span>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ChartWrapper>
  );
};
