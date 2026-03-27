import { useMemo } from "react";
import { evaluateAlerts, severityLabels, categoryLabels, type Alert } from "@/lib/alertsEngine";
import { oilBlocks } from "@/data/angolaBlocks";
import { AlertTriangle, Shield, TrendingDown, DollarSign, FileText, Leaf } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const categoryIcons: Record<string, React.ElementType> = {
  contract: FileText,
  integrity: Shield,
  decline: TrendingDown,
  opex: DollarSign,
  compliance: Shield,
  esg: Leaf,
};

const severityBadgeClasses: Record<string, string> = {
  critical: "bg-danger/20 text-red-300 border border-red-500/30",
  high: "bg-warning/20 text-amber-300 border border-amber-500/30",
  medium: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
  low: "bg-gray-500/15 text-gray-400 border border-gray-500/25",
};

export const ThreatPanel = ({ maxItems = 8 }: { maxItems?: number }) => {
  const alerts: Alert[] = useMemo(() => evaluateAlerts().slice(0, maxItems), [maxItems]);
  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  return (
    <div className="threat-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Alertas Estratégicos</h3>
        </div>
        {criticalCount > 0 && (
          <span className="text-[10px] font-bold bg-danger/25 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30 animate-pulse-subtle">
            {criticalCount} crítico{criticalCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Alerts List */}
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-1.5">
          {alerts.map((alert) => {
            const Icon = categoryIcons[alert.category] || AlertTriangle;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.07] transition-colors border border-white/[0.06]"
              >
                <Icon className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-white/90 truncate">{alert.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${severityBadgeClasses[alert.severity]}`}>
                      {severityLabels[alert.severity]}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight truncate">{alert.blockName} · {categoryLabels[alert.category]}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5 leading-tight line-clamp-1">{alert.actionRequired}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
