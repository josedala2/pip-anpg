import { useState, useMemo } from "react";
import { oilBlocks } from "@/data/angolaBlocks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, X, Sparkles, RectangleHorizontal, RectangleVertical } from "lucide-react";

export type ReportType =
  | "executive"
  | "contractual"
  | "exploration"
  | "consortium"
  | "legislation"
  | "financial"
  | "operators"
  | "production"
  | "hse"
  | "facilities"
  | "prospects";

export interface ReportConfig {
  reportTypes: ReportType[];
  selectedBlockIds: string[];
  selectedOperators: string[];
  includeCharts: boolean;
  includeTables: boolean;
  includeAiNarrative: boolean;
  pdfOrientation: "portrait" | "landscape";
}

const reportTypeLabels: Record<ReportType, { label: string; description: string }> = {
  executive: { label: "Resumo Executivo", description: "KPIs agregados, produção, investimento e reservas" },
  production: { label: "Produção & Declínio", description: "Histórico de produção, projecções e análise de declínio" },
  exploration: { label: "Exploração & Produção", description: "Sísmica, poços, descobertas e taxas de sucesso" },
  prospects: { label: "Prospectos Exploratórios", description: "Recursos prospectivos, probabilidade de sucesso e reservatórios" },
  contractual: { label: "Contractual & Fiscal", description: "Decreto-lei, condições fiscais, bónus e períodos de pesquisa" },
  consortium: { label: "Consórcio & Participações", description: "Evolução GE Inicial → Actual por bloco" },
  legislation: { label: "Legislação & Documentos", description: "Lista consolidada de todos os documentos" },
  financial: { label: "Económico & Financeiro", description: "Custos, plano quinquenal, abandono, partilha de produção" },
  hse: { label: "HSE & Ambiente", description: "Segurança (TRIR, LTI), derrames, emissões CO₂ e gás queimado" },
  facilities: { label: "Instalações & Infraestrutura", description: "Plataformas, capacidade, eficiência e plano de manutenção" },
  operators: { label: "Operadores", description: "Visão 360° por operador: blocos, produção, investimento e compliance" },
};

interface Props {
  config: ReportConfig;
  onChange: (config: ReportConfig) => void;
  onGenerate: () => void;
  allowedReportTypes?: string[];
}

