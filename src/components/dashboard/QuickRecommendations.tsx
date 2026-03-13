import { useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import { calculateAllScores, classificationConfig, urgencyConfig, type StrategicScore } from "@/lib/strategicScoring";
import { Target, Clock, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const classificationIcons: Record<string, React.ElementType> = {
  "Revitalizar": Zap,
  "Renegociar": AlertTriangle,
  "Preparar Abandono": AlertTriangle,
  "Relicitar": Target,
  "Manter & Optimizar": Target,
  "Monitorar": Clock,
};

export const QuickRecommendations = ({ maxItems = 5 }: { maxItems?: number }) => {
  const top: StrategicScore[] = useMemo(() => {
    const all = calculateAllScores(oilBlocks);
    return all.filter(s => s.urgency === "Imediata" || s.urgency === "Elevada").slice(0, maxItems);
  }, [maxItems]);

  if (top.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Recomendações para o Conselho</h3>
        <span className="text-[10px] text-muted-foreground font-medium ml-auto">Top {top.length} acções prioritárias</span>
      </div>
      <div className="space-y-2">
        {top.map((item, i) => {
          const Icon = classificationIcons[item.classification] || Target;
          const cfg = classificationConfig[item.classification];
          const urg = urgencyConfig[item.urgency];
          return (
            <div
              key={item.blockId}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/60 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{item.blockName}</span>
                  <span className="text-[10px] text-muted-foreground">{item.operator}</span>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${cfg.bgColor} ${cfg.color} border`}>
                    {item.classification}
                  </Badge>
                  <span className={`text-[9px] font-bold ${urg.color}`}>{item.urgency}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{item.recommendation}</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="text-[9px]">
                    <span className="text-muted-foreground">Impacto: </span>
                    <span className="text-foreground font-medium">{item.expectedImpact.slice(0, 60)}…</span>
                  </div>
                  <div className="text-[9px]">
                    <span className="text-muted-foreground">Risco inação: </span>
                    <span className="text-danger font-medium">{item.riskOfInaction.slice(0, 50)}…</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-lg font-bold font-mono text-foreground">{item.totalScore}</span>
                <span className="text-[9px] text-muted-foreground block">/100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
