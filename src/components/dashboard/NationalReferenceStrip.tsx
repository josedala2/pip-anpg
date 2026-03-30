import { nationalCertifiedMetrics } from "@/data/nationalForecast";
import { Verified } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  sub?: string;
}

interface NationalReferenceStripProps {
  metrics: Metric[];
  coverageBOPD?: number;
}

export const NationalReferenceStrip = ({ metrics, coverageBOPD }: NationalReferenceStripProps) => {
  const coveragePct = coverageBOPD
    ? ((coverageBOPD / nationalCertifiedMetrics.productionBOPD) * 100).toFixed(1)
    : null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Verified className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
          Referência Nacional — Relatório 2026
        </span>
        {coveragePct && (
          <span className="ml-auto text-[10px] font-semibold text-muted-foreground">
            Cobertura: <span className="text-primary">{coveragePct}%</span> da produção nacional
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-auto gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, minmax(0, 1fr))` }}>
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            <div className="text-sm font-bold font-mono text-foreground">{m.value}</div>
            {m.sub && <div className="text-[9px] text-muted-foreground">{m.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
