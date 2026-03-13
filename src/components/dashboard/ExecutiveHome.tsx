import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ConcessionMap } from "./ConcessionMap";
import { KPICards } from "./KPICards";
import { ThreatPanel } from "./ThreatPanel";
import { TrendProjection } from "./TrendProjection";
import { QuickRecommendations } from "./QuickRecommendations";
import { OperatorsPanel } from "./OperatorsPanel";
import { AlertsPanel } from "./AlertsPanel";
import { CouncilRecommendationsPanel } from "./CouncilRecommendationsPanel";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { ChevronDown, ChevronUp, Users, Bell, Target } from "lucide-react";

type DrillDown = "operadores" | "alertas" | "recomendacoes" | null;

export const ExecutiveHome = ({ initialDrillDown = null }: { initialDrillDown?: DrillDown }) => {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<DrillDown>(initialDrillDown);

  const toggle = (section: DrillDown) =>
    setExpandedSection(prev => prev === section ? null : section);

  return (
    <div className="space-y-4 p-4 md:p-6 2xl:p-8 max-w-[1920px] 3xl:max-w-[2400px] mx-auto">
      {/* Zone B — Executive KPIs */}
      <KPICards />

      {/* Drill-down sections */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Painéis Detalhados</span>
        </div>
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <DrillDownButton
              icon={Users}
              label="Operadores"
              isOpen={expandedSection === "operadores"}
              onClick={() => toggle("operadores")}
            />
            <DrillDownButton
              icon={Bell}
              label="Alertas Completos"
              isOpen={expandedSection === "alertas"}
              onClick={() => toggle("alertas")}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DrillDownButton
                    icon={Target}
                    label="Recomendações"
                    isOpen={expandedSection === "recomendacoes"}
                    onClick={() => toggle("recomendacoes")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                Acções estratégicas priorizadas para decisão, baseadas na análise de produção, contratos e risco de cada concessão.
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Expanded drill-down panel */}
      {expandedSection && (
        <div className="animate-counter-up">
          {expandedSection === "operadores" && <OperatorsPanel />}
          {expandedSection === "alertas" && <AlertsPanel />}
          {expandedSection === "recomendacoes" && <CouncilRecommendationsPanel />}
        </div>
      )}

      {/* Zone C + D — Map + Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: "420px" }}>
        <div className="lg:col-span-3 rounded-lg overflow-hidden border border-border/40" style={{ minHeight: "420px" }}>
          <ConcessionMap
            blocks={oilBlocks}
            selectedBlockId={null}
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

function DrillDownButton({ icon: Icon, label, isOpen, onClick }: {
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
        isOpen
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
    </button>
  );
}
