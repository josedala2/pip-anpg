import { useMemo, useState, useCallback } from "react";
import { ConcessionMap } from "./ConcessionMap";
import { KPICards } from "./KPICards";
import { ThreatPanel } from "./ThreatPanel";
import { TrendProjection } from "./TrendProjection";
import { QuickRecommendations } from "./QuickRecommendations";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { applyFilters, type FilterState } from "./FilterBar";

export const ExecutiveHome = () => {
  const [selectedBlock, setSelectedBlock] = useState<OilBlock | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const blocks = oilBlocks;

  return (
    <div className="space-y-4 p-4 md:p-6 2xl:p-8 max-w-[1920px] 3xl:max-w-[2400px] mx-auto">
      {/* Zone B — Executive KPIs */}
      <KPICards />

      {/* Zone C + D — Map + Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: "420px" }}>
        <div className="lg:col-span-3 rounded-lg overflow-hidden border border-border/40" style={{ minHeight: "420px" }}>
          <ConcessionMap
            blocks={blocks}
            selectedBlockId={selectedBlock?.id ?? null}
            hoveredBlockId={hoveredBlockId}
            onBlockClick={() => {}}
            onBlockHover={setHoveredBlockId}
          />
        </div>
        <div className="lg:col-span-2" style={{ minHeight: "420px" }}>
          <ThreatPanel maxItems={10} />
        </div>
      </div>

      {/* Zone E — Trend Projection */}
      <TrendProjection />

      {/* Zone F — Quick Recommendations */}
      <QuickRecommendations maxItems={5} />
    </div>
  );
};
