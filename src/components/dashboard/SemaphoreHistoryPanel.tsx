import { useMemo } from "react";
import type { OilBlock } from "@/data/angolaBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SemaphoreLevel = "green" | "yellow" | "red";

const levelStyles: Record<SemaphoreLevel, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-success", text: "text-success", label: "Saudável" },
  yellow: { bg: "bg-warning", text: "text-warning", label: "Atenção" },
  red: { bg: "bg-danger", text: "text-danger", label: "Crítico" },
};

interface MonthStatus {
  month: string;
  overall: SemaphoreLevel;
  criteria: { name: string; level: SemaphoreLevel }[];
}

interface SemaphoreHistoryPanelProps {
  block: OilBlock;
}

export const SemaphoreHistoryPanel = ({ block }: SemaphoreHistoryPanelProps) => {
  const now = new Date();
  const ci = block.contractInfo;

  const history = useMemo<MonthStatus[]>(() => {
    const months: MonthStatus[] = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let offset = 11; offset >= 0; offset--) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const criteria: { name: string; level: SemaphoreLevel }[] = [];

      // 1. Contract expiry
      const contractEnd = ci?.productionPeriodEnd ? new Date(ci.productionPeriodEnd) : null;
      if (contractEnd) {
        const mr = Math.max(0,
          (contractEnd.getFullYear() - d.getFullYear()) * 12 + (contractEnd.getMonth() - d.getMonth())
        );
        criteria.push({
          name: "Prazo",
          level: mr < 12 ? "red" : mr < 36 ? "yellow" : "green",
        });
      }

      // 2. Production decline — use sliding window relative to offset
      const h = block.productionHistory;
      if (h.length >= 4) {
        // Simulate: at month (12 - offset), the "last 3" would shift
        // Since we have 12 months of data, at offset N months ago the last index = h.length - 1 - offset
        const endIdx = Math.max(2, h.length - 1 - offset);
        const startIdx = 0;
        if (endIdx >= 2 && startIdx < endIdx - 1) {
          const first3 = h.slice(startIdx, startIdx + 3).reduce((s, v) => s + v.value, 0) / 3;
          const last3Idx = Math.max(0, endIdx - 2);
          const last3 = h.slice(last3Idx, last3Idx + 3).reduce((s, v) => s + v.value, 0) / Math.min(3, h.length - last3Idx);
          const decline = first3 > 0 ? ((last3 - first3) / first3) * 100 : 0;
          criteria.push({
            name: "Produção",
            level: decline < -25 ? "red" : decline < -15 ? "yellow" : "green",
          });
        }
      }

      // 3. CAPEX deviation — yearly, so same within each year
      const ch = block.capexHistory;
      if (ch.length > 0) {
        // Filter capex entries up to the simulated year
        const relevantCapex = ch.filter(c => parseInt(c.year) <= d.getFullYear());
        if (relevantCapex.length > 0) {
          const tp = relevantCapex.reduce((s, v) => s + v.planned, 0);
          const ta = relevantCapex.reduce((s, v) => s + v.actual, 0);
          const dev = tp > 0 ? ((ta - tp) / tp) * 100 : 0;
          criteria.push({
            name: "CAPEX",
            level: dev < -20 ? "red" : dev < -10 ? "yellow" : "green",
          });
        }
      }

      // 4. Facility age
      const specs = block.facilityData?.platformSpecs;
      if (specs && specs.length > 0) {
        let maxAge = 0;
        for (const s of specs) {
          if (s.installationYear) {
            const age = d.getFullYear() - s.installationYear;
            if (age > maxAge) maxAge = age;
          }
        }
        if (maxAge > 0) {
          criteria.push({
            name: "Instalações",
            level: maxAge > 40 ? "red" : maxAge > 30 ? "yellow" : "green",
          });
        }
      }

      // 5. Execution rate (static — same across all months)
      criteria.push({
        name: "Execução",
        level: block.executionRate < 50 ? "red" : block.executionRate < 70 ? "yellow" : "green",
      });

      // 6. Compliance (static)
      criteria.push({
        name: "Compliance",
        level: block.complianceScore < 70 ? "red" : block.complianceScore < 85 ? "yellow" : "green",
      });

      // 7. OPEX/BO (static — annual value)
      const opex = block.economicVision?.technicalCost?.opex2025 ?? 0;
      criteria.push({
        name: "OPEX",
        level: opex > 35 ? "red" : opex > 25 ? "yellow" : "green",
      });

      // Overall
      const overall: SemaphoreLevel = criteria.some(c => c.level === "red")
        ? "red"
        : criteria.some(c => c.level === "yellow")
          ? "yellow"
          : "green";

      months.push({ month: label, overall, criteria });
    }

    return months;
  }, [block, ci]);

  // Unique criteria names for the heatmap rows
  const criteriaNames = useMemo(() => {
    if (history.length === 0) return [];
    return history[0].criteria.map(c => c.name);
  }, [history]);

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Evolução do Semáforo — Últimos 12 Meses
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <TooltipProvider delayDuration={100}>
          <div className="space-y-3">
            {/* Overall status row */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] 2xl:text-xs text-muted-foreground uppercase tracking-wider w-20 shrink-0 font-semibold">
                Global
              </span>
              <div className="flex gap-1 flex-1">
                {history.map((m, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center flex-1 min-w-0">
                        <div className={`w-full h-6 2xl:h-8 rounded-sm ${levelStyles[m.overall].bg} transition-colors cursor-pointer hover:opacity-80`} />
                        <span className="text-[8px] 2xl:text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                          {m.month.split(" ")[0]}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="font-semibold mb-1">{m.month}</div>
                      <div className={`font-medium ${levelStyles[m.overall].text}`}>
                        Estado: {levelStyles[m.overall].label}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-border/30" />

            {/* Per-criteria rows */}
            {criteriaNames.map(name => (
              <div key={name} className="flex items-center gap-1">
                <span className="text-[10px] 2xl:text-xs text-muted-foreground w-20 shrink-0 truncate" title={name}>
                  {name}
                </span>
                <div className="flex gap-1 flex-1">
                  {history.map((m, i) => {
                    const criterion = m.criteria.find(c => c.name === name);
                    const level = criterion?.level ?? "green";
                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div className="flex-1 min-w-0">
                            <div className={`w-full h-4 2xl:h-5 rounded-sm ${levelStyles[level].bg} opacity-80 transition-colors cursor-pointer hover:opacity-100`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div className="font-semibold">{m.month} — {name}</div>
                          <div className={levelStyles[level].text}>{levelStyles[level].label}</div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-1 justify-end">
              {(["green", "yellow", "red"] as SemaphoreLevel[]).map(level => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${levelStyles[level].bg}`} />
                  <span className="text-[10px] 2xl:text-xs text-muted-foreground">{levelStyles[level].label}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
