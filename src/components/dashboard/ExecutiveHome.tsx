import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ConcessionMap } from "./ConcessionMap";
import { KPICards } from "./KPICards";
import { NationalForecast2050 } from "./NationalForecast2050";
import { ThreatPanel } from "./ThreatPanel";
import { TrendProjection } from "./TrendProjection";
import { QuickRecommendations } from "./QuickRecommendations";
import { OperatorsPanel } from "./OperatorsPanel";
import { AlertsPanel } from "./AlertsPanel";
import { CouncilRecommendationsPanel } from "./CouncilRecommendationsPanel";
import { HomologacoesPanel } from "./HomologacoesPanel";
import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { ChevronDown, ChevronUp, Users, Bell, Target, FileCheck, AlertTriangle, ShieldCheck } from "lucide-react";
import { HSENationalPanel } from "./HSENationalPanel";
import { NationalHistoricalProduction } from "./NationalHistoricalProduction";
import { NationalProductionTrend } from "./NationalProductionTrend";

type DrillDown = "operadores" | "alertas" | "recomendacoes" | "homologacoes" | "hse" | null;

export const ExecutiveHome = ({ initialDrillDown = null }: { initialDrillDown?: DrillDown }) => {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<DrillDown>(initialDrillDown);

  const toggle = (section: DrillDown) =>
    setExpandedSection(prev => prev === section ? null : section);

  return (
    <div className="space-y-4 p-4 md:p-6 2xl:p-8 max-w-[1920px] 3xl:max-w-[2400px] mx-auto">
      {/* Data disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-warning/30 bg-warning/5 text-warning text-[11px]">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>KPIs nacionais baseados no relatório certificado "Estado das Concessões 2026". Painéis detalhados (Operadores, Alertas, Recomendações) reflectem apenas os Blocos 0, 2/05 e 3/05 com dados operacionais verificados.</span>
      </div>
      {/* Zone B — Executive KPIs */}
      <KPICards />

      {/* Historical National Production 1975–2023 */}
      <NationalHistoricalProduction />

      {/* National Forecast 2025–2050 */}
      <NationalForecast2050 />

      {/* Drill-down sections */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Painéis Detalhados</span>
        </div>
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DrillDownButton
                    icon={Users}
                    label="Operadores"
                    isOpen={expandedSection === "operadores"}
                    onClick={() => toggle("operadores")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                Visão consolidada do desempenho de cada operador, incluindo produção, participação e indicadores-chave.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DrillDownButton
                    icon={Bell}
                    label="Alertas Completos"
                    isOpen={expandedSection === "alertas"}
                    onClick={() => toggle("alertas")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                Alertas gerados automaticamente por regras de negócio parametrizáveis, cobrindo contratos, integridade, declínio e conformidade.
              </TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DrillDownButton
                    icon={FileCheck}
                    label="Homologações"
                    isOpen={expandedSection === "homologacoes"}
                    onClick={() => toggle("homologacoes")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                Resumo executivo dos processos de homologação, incluindo montantes aprovados, taxa de aprovação e evolução mensal.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DrillDownButton
                    icon={ShieldCheck}
                    label="HSE & Ambiente"
                    isOpen={expandedSection === "hse"}
                    onClick={() => toggle("hse")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                Indicadores nacionais de segurança ocupacional e ambiente, com TRIR, fatalidades, flaring, CO₂ e ranking por bloco.
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Expanded drill-down panel */}
      {expandedSection && (
        <div className="animate-fade-in">
          {expandedSection === "operadores" && <OperatorsPanel />}
          {expandedSection === "alertas" && <AlertsPanel />}
          {expandedSection === "recomendacoes" && <CouncilRecommendationsPanel />}
          {expandedSection === "homologacoes" && <HomologacoesPanel />}
          {expandedSection === "hse" && <HSENationalPanel />}
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
      className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all w-full ${
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