export const ReportConfigurator = ({ config, onChange, onGenerate, allowedReportTypes }: Props) => {
  const [blockSearch, setBlockSearch] = useState("");
  const [operatorSearch, setOperatorSearch] = useState("");

  const verifiedBlocks = useMemo(() => oilBlocks.filter(b => !b.pendingRealData), []);

  const filteredBlocks = verifiedBlocks.filter(b =>
    b.name.toLowerCase().includes(blockSearch.toLowerCase()) ||
    b.operator.toLowerCase().includes(blockSearch.toLowerCase())
  );

  const uniqueOperators = useMemo(() =>
    [...new Set(verifiedBlocks.map(b => b.operator))].sort(),
    [verifiedBlocks]
  );

  const filteredOperators = uniqueOperators.filter(o =>
    o.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  const allSelected = config.selectedBlockIds.length === verifiedBlocks.length;
  const allOperatorsSelected = config.selectedOperators.length === uniqueOperators.length;

  const hasOperatorsType = config.reportTypes.includes("operators");
  const hasBlockTypes = config.reportTypes.some(t => t !== "operators");

  const toggleAllBlocks = () => {
    onChange({
      ...config,
      selectedBlockIds: allSelected ? [] : verifiedBlocks.map(b => b.id),
    });
  };

  const toggleBlock = (id: string) => {
    const ids = config.selectedBlockIds.includes(id)
      ? config.selectedBlockIds.filter(x => x !== id)
      : [...config.selectedBlockIds, id];
    onChange({ ...config, selectedBlockIds: ids });
  };

  const toggleOperator = (name: string) => {
    const ops = config.selectedOperators.includes(name)
      ? config.selectedOperators.filter(o => o !== name)
      : [...config.selectedOperators, name];
    onChange({ ...config, selectedOperators: ops });
  };

  const toggleAllOperators = () => {
    onChange({
      ...config,
      selectedOperators: allOperatorsSelected ? [] : [...uniqueOperators],
    });
  };

  const toggleReportType = (type: ReportType) => {
    const types = config.reportTypes.includes(type)
      ? config.reportTypes.filter(t => t !== type)
      : [...config.reportTypes, type];
    onChange({ ...config, reportTypes: types });
  };

  const blockTypesValid = !hasBlockTypes || config.selectedBlockIds.length > 0;
  const operatorsTypeValid = !hasOperatorsType || config.selectedOperators.length > 0;
  const isValid = config.reportTypes.length > 0 && blockTypesValid && operatorsTypeValid;

  return (
    <div className="space-y-6">
      {/* Report Types */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Tipo de Relatório</h3>
        <div className="grid gap-2">
          {(Object.entries(reportTypeLabels) as [ReportType, typeof reportTypeLabels.executive][]).filter(([key]) => !allowedReportTypes || allowedReportTypes.includes(key)).map(([key, val]) => (
            <label
              key={key}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                config.reportTypes.includes(key)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Checkbox
                checked={config.reportTypes.includes(key)}
                onCheckedChange={() => toggleReportType(key)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-foreground">{val.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{val.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Operator Selection — shown when operators type is selected */}
      {hasOperatorsType && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Operadores</h3>
            <button onClick={toggleAllOperators} className="text-xs text-primary hover:underline">
              {allOperatorsSelected ? "Desseleccionar Todos" : "Seleccionar Todos"}
            </button>
          </div>

          {config.selectedOperators.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {config.selectedOperators.slice(0, 6).map(name => (
                <Badge key={name} variant="secondary" className="text-xs gap-1 pr-1">
                  {name}
                  <button onClick={() => toggleOperator(name)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {config.selectedOperators.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{config.selectedOperators.length - 6} mais
                </Badge>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Pesquisar operadores..."
            value={operatorSearch}
            onChange={e => setOperatorSearch(e.target.value)}
            className="w-full px-3 py-2 mb-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
            {filteredOperators.map(op => {
              const blockCount = verifiedBlocks.filter(b => b.operator === op).length;
              return (
                <label
                  key={op}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                    config.selectedOperators.includes(op)
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <Checkbox
                    checked={config.selectedOperators.includes(op)}
                    onCheckedChange={() => toggleOperator(op)}
                  />
                  <span className="truncate">{op}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{blockCount} bloco{blockCount !== 1 ? "s" : ""}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Selection — hidden when ONLY operators type is selected */}
      {hasBlockTypes && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Blocos</h3>
            <button onClick={toggleAllBlocks} className="text-xs text-primary hover:underline">
              {allSelected ? "Desseleccionar Todos" : "Seleccionar Todos"}
            </button>
          </div>

          {config.selectedBlockIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {config.selectedBlockIds.slice(0, 8).map(id => {
                const block = oilBlocks.find(b => b.id === id);
                return (
                  <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1">
                    {block?.name}
                    <button onClick={() => toggleBlock(id)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
              {config.selectedBlockIds.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{config.selectedBlockIds.length - 8} mais
                </Badge>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Pesquisar blocos..."
            value={blockSearch}
            onChange={e => setBlockSearch(e.target.value)}
            className="w-full px-3 py-2 mb-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
            {filteredBlocks.map(block => (
              <label
                key={block.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                  config.selectedBlockIds.includes(block.id)
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-secondary text-muted-foreground"
                }`}
              >
                <Checkbox
                  checked={config.selectedBlockIds.includes(block.id)}
                  onCheckedChange={() => toggleBlock(block.id)}
                />
                <span className="truncate">{block.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{block.operator}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Opções</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox
              checked={config.includeTables}
              onCheckedChange={(checked) => onChange({ ...config, includeTables: !!checked })}
            />
            Incluir tabelas comparativas
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox
              checked={config.includeCharts}
              onCheckedChange={(checked) => onChange({ ...config, includeCharts: !!checked })}
            />
            Incluir gráficos
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={config.includeAiNarrative}
              onCheckedChange={(checked) => onChange({ ...config, includeAiNarrative: !!checked })}
            />
            <span className="flex items-center gap-1 text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Sumário narrativo com IA
            </span>
          </label>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">Orientação PDF</p>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ ...config, pdfOrientation: "portrait" })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  config.pdfOrientation === "portrait"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <RectangleVertical className="w-3.5 h-3.5" />
                Retrato
              </button>
              <button
                onClick={() => onChange({ ...config, pdfOrientation: "landscape" })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  config.pdfOrientation === "landscape"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <RectangleHorizontal className="w-3.5 h-3.5" />
                Paisagem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button onClick={onGenerate} disabled={!isValid} className="w-full gap-2">
        <FileText className="w-4 h-4" />
        Gerar Relatório
        {!isValid && <span className="text-xs opacity-70">(seleccione tipo e {hasOperatorsType && !hasBlockTypes ? "operadores" : "blocos"})</span>}
      </Button>
    </div>
  );
};
