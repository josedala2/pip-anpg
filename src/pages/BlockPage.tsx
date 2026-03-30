import { useState, useId, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { oilBlocks } from "@/data/angolaBlocks";
import { ProspectsTable } from "@/components/dashboard/ProspectsTable";
import { ChartWrapper } from "@/components/dashboard/ChartWrapper";
import { TierProductionSection } from "@/components/dashboard/TierProductionSection";
import { ProspectsSummary } from "@/components/dashboard/ProspectsSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Droplets, DollarSign, ShieldCheck, TrendingUp, Users, Activity, Target, Layers, BarChart3, MapPin, Brain, FileText, Landmark, Building2, Clock, Scale, ArrowRight, History, BookOpen, ExternalLink, AlertTriangle, Crosshair, Search, Filter, AlignVerticalJustifyStart, AlignHorizontalJustifyStart, Download, FileSpreadsheet, FileDown, Leaf, Lightbulb, CheckCircle2, ChevronRight, Gauge, BarChart2, Flame, Fuel, Zap, Wrench } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RevitalizationScenario } from "@/data/angolaBlocks";
import { TechnicalRecommendationsPanel } from "@/components/dashboard/TechnicalRecommendationsPanel";
import { ExplorationChallengesPanel } from "@/components/dashboard/ExplorationChallengesPanel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/exportFinancial";
import { toast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SwotAnalysis } from "@/components/dashboard/SwotAnalysis";
import { ConcessionStatusTab } from "@/components/dashboard/ConcessionStatusTab";
import { EconomicVisionTab } from "@/components/dashboard/EconomicVisionTab";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import { HSEEnvironmentTab } from "@/components/dashboard/HSEEnvironmentTab";
import { FacilitiesTab } from "@/components/dashboard/FacilitiesTab";
import { HomologacoesPanel } from "@/components/dashboard/HomologacoesPanel";
import { DevelopmentProjectsPanel } from "@/components/dashboard/DevelopmentProjectsPanel";
import { BlockGasPanel } from "@/components/dashboard/BlockGasPanel";
import type { LegislationDocument, ContractInfo } from "@/data/angolaBlocks";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Brush, ReferenceLine, LabelList,
} from "recharts";


const phaseColor = (phase: string) => {
  switch (phase) {
    case "Production": return "bg-success/15 text-success border-success/30";
    case "Development": return "bg-warning/15 text-warning border-warning/30";
    case "Exploration": return "bg-primary/15 text-primary border-primary/30";
    case "Suspended": return "bg-danger/15 text-danger border-danger/30";
    case "Bidding": return "bg-[hsl(280,65%,60%)]/15 text-[hsl(280,65%,60%)] border-[hsl(280,65%,60%)]/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const CONSORTIUM_COLORS = [
  "hsl(199, 89%, 48%)", "hsl(152, 69%, 40%)", "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(170, 60%, 45%)",
  "hsl(220, 70%, 55%)", "hsl(340, 65%, 50%)",
];

const typeLabelsMap: Record<string, { label: string; color: string }> = {
  "decreto-lei": { label: "Decreto-Lei", color: "bg-primary/15 text-primary border-primary/30" },
  "contrato": { label: "Contrato", color: "bg-success/15 text-success border-success/30" },
  "despacho": { label: "Despacho", color: "bg-warning/15 text-warning border-warning/30" },
  "resolução": { label: "Resolução", color: "bg-[hsl(280,65%,60%)]/15 text-[hsl(280,65%,60%)] border-[hsl(280,65%,60%)]/30" },
  "nota": { label: "Nota", color: "bg-muted text-muted-foreground border-border" },
  "outro": { label: "Outro", color: "bg-muted text-muted-foreground border-border" },
};

const LegislationSearch = ({ docs, contractInfo }: { docs: LegislationDocument[]; contractInfo?: ContractInfo }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = docs.filter(doc => {
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        (doc.reference?.toLowerCase().includes(q)) ||
        (doc.description?.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const docTypes = [...new Set(docs.map(d => d.type))];

  return (
    <>
      {docs.length > 0 && (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar decretos, contratos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm glass-card border-border/50"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44 h-9 text-xs glass-card border-border/50">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos os tipos</SelectItem>
                {docTypes.map(t => (
                  <SelectItem key={t} value={t}>{typeLabelsMap[t]?.label || t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || typeFilter !== "all") && (
              <Badge variant="outline" className="h-9 px-3 text-xs flex items-center gap-1.5">
                {filtered.length} de {docs.length} documentos
              </Badge>
            )}
          </div>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 2xl:gap-6">
              {filtered.map((doc, i) => {
                const typeInfo = typeLabelsMap[doc.type] || typeLabelsMap["outro"];
                return (
                  <Card key={i} className="glass-card hover:border-primary/30 transition-colors group">
                    <CardContent className="p-4 2xl:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <h3 className="font-semibold text-sm 2xl:text-base leading-tight">{doc.title}</h3>
                        </div>
                        <Badge variant="outline" className={`text-[9px] shrink-0 ${typeInfo.color}`}>{typeInfo.label}</Badge>
                      </div>
                      {doc.reference && (
                        <div className="text-xs text-muted-foreground font-mono">{doc.reference}</div>
                      )}
                      {doc.date && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.date).toLocaleDateString("pt-AO", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      )}
                      {doc.description && (
                        <p className="text-xs 2xl:text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
                      )}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Ver documento
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum documento encontrado para "{search}"</p>
                <p className="text-xs text-muted-foreground mt-1">Tente ajustar os termos de pesquisa ou filtros.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {docs.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Documentos e legislação não disponíveis para este bloco.</p>
            <p className="text-xs text-muted-foreground mt-1">Serão adicionados conforme disponibilização pela ANPG.</p>
          </CardContent>
        </Card>
      )}

      {/* Contract info summary */}
      {contractInfo && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><Landmark className="w-4 h-4 text-warning" />Referência Contratual</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 text-sm">
              {contractInfo.decretoLei && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Decreto-Lei Base</span>
                  <span className="font-medium">{contractInfo.decretoLei}</span>
                </div>
              )}
              {contractInfo.contractType && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Tipo de Contrato</span>
                  <span className="font-medium">{contractInfo.contractType}</span>
                </div>
              )}
              {contractInfo.signingDate && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Assinatura</span>
                  <span className="font-medium">{new Date(contractInfo.signingDate).toLocaleDateString("pt-AO")}</span>
                </div>
              )}
              {contractInfo.productionPeriodStart && contractInfo.productionPeriodEnd && (
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Período de Produção</span>
                  <span className="font-medium font-mono text-xs">{new Date(contractInfo.productionPeriodStart).getFullYear()} — {new Date(contractInfo.productionPeriodEnd).getFullYear()}</span>
                </div>
              )}
            </div>
            {contractInfo.historicalNotes && contractInfo.historicalNotes.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/30 space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><History className="w-3 h-3" />Notas Históricas</div>
                {contractInfo.historicalNotes.map((note, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">{note}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

const RevitalizationCard = ({ scenario, accent, index }: { scenario: RevitalizationScenario; accent: { border: string; icon: string; bg: string; tag: string }; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className={`glass-card border-l-2 ${accent.border} hover:border-l-4 transition-all duration-200 cursor-pointer group`} onClick={() => setExpanded(!expanded)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
              <span className={`text-sm font-bold ${accent.icon}`}>{scenario.id}</span>
            </div>
            <CardTitle className="text-sm 2xl:text-base leading-tight">{scenario.title}</CardTitle>
          </div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-xs 2xl:text-sm text-muted-foreground leading-relaxed">{scenario.description}</p>

        {expanded && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {scenario.proposals.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Propostas</div>
                <ul className="space-y-1">
                  {scenario.proposals.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${accent.icon}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scenario.incentives && scenario.incentives.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Incentivos</div>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.incentives.map((inc, i) => (
                    <Badge key={i} variant="outline" className={`text-[10px] ${accent.tag}`}>{inc}</Badge>
                  ))}
                </div>
              </div>
            )}
            {scenario.commitments && scenario.commitments.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Compromissos</div>
                <ul className="space-y-1">
                  {scenario.commitments.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className={`w-3 h-3 shrink-0 mt-0.5 ${accent.icon}`} />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!expanded && (
          <div className="text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            Clique para ver detalhes →
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BlockPage = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const block = oilBlocks.find(b => b.id === blockId);

  // Unique gradient IDs to avoid SVG conflicts — must be before early return
  const uid = useId().replace(/:/g, "");
  const prodGradId = `prodGrad-${uid}`;
  const discGradId = `discGrad-${uid}`;
  const [explorationBarMode, setExplorationBarMode] = useState<"grouped" | "stacked">("grouped");
  const [activeTab, setActiveTab] = useState("overview");
  const [fieldDecadeFilter, setFieldDecadeFilter] = useState<string | null>(null);
  const [fieldStatusFilter, setFieldStatusFilter] = useState<string | null>(null);

  // Calculate averages for reference lines
  const avgProduction = useMemo(() => {
    if (!block?.productionHistory?.length) return 0;
    return Math.round(block.productionHistory.reduce((s, d) => s + d.value, 0) / block.productionHistory.length);
  }, [block]);

  const avgCapexPlanned = useMemo(() => {
    if (!block?.capexHistory?.length) return 0;
    return Math.round(block.capexHistory.reduce((s, d) => s + d.planned, 0) / block.capexHistory.length);
  }, [block]);

  if (!block) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Bloco não encontrado</h2>
          <p className="text-muted-foreground mb-4">O bloco "{blockId}" não existe na base de dados.</p>
          <Button onClick={() => navigate(-1)} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        </Card>
      </div>
    );
  }

  const projectionYears = block.projections.base.map((_, i) => ({
    year: `${2025 + i}`,
    conservative: block.projections.conservative[i],
    base: block.projections.base[i],
    expansion: block.projections.expansion[i],
  }));

  // Tooltip & legend styles
  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--foreground))",
  };

  const legendStyle = { fontSize: 11, paddingTop: 8 };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 border-t-4 border-t-primary px-4 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
             <h1 className="text-lg 2xl:text-2xl font-bold truncate">{block.name}</h1>
             <Badge variant="outline" className={`text-xs 2xl:text-sm shrink-0 ${phaseColor(block.phase)}`}>{block.phase}</Badge>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm 2xl:text-base text-muted-foreground">
            <span>{block.operator}</span>
            <span>·</span>
            <span>{block.basin}</span>
            <span>·</span>
            <span>{block.waterDepth}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1920px] mx-auto p-4 2xl:p-8 pb-16 space-y-4 2xl:space-y-6">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 2xl:space-y-6">
           <TabsList className="glass-card p-1 2xl:p-1.5 h-auto flex-wrap">
                <TabsTrigger value="overview" className="gap-1.5 text-xs 2xl:text-sm"><Activity className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Visão Geral</TabsTrigger>
                <TabsTrigger value="concession-status" className="gap-1.5 text-xs 2xl:text-sm"><Landmark className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Estado da Concessão</TabsTrigger>
                <TabsTrigger value="econ-financial" className="gap-1.5 text-xs 2xl:text-sm"><DollarSign className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Económico & Financeiro</TabsTrigger>
                <TabsTrigger value="exploration" className="gap-1.5 text-xs 2xl:text-sm"><Target className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Exploração</TabsTrigger>
                <TabsTrigger value="prod-proj" className="gap-1.5 text-xs 2xl:text-sm"><BarChart3 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Produção</TabsTrigger>
                <TabsTrigger value="facilities-hse" className="gap-1.5 text-xs 2xl:text-sm"><Building2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Instalações & HSE</TabsTrigger>
                <TabsTrigger value="swot" className="gap-1.5 text-xs 2xl:text-sm"><Brain className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Análise SWOT</TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5 text-xs 2xl:text-sm"><BookOpen className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Documentos</TabsTrigger>
            </TabsList>

          {/* Tab 1: Visão Geral */}
          <TabsContent value="overview" className="space-y-4 2xl:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 2xl:gap-5">
              {[
                { label: "Produção Diária", value: block.dailyProduction > 0 ? `${(block.dailyProduction / 1000).toFixed(0)}k BOPD` : "—", icon: Droplets, color: "text-primary" },
                { label: "Reservas Estimadas", value: `${block.estimatedReserves}M bbl`, icon: Layers, color: "text-success" },
                { label: "Investimento Acum.", value: `$${(block.accumulatedInvestment / 1000).toFixed(1)}B`, icon: DollarSign, color: "text-warning" },
                { label: "Taxa Execução", value: `${block.executionRate}%`, icon: TrendingUp, color: "text-primary" },
              ].map(kpi => (
                <Card key={kpi.label} className="glass-card">
                   <CardContent className="p-4 2xl:p-6">
                     <div className="flex items-center gap-2 mb-2">
                       <kpi.icon className={`w-4 h-4 2xl:w-5 2xl:h-5 ${kpi.color}`} />
                       <span className="text-xs 2xl:text-sm text-muted-foreground">{kpi.label}</span>
                       {tooltipDescriptions[kpi.label] && <InfoTooltip text={tooltipDescriptions[kpi.label]} />}
                     </div>
                     <div className="text-2xl 2xl:text-3xl font-bold font-mono">{kpi.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 2xl:gap-6">
              {/* Info Grid */}
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {[
                      { label: "Operador", value: block.operator },
                      { label: "Bacia Sedimentar", value: block.basin },
                      { label: "Profundidade", value: block.waterDepth },
                      { label: "Data do Contrato", value: new Date(block.contractDate).toLocaleDateString("pt-AO") },
                      ...(block.contractInfo?.contractType ? [{ label: "Tipo de Contrato", value: block.contractInfo.contractType }] : []),
                      ...(block.contractInfo?.decretoLei ? [{ label: "Decreto-Lei", value: block.contractInfo.decretoLei }] : []),
                      ...(block.contractInfo?.location ? [{ label: "Localização", value: block.contractInfo.location }] : []),
                      ...(block.areaKm2 ? [{ label: "Área", value: `${block.areaKm2.toLocaleString()} km²` }] : []),
                      ...(block.waterDepthRange ? [{ label: "Lâmina d'Água", value: block.waterDepthRange }] : []),
                      ...(block.contractInfo?.signingDate ? [{ label: "Data de Assinatura", value: new Date(block.contractInfo.signingDate).toLocaleDateString("pt-AO") }] : []),
                      ...(block.contractInfo?.effectiveDate ? [{ label: "Data Efectiva", value: new Date(block.contractInfo.effectiveDate).toLocaleDateString("pt-AO") }] : []),
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                         <span className="text-xs 2xl:text-sm text-muted-foreground">{item.label}</span>
                         <span className="text-sm 2xl:text-base font-medium text-right max-w-[60%]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contract Financial Data */}
              {block.contractInfo && (block.contractInfo.signatureBonus || block.contractInfo.socialBonus || block.contractInfo.productionBonus) && (
                <Card className="glass-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><Landmark className="w-4 h-4 text-warning" />Dados Contratuais</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {block.contractInfo.signatureBonus && (
                      <div className="glass-card rounded-lg p-3">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Bónus de Assinatura</div>
                        <div className="text-lg 2xl:text-xl font-bold font-mono text-warning">US$ {(block.contractInfo.signatureBonus / 1e6).toFixed(0)}M</div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {block.contractInfo.socialBonus && (
                        <div className="glass-card rounded-lg p-3">
                          <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Bónus Social</div>
                          <div className="text-sm 2xl:text-base font-bold font-mono">US$ {(block.contractInfo.socialBonus / 1e6).toFixed(0)}M</div>
                        </div>
                      )}
                      {block.contractInfo.productionBonus && (
                        <div className="glass-card rounded-lg p-3">
                          <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Bónus de Produção</div>
                          <div className="text-sm 2xl:text-base font-bold font-mono">US$ {(block.contractInfo.productionBonus / 1e6).toFixed(0)}M</div>
                        </div>
                      )}
                    </div>
                    {block.contractInfo.socialProjects && (
                      <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                        <span className="text-xs 2xl:text-sm text-muted-foreground">P. Sociais {block.contractInfo.socialProjectsPeriod && `(${block.contractInfo.socialProjectsPeriod})`}</span>
                        <span className="text-sm font-medium font-mono">US$ {(block.contractInfo.socialProjects / 1e6).toFixed(2)}M</span>
                      </div>
                    )}
                    {block.contractInfo.regulatoryContribution && (
                      <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                        <span className="text-xs 2xl:text-sm text-muted-foreground">C. Regulatória {block.contractInfo.regulatoryContributionPeriod && `(${block.contractInfo.regulatoryContributionPeriod})`}</span>
                        <span className="text-sm font-medium font-mono">US$ {(block.contractInfo.regulatoryContribution / 1e6).toFixed(2)}M</span>
                      </div>
                    )}

                    {/* Production Period */}
                    {block.contractInfo.productionPeriodStart && (
                      <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                        <span className="text-xs 2xl:text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Período de Produção</span>
                        <span className="text-xs font-medium font-mono">{new Date(block.contractInfo.productionPeriodStart).toLocaleDateString("pt-AO")} — {block.contractInfo.productionPeriodEnd && new Date(block.contractInfo.productionPeriodEnd).toLocaleDateString("pt-AO")}</span>
                      </div>
                    )}

                    {/* GE Inicial summary */}
                    {block.contractInfo.initialConsortium && (
                      <div className="mt-2">
                        <button
                          onClick={() => { setActiveTab("econ-financial"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Building2 className="w-3 h-3" />
                          <span>GE Inicial: {block.contractInfo.initialConsortium.length} parceiros</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { setActiveTab("econ-financial"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2 transition-colors"
                    >
                      <DollarSign className="w-3 h-3" />Ver Financeiro & Contratual completo<ArrowRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              )}

              {/* Periods & Fiscal Conditions */}
              {block.contractInfo && (block.contractInfo.researchPeriod || block.contractInfo.fiscalConditions) && (
                <Card className="glass-card md:col-span-2 xl:col-span-1">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><Scale className="w-4 h-4 text-primary" />Períodos & Condições Fiscais</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    {/* Research Period */}
                    {block.contractInfo.researchPeriod && (
                      <div className="space-y-2">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground font-medium">Período de Pesquisa</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="glass-card rounded-lg p-2.5">
                            <div className="text-[9px] uppercase text-muted-foreground">F. Inicial</div>
                            <div className="font-bold font-mono text-sm">{block.contractInfo.researchPeriod.initialPhaseYears} <span className="text-xs font-normal text-muted-foreground">anos</span></div>
                            <div className="text-[10px] text-muted-foreground">{block.contractInfo.researchPeriod.initialPhaseWells} poços</div>
                          </div>
                          <div className="glass-card rounded-lg p-2.5">
                            <div className="text-[9px] uppercase text-muted-foreground">F. Subsequente</div>
                            <div className="font-bold font-mono text-sm">{block.contractInfo.researchPeriod.subsequentPhaseYears} <span className="text-xs font-normal text-muted-foreground">anos</span></div>
                            <div className="text-[10px] text-muted-foreground">{block.contractInfo.researchPeriod.subsequentPhaseWells} poços</div>
                          </div>
                        </div>
                        {block.contractInfo.researchPeriod.seismic3dKm2 && (
                          <div className="text-xs text-muted-foreground">
                            Sísmica 3D: <span className="font-mono font-medium text-foreground">{block.contractInfo.researchPeriod.seismic3dKm2} km²</span>
                            {block.contractInfo.researchPeriod.seismic3dReprocKm2 && <span> (Reproc. {block.contractInfo.researchPeriod.seismic3dReprocKm2} km²)</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fiscal Conditions */}
                    {block.contractInfo.fiscalConditions && (
                      <div className="space-y-2">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground font-medium">Condições Fiscais</div>
                        <div className="space-y-1.5">
                          {block.contractInfo.fiscalConditions.costRecoveryPostProd != null && (
                            <div className="flex justify-between py-1 border-b border-border/30 text-xs">
                              <span className="text-muted-foreground">C. Pesq. e Desenv. (pós-prod)</span>
                              <span className="font-mono font-semibold">{block.contractInfo.fiscalConditions.costRecoveryPostProd}%</span>
                            </div>
                          )}
                          {block.contractInfo.fiscalConditions.costRecoveryPreProd != null && (
                            <div className="flex justify-between py-1 border-b border-border/30 text-xs">
                              <span className="text-muted-foreground">C. Pesq. e Desenv. (pré-prod)</span>
                              <span className="font-mono font-semibold">{block.contractInfo.fiscalConditions.costRecoveryPreProd}%</span>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {block.contractInfo.fiscalConditions.irp != null && (
                              <div className="glass-card rounded-lg p-2 text-center">
                                <div className="text-[9px] uppercase text-muted-foreground">IRP</div>
                                <div className="font-bold font-mono text-sm text-primary">{block.contractInfo.fiscalConditions.irp}%</div>
                              </div>
                            )}
                            {block.contractInfo.fiscalConditions.ipp != null && (
                              <div className="glass-card rounded-lg p-2 text-center">
                                <div className="text-[9px] uppercase text-muted-foreground">IPP</div>
                                <div className="font-bold font-mono text-sm">{block.contractInfo.fiscalConditions.ipp}%</div>
                              </div>
                            )}
                            {block.contractInfo.fiscalConditions.itp != null && (
                              <div className="glass-card rounded-lg p-2 text-center">
                                <div className="text-[9px] uppercase text-muted-foreground">ITP</div>
                                <div className="font-bold font-mono text-sm">{block.contractInfo.fiscalConditions.itp}%</div>
                              </div>
                            )}
                          </div>
                          {block.contractInfo.fiscalConditions.productionPremium != null && (
                            <div className="flex justify-between py-1 border-b border-border/30 text-xs">
                              <span className="text-muted-foreground">Prémio de Produção</span>
                              <span className="font-mono font-semibold">{block.contractInfo.fiscalConditions.productionPremium} USD/bbl</span>
                            </div>
                          )}
                          {block.contractInfo.fiscalConditions.investmentPremiumAreaA != null && (
                            <div className="flex justify-between py-1 border-b border-border/30 text-xs">
                              <span className="text-muted-foreground">Prémio Invest. (Área A / B)</span>
                              <span className="font-mono font-semibold">{block.contractInfo.fiscalConditions.investmentPremiumAreaA}% / {block.contractInfo.fiscalConditions.investmentPremiumAreaB}%</span>
                            </div>
                          )}
                          {block.contractInfo.fiscalConditions.investmentPremiumReduction && (
                            <div className="text-[10px] text-muted-foreground italic">{block.contractInfo.fiscalConditions.investmentPremiumReduction}</div>
                          )}
                          {block.contractInfo.fiscalConditions.irpNoteAngolan && (
                            <div className="text-[10px] text-muted-foreground italic mt-1">* {block.contractInfo.fiscalConditions.irpNoteAngolan}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Historical Notes */}
                    {block.contractInfo.historicalNotes && block.contractInfo.historicalNotes.length > 0 && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-border/30">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><History className="w-3 h-3" /> Histórico</div>
                        {block.contractInfo.historicalNotes.map((note, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{note}</p>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => { setActiveTab("econ-financial"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2 transition-colors"
                    >
                      <Scale className="w-3 h-3" />Ver todas as condições fiscais<ArrowRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              )}

              {/* Risk & Compliance */}
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />Risco & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-8 mb-4">
                    <div className="text-center">
                       <div className="text-4xl 2xl:text-5xl font-bold font-mono">{block.riskScore}<span className="text-lg 2xl:text-xl text-muted-foreground">/10</span></div>
                       <div className="text-xs 2xl:text-sm text-muted-foreground mt-1">Score de Risco</div>
                    </div>
                    <div className="text-center flex-1">
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Pie data={[{ value: block.complianceScore }, { value: 100 - block.complianceScore }]}
                            cx="50%" cy="50%" innerRadius={35} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value">
                            <Cell fill="hsl(152, 69%, 40%)" />
                            <Cell fill="hsl(var(--muted))" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-xs text-muted-foreground -mt-2">Compliance: <span className="font-bold text-foreground">{block.complianceScore}%</span></div>
                    </div>
                  </div>
                  <div className="text-xs 2xl:text-sm text-muted-foreground">
                    {block.riskScore <= 3 ? "Risco baixo — operações estáveis e previsíveis." :
                     block.riskScore <= 6 ? "Risco moderado — requer monitorização contínua." :
                     "Risco elevado — necessário plano de mitigação activo."}
                  </div>
                  <button
                    onClick={() => { setActiveTab("facilities-hse"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2 transition-colors"
                  >
                    <Leaf className="w-3 h-3" />Ver HSE & Ambiente<ArrowRight className="w-3 h-3" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Fields/Discoveries */}
            {block.fields && block.fields.length > 0 && (() => {
              const totalFields = block.fields.length;
              const producing = block.fields.filter(f => f.status === "Producing").length;
              const totalPeakProd = block.fields.reduce((s, f) => s + (f.peakProduction || 0), 0);
              const decades = block.fields.reduce((acc, f) => {
                if (f.discoveryYear) {
                  const decade = `${Math.floor(f.discoveryYear / 10) * 10}s`;
                  acc[decade] = (acc[decade] || 0) + 1;
                }
                return acc;
              }, {} as Record<string, number>);
              // Build yearly discovery timeline with cumulative count
              const yearlyMap = block.fields.reduce((acc, f) => {
                if (f.discoveryYear) {
                  acc[f.discoveryYear] = (acc[f.discoveryYear] || 0) + 1;
                }
                return acc;
              }, {} as Record<number, number>);
              const years = Object.keys(yearlyMap).map(Number).sort((a, b) => a - b);
              let cumulative = 0;
              const timelineData = years.map(y => {
                cumulative += yearlyMap[y];
                return { year: y, discoveries: yearlyMap[y], cumulative };
              });
              const sortedFields = [...block.fields].sort((a, b) => (a.discoveryYear || 0) - (b.discoveryYear || 0));
              const statusColor: Record<string, string> = {
                Producing: "bg-success/15 text-success border-success/30",
                Development: "bg-warning/15 text-warning border-warning/30",
                Discovery: "bg-primary/15 text-primary border-primary/30",
                Abandoned: "bg-danger/15 text-danger border-danger/30",
              };

              const statuses = [...new Set(block.fields.map(f => f.status))];
              const statusLabels: Record<string, string> = {
                Producing: "Produção", Development: "Desenvolvimento", Discovery: "Descoberta", Abandoned: "Abandonado",
              };

              const filteredFields = sortedFields.filter(f => {
                if (fieldDecadeFilter) {
                  const decade = f.discoveryYear ? `${Math.floor(f.discoveryYear / 10) * 10}s` : null;
                  if (decade !== fieldDecadeFilter) return false;
                }
                if (fieldStatusFilter && f.status !== fieldStatusFilter) return false;
                return true;
              });

              return (
                <Card className="glass-card">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Campos & Descobertas
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span><span className="font-bold text-foreground font-mono">{totalFields}</span> campos</span>
                        <span className="text-border">|</span>
                        <span><span className="font-bold text-success font-mono">{producing}</span> em produção</span>
                        <span className="text-border">|</span>
                        <span>Pico combinado: <span className="font-bold text-foreground font-mono">{(totalPeakProd / 1000).toFixed(0)}k</span> BOPD</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-4">
                    {/* Decade filter bar */}
                    <div className="flex items-center gap-1">
                      {Object.entries(decades).sort(([a], [b]) => a.localeCompare(b)).map(([decade, count]) => {
                        const pct = Math.max((count / totalFields) * 100, 8);
                        const isActive = fieldDecadeFilter === decade;
                        return (
                          <button
                            key={decade}
                            onClick={() => setFieldDecadeFilter(isActive ? null : decade)}
                            className={`relative h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                              isActive ? "bg-primary/30 ring-1 ring-primary" : "bg-primary/15 hover:bg-primary/25"
                            }`}
                            style={{ width: `${pct}%`, minWidth: 48 }}
                            title={`${decade}: ${count} campo${count > 1 ? "s" : ""}${isActive ? " (clique para limpar)" : ""}`}
                          >
                            <span className="text-[10px] font-mono font-semibold text-primary">{decade}</span>
                            <span className="absolute -top-1.5 right-1 text-[9px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Status filter chips */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status:</span>
                      {statuses.map(s => {
                        const isActive = fieldStatusFilter === s;
                        const count = block.fields!.filter(f => f.status === s).length;
                        return (
                          <button
                            key={s}
                            onClick={() => setFieldStatusFilter(isActive ? null : s)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer ${
                              isActive
                                ? statusColor[s] + " ring-1 ring-current"
                                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                            }`}
                          >
                            {statusLabels[s] || s}
                            <span className="font-mono">({count})</span>
                          </button>
                        );
                      })}
                      {(fieldDecadeFilter || fieldStatusFilter) && (
                        <button
                          onClick={() => { setFieldDecadeFilter(null); setFieldStatusFilter(null); }}
                          className="text-[10px] text-primary hover:underline ml-1"
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>

                    {/* Discovery timeline chart */}
                    {timelineData.length > 1 && (
                      <div className="glass-card rounded-lg p-3 2xl:p-4">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Timeline de Descobertas</div>
                       <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id={discGradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
                            <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" width={30} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" width={30} allowDecimals={false} />
                            <Tooltip
                              contentStyle={tooltipStyle}
                              formatter={(val: number, name: string) => [val, name === "discoveries" ? "Descobertas" : "Acumulado"]}
                              labelFormatter={(label) => `Ano ${label}`}
                            />
                            <Bar yAxisId="left" dataKey="discoveries" fill="hsl(199, 89%, 48%)" radius={[3, 3, 0, 0]} name="discoveries" barSize={12} animationDuration={800} />
                            <Area yAxisId="right" type="monotone" dataKey="cumulative" stroke="hsl(152, 69%, 40%)" fill={`url(#${discGradId})`} strokeWidth={2} name="cumulative" animationDuration={1000} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Filtered count indicator */}
                    {(fieldDecadeFilter || fieldStatusFilter) && (
                      <div className="text-xs text-muted-foreground">
                        A mostrar <span className="font-bold text-foreground font-mono">{filteredFields.length}</span> de {totalFields} campos
                        {fieldDecadeFilter && <span> · Década: <span className="font-semibold text-primary">{fieldDecadeFilter}</span></span>}
                        {fieldStatusFilter && <span> · Status: <span className="font-semibold">{statusLabels[fieldStatusFilter] || fieldStatusFilter}</span></span>}
                      </div>
                    )}

                    {/* Fields grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 2xl:gap-3">
                      {filteredFields.map(f => (
                        <div key={f.name} className="glass-card p-3 2xl:p-4 rounded-lg group hover:border-primary/30 transition-colors border border-transparent relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full rounded-l" style={{
                            backgroundColor: f.status === "Producing" ? "hsl(152, 69%, 40%)" :
                              f.status === "Development" ? "hsl(38, 92%, 50%)" :
                              f.status === "Discovery" ? "hsl(199, 89%, 48%)" : "hsl(0, 72%, 51%)"
                          }} />
                          <div className="pl-2">
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-semibold text-sm 2xl:text-base leading-tight">{f.name}</div>
                              <Badge variant="outline" className={`text-[9px] shrink-0 ${statusColor[f.status] || "bg-muted text-muted-foreground"}`}>{statusLabels[f.status] || f.status}</Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[10px] 2xl:text-xs text-muted-foreground">
                              {f.discoveryYear && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                  {f.discoveryYear}
                                </span>
                              )}
                              {f.peakProduction && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Droplets className="w-3 h-3 text-primary/60" />
                                  {(f.peakProduction / 1000).toFixed(0)}k BOPD
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setActiveTab("exploration"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2 transition-colors"
                    >
                      <Target className="w-3 h-3" />Ver Exploração completa<ArrowRight className="w-3 h-3" />
                    </button>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Development Projects */}
            {block.developmentProjects && block.developmentProjects.length > 0 && (
              <DevelopmentProjectsPanel projects={block.developmentProjects} />
            )}

            {/* Facility Summary - compact in overview */}
            {block.facilityData && (
              <Card className="glass-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setActiveTab("facilities-hse"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold">Estado das Instalações</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>Eficiência: <span className="font-mono font-bold text-success">{block.facilityData.overallEfficiency}%</span></span>
                        <span>·</span>
                        <span>{block.facilityData.activeWells.op + block.facilityData.activeWells.wi + block.facilityData.activeWells.gi} poços activos</span>
                        <span>·</span>
                        <span>{block.facilityData.areas.length} áreas</span>
                        {block.facilityData.platformSpecs && <><span>·</span><span>{block.facilityData.platformSpecs.length} plataformas</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary shrink-0">
                    Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Consortium content moved to econ-financial tab */}

          {/* Tab 3: Exploração */}
          <TabsContent value="exploration" className="space-y-4 2xl:space-y-6">
            {block.seismicData && block.seismicData.length > 0 ? (
              <>
                <div className="flex items-center justify-end">
                  <ToggleGroup type="single" value={explorationBarMode} onValueChange={v => v && setExplorationBarMode(v as "grouped" | "stacked")} size="sm" className="glass-card border border-border/50 p-0.5 rounded-lg">
                    <ToggleGroupItem value="grouped" aria-label="Barras agrupadas" className="text-xs gap-1.5 px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary">
                      <AlignHorizontalJustifyStart className="w-3.5 h-3.5" />Agrupadas
                    </ToggleGroupItem>
                    <ToggleGroupItem value="stacked" aria-label="Barras empilhadas" className="text-xs gap-1.5 px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary">
                      <AlignVerticalJustifyStart className="w-3.5 h-3.5" />Empilhadas
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
                <ChartWrapper title="Dados Sísmicos (km)" height={400} fullscreenHeight={650}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={block.seismicData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={50} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v.toLocaleString()}`} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(val: number, name: string) => [`${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${name === "2D" ? "km" : "km²"}`, name]} />
                        <Legend wrapperStyle={legendStyle} />
                        <Bar dataKey="seismic2D" name="2D" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "a" : undefined} animationDuration={800} animationEasing="ease-out" />
                        <Bar dataKey="seismic3D" name="3D" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "a" : undefined} animationDuration={800} animationEasing="ease-out" animationBegin={200} />
                        <Bar dataKey="seismic4D" name="4D" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "a" : undefined} animationDuration={800} animationEasing="ease-out" animationBegin={400} />
                        {block.seismicData.length > 15 && <Brush dataKey="year" height={25} stroke="hsl(var(--primary))" fill="hsl(var(--muted))" travellerWidth={8} />}
                      </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {block.wellsData && block.wellsData.length > 0 && (
                  <ChartWrapper title="Poços Perfurados" height={400} fullscreenHeight={650}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={block.wellsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={50} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(val: number, name: string) => [`${val} poços`, name]} />
                          <Legend wrapperStyle={legendStyle} />
                          <Bar dataKey="pesquisa" name="Pesquisa" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "b" : undefined} animationDuration={800} animationEasing="ease-out">
                            {explorationBarMode === "stacked" && <LabelList dataKey="pesquisa" position="center" fill="#fff" fontSize={9} fontWeight="bold" formatter={(v: number) => v > 0 ? v : ""} style={{ textShadow: "0 0 3px rgba(0,0,0,0.7)" }} />}
                          </Bar>
                          <Bar dataKey="avaliacao" name="Avaliação" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "b" : undefined} animationDuration={800} animationEasing="ease-out" animationBegin={150}>
                            {explorationBarMode === "stacked" && <LabelList dataKey="avaliacao" position="center" fill="#fff" fontSize={9} fontWeight="bold" formatter={(v: number) => v > 0 ? v : ""} style={{ textShadow: "0 0 3px rgba(0,0,0,0.7)" }} />}
                          </Bar>
                          <Bar dataKey="descobertaComercial" name="Desc. Comercial" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "b" : undefined} animationDuration={800} animationEasing="ease-out" animationBegin={300}>
                            {explorationBarMode === "stacked" && <LabelList dataKey="descobertaComercial" position="center" fill="#fff" fontSize={9} fontWeight="bold" formatter={(v: number) => v > 0 ? v : ""} style={{ textShadow: "0 0 3px rgba(0,0,0,0.7)" }} />}
                          </Bar>
                          <Bar dataKey="descobertaNaoComercial" name="Desc. N. Comercial" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "b" : undefined} animationDuration={800} animationEasing="ease-out" animationBegin={450}>
                            {explorationBarMode === "stacked" && <LabelList dataKey="descobertaNaoComercial" position="center" fill="#fff" fontSize={9} fontWeight="bold" formatter={(v: number) => v > 0 ? v : ""} style={{ textShadow: "0 0 3px rgba(0,0,0,0.7)" }} />}
                          </Bar>
                          <Bar dataKey="seco" name="Seco" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} stackId={explorationBarMode === "stacked" ? "b" : undefined} animationDuration={800} animationEasing="ease-out" animationBegin={600}>
                            {explorationBarMode === "stacked" && <LabelList dataKey="seco" position="center" fill="#fff" fontSize={9} fontWeight="bold" formatter={(v: number) => v > 0 ? v : ""} style={{ textShadow: "0 0 3px rgba(0,0,0,0.7)" }} />}
                          </Bar>
                          {block.wellsData.length > 20 && <Brush dataKey="year" height={25} stroke="hsl(var(--primary))" fill="hsl(var(--muted))" travellerWidth={8} />}
                        </BarChart>
                      </ResponsiveContainer>
                  </ChartWrapper>
                )}
              </div>
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Dados de exploração detalhados não disponíveis para este bloco.</p>
                  <p className="text-xs text-muted-foreground mt-1">Dados sísmicos e de poços serão adicionados conforme disponibilização pela ANPG.</p>
                </CardContent>
              </Card>
            )}

            {block.geologicalObjectives && block.geologicalObjectives.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base">Objectivos Geológicos</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {block.geologicalObjectives.map(obj => (
                      <Badge key={obj} variant="outline" className="text-xs bg-primary/5">{obj}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exploration Summary */}
            {block.explorationSummary && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><Crosshair className="w-4 h-4 text-primary" />Resumo da Exploração</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {block.explorationSummary.totalSeismic2DKm != null && (
                      <div className="glass-card rounded-lg p-3 text-center">
                        <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Sísmica 2D <InfoTooltip text={tooltipDescriptions["Sísmica 2D"]} /></div>
                        <div className="text-lg font-bold font-mono">{block.explorationSummary.totalSeismic2DKm.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">km</div>
                      </div>
                    )}
                    {block.explorationSummary.totalSeismic3DKm2 != null && (
                      <div className="glass-card rounded-lg p-3 text-center">
                        <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Sísmica 3D <InfoTooltip text={tooltipDescriptions["Sísmica 3D"]} /></div>
                        <div className="text-lg font-bold font-mono">{block.explorationSummary.totalSeismic3DKm2.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">km²</div>
                      </div>
                    )}
                    {block.explorationSummary.totalSeismic4DKm2 != null && (
                      <div className="glass-card rounded-lg p-3 text-center">
                        <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Sísmica 4D <InfoTooltip text={tooltipDescriptions["Sísmica 4D"]} /></div>
                        <div className="text-lg font-bold font-mono">{block.explorationSummary.totalSeismic4DKm2.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">km²</div>
                      </div>
                    )}
                    {block.explorationSummary.stooipMMBO != null && (
                      <div className="glass-card rounded-lg p-3 text-center">
                        <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Recurso Descoberto <InfoTooltip text="Volume total de recursos descobertos — STOOIP (óleo) e GIIP (gás) — estimado in-situ" /></div>
                        <div className="text-lg font-bold font-mono text-warning">{block.explorationSummary.stooipMMBO.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">MMBO (STOOIP)</div>
                        {block.explorationSummary.giipBCF != null && block.explorationSummary.giipBCF > 0 && (
                          <>
                            <div className="text-base font-bold font-mono text-success mt-1">{block.explorationSummary.giipBCF.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">BCF (GIIP)</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="glass-card rounded-lg p-3">
                      <div className="text-[9px] uppercase text-muted-foreground mb-1 flex items-center gap-1">Poços Perfurados <InfoTooltip text={tooltipDescriptions["Poços Perfurados"]} /></div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold font-mono">{(block.explorationSummary.totalWellsPesquisa || 0) + (block.explorationSummary.totalWellsAvaliacao || 0)}</span>
                        <span className="text-[10px] text-muted-foreground">({block.explorationSummary.totalWellsPesquisa} pesq. + {block.explorationSummary.totalWellsAvaliacao} aval.)</span>
                      </div>
                    </div>
                    <div className="glass-card rounded-lg p-3">
                      <div className="text-[9px] uppercase text-muted-foreground mb-1 flex items-center gap-1">Resultados <InfoTooltip text={tooltipDescriptions["Resultados"]} /></div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-success font-bold font-mono">{block.explorationSummary.commercialDiscoveries}</span><span className="text-muted-foreground">com.</span>
                        <span className="text-warning font-bold font-mono">{block.explorationSummary.nonCommercialDiscoveries}</span><span className="text-muted-foreground">n/com.</span>
                        <span className="text-danger font-bold font-mono">{block.explorationSummary.dryWells}</span><span className="text-muted-foreground">secos</span>
                      </div>
                    </div>
                    {block.explorationSummary.geologicalSuccessRate != null && (
                      <div className="glass-card rounded-lg p-3">
                        <div className="text-[9px] uppercase text-muted-foreground mb-1 flex items-center gap-1">Taxa de Sucesso <InfoTooltip text={tooltipDescriptions["Taxa de Sucesso"]} /></div>
                        <div className="text-base font-bold font-mono text-success">{block.explorationSummary.geologicalSuccessRate}%</div>
                      </div>
                    )}
                  </div>
                  {block.explorationSummary.geologicalTargets && (
                    <div className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">Objectivos geológicos:</span> {block.explorationSummary.geologicalTargets}
                    </div>
                  )}
                  {block.explorationSummary.complexity && block.explorationSummary.complexity.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" /> Complexidade</div>
                      {block.explorationSummary.complexity.map((c, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4">› {c}</p>
                      ))}
                    </div>
                  )}
                  {block.explorationSummary.prospectivityNote && (
                    <div className="glass-card rounded-lg p-3 border-l-2 border-primary">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">Recurso Prospectivo</div>
                      {(block.explorationSummary.prospectivitySTOOIPMMBOE != null || block.explorationSummary.prospectivityGIIPBCF != null) && (
                        <div className="flex items-center gap-4 mb-2">
                          {block.explorationSummary.prospectivitySTOOIPMMBOE != null && (
                            <div>
                              <span className="text-lg font-bold font-mono text-warning">{block.explorationSummary.prospectivitySTOOIPMMBOE.toLocaleString()}</span>
                              <span className="text-[10px] text-muted-foreground ml-1">MMBO (STOOIP)</span>
                            </div>
                          )}
                          {block.explorationSummary.prospectivityGIIPBCF != null && block.explorationSummary.prospectivityGIIPBCF > 0 && (
                            <div>
                              <span className="text-lg font-bold font-mono text-success">{block.explorationSummary.prospectivityGIIPBCF.toLocaleString()}</span>
                              <span className="text-[10px] text-muted-foreground ml-1">BCF (GIIP)</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed">{block.explorationSummary.prospectivityNote}</p>
                      {block.explorationSummary.explorationCostsUSD != null && (
                        <div className="mt-2 text-xs">Custos de Exploração: <span className="font-bold font-mono text-foreground">US$ {(block.explorationSummary.explorationCostsUSD / 1e9).toFixed(1)} mil milhões</span></div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Prospects Summary */}
            <ProspectsSummary blocks={[block]} scopeLabel={block.name} />

            {/* Prospects Table */}
            <ProspectsTable blocks={[block]} scopeLabel={block.name} />

            {/* Exploration Challenges */}
            {block.explorationChallenges && block.explorationChallenges.length > 0 && (
              <ExplorationChallengesPanel challenges={block.explorationChallenges} blockName={block.name} />
            )}

          </TabsContent>

          {/* Tab 4: Produção */}
           <TabsContent value="prod-proj" className="space-y-4 2xl:space-y-6">
             {/* Production KPIs */}
             {(() => {
               const producingFields = block.fields?.filter(f => f.status === "Producing") || [];
               const totalPeak = producingFields.reduce((s, f) => s + (f.peakProduction || 0), 0);
               const peakVsActual = totalPeak > 0 ? ((block.dailyProduction / totalPeak) * 100).toFixed(1) : "N/A";
               const history = block.productionHistory || [];
               const declineRate = history.length >= 2
                 ? (((history[0].value - history[history.length - 1].value) / history[0].value) * 100).toFixed(1)
                 : "N/A";
               return (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <Card className="glass-card">
                     <CardContent className="p-4 flex flex-col items-center text-center">
                        <Gauge className="w-5 h-5 text-primary mb-1" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">Produção Actual {tooltipDescriptions["Produção Actual (Bloco)"] && <InfoTooltip text={tooltipDescriptions["Produção Actual (Bloco)"]} />}</span>
                       <span className="text-lg font-bold text-foreground">{block.dailyProduction.toLocaleString()}</span>
                       <span className="text-[10px] text-muted-foreground">BOPD</span>
                     </CardContent>
                   </Card>
                   <Card className="glass-card">
                     <CardContent className="p-4 flex flex-col items-center text-center">
                        <TrendingUp className="w-5 h-5 text-warning mb-1" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">Actual vs Pico {tooltipDescriptions["Actual vs Pico"] && <InfoTooltip text={tooltipDescriptions["Actual vs Pico"]} />}</span>
                       <span className="text-lg font-bold text-foreground">{peakVsActual}%</span>
                       <span className="text-[10px] text-muted-foreground">do pico agregado</span>
                     </CardContent>
                   </Card>
                   <Card className="glass-card">
                     <CardContent className="p-4 flex flex-col items-center text-center">
                        <Layers className="w-5 h-5 text-success mb-1" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">Campos em Produção {tooltipDescriptions["Campos em Produção"] && <InfoTooltip text={tooltipDescriptions["Campos em Produção"]} />}</span>
                       <span className="text-lg font-bold text-foreground">{producingFields.length}</span>
                       <span className="text-[10px] text-muted-foreground">de {block.fields?.length || 0} total</span>
                     </CardContent>
                   </Card>
                   <Card className="glass-card">
                     <CardContent className="p-4 flex flex-col items-center text-center">
                        <Activity className="w-5 h-5 text-danger mb-1" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">Taxa de Declínio {tooltipDescriptions["Taxa de Declínio"] && <InfoTooltip text={tooltipDescriptions["Taxa de Declínio"]} />}</span>
                       <span className="text-lg font-bold text-foreground">{declineRate}{typeof declineRate === "string" && declineRate !== "N/A" ? "" : ""}%</span>
                       <span className="text-[10px] text-muted-foreground">12 meses</span>
                     </CardContent>
                   </Card>
                 </div>
               );
             })()}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
              <ChartWrapper title="Tendência de Produção (12 meses)" height={360} fullscreenHeight={600}>
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={block.productionHistory}>
                      <defs>
                        <linearGradient id={prodGradId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(val: number) => [`${val.toLocaleString()} BOPD`, "Produção"]} />
                      {avgProduction > 0 && (
                        <ReferenceLine y={avgProduction} stroke="hsl(var(--warning))" strokeDasharray="6 4" strokeWidth={1.5}
                          label={{ value: `Média: ${(avgProduction / 1000).toFixed(1)}k`, position: "insideTopRight", fill: "hsl(var(--warning))", fontSize: 10 }} />
                      )}
                      <Area type="monotone" dataKey="value" stroke="hsl(152, 69%, 40%)" fill={`url(#${prodGradId})`} strokeWidth={2} animationDuration={1000} animationEasing="ease-out" />
                    </AreaChart>
                  </ResponsiveContainer>
              </ChartWrapper>

              <ChartWrapper title="CAPEX: Planeado vs Real ($M)" height={360} fullscreenHeight={600}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={block.capexHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${v}M`} />
                      <Tooltip contentStyle={tooltipStyle}
                        formatter={(val: number, name: string) => [`$${val.toLocaleString()}M`, name]} />
                      <Legend wrapperStyle={legendStyle} />
                      {avgCapexPlanned > 0 && (
                        <ReferenceLine y={avgCapexPlanned} stroke="hsl(var(--primary))" strokeDasharray="6 4" strokeWidth={1.5}
                          label={{ value: `Média: $${avgCapexPlanned}M`, position: "insideTopRight", fill: "hsl(var(--primary))", fontSize: 10 }} />
                      )}
                      <Bar dataKey="planned" name="Planeado" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
                      <Bar dataKey="actual" name="Real" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" animationBegin={200} />
                    </BarChart>
                  </ResponsiveContainer>
              </ChartWrapper>
             </div>

             {/* Produção por Campo (Donut) + Projecções compactas */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
               {block.fields && block.fields.length > 0 && (
                 <ChartWrapper title="Produção por Campo" height={320} fullscreenHeight={550}>
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={block.fields.filter(f => (f.peakProduction || 0) > 0).map(f => ({ name: f.name, value: f.peakProduction || 0 }))}
                         cx="50%" cy="50%" innerRadius="45%" outerRadius="75%"
                         dataKey="value" paddingAngle={2}
                         animationDuration={800} animationEasing="ease-out"
                       >
                         {block.fields.filter(f => (f.peakProduction || 0) > 0).map((_, i) => (
                           <Cell key={i} fill={CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={tooltipStyle}
                         formatter={(val: number) => [`${val.toLocaleString()} BOPD`, "Pico"]} />
                       <Legend wrapperStyle={legendStyle} />
                     </PieChart>
                   </ResponsiveContainer>
                 </ChartWrapper>
               )}

               <ChartWrapper title="Projecções de Produção (3 Cenários)" height={320} fullscreenHeight={550}>
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={projectionYears}>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                     <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                     <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                     <Tooltip contentStyle={tooltipStyle}
                       formatter={(val: number, name: string) => [`${val.toLocaleString()} BOPD`, name]} />
                     <Legend wrapperStyle={legendStyle} />
                     <Line type="monotone" dataKey="conservative" name="Conservador" stroke="hsl(0, 65%, 42%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                     <Line type="monotone" dataKey="base" name="Base" stroke="hsl(38, 75%, 48%)" strokeWidth={2} dot={false} />
                     <Line type="monotone" dataKey="expansion" name="Expansão" stroke="hsl(152, 50%, 38%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                   </LineChart>
                 </ResponsiveContainer>
               </ChartWrapper>
             </div>

             {/* Tabela de Campos */}
             {block.fields && block.fields.length > 0 && (() => {
               const statusOptions = [...new Set(block.fields.map(f => f.status))];
               const statusLabel = (s: string) =>
                 s === "Producing" ? "Em Produção" : s === "Development" ? "Desenvolvimento" : s === "Discovery" ? "Descoberta" : "Abandonado";
               const filtered = block.fields
                 .filter(f => !fieldStatusFilter || f.status === fieldStatusFilter)
                 .sort((a, b) => (b.peakProduction || 0) - (a.peakProduction || 0));
               return (
                 <Card className="glass-card">
                   <CardHeader className="pb-3">
                     <div className="flex items-center justify-between flex-wrap gap-2">
                       <CardTitle className="text-sm font-bold flex items-center gap-2">
                         <BarChart2 className="w-4 h-4 text-primary" />
                         Campos do Bloco
                         <span className="text-xs font-normal text-muted-foreground ml-1">({filtered.length} de {block.fields.length})</span>
                       </CardTitle>
                       <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1">
                           <Button
                             variant={fieldStatusFilter === null ? "default" : "outline"}
                             size="sm" className="h-7 text-xs px-2"
                             onClick={() => setFieldStatusFilter(null)}
                           >
                             Todos
                           </Button>
                           {statusOptions.map(s => (
                             <Button
                               key={s}
                               variant={fieldStatusFilter === s ? "default" : "outline"}
                               size="sm" className="h-7 text-xs px-2"
                               onClick={() => setFieldStatusFilter(fieldStatusFilter === s ? null : s)}
                             >
                               {statusLabel(s)}
                             </Button>
                           ))}
                         </div>
                       </div>
                     </div>
                   </CardHeader>
                   <CardContent>
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Campo</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead className="text-right">Ano Descoberta</TableHead>
                           <TableHead className="text-right">Pico Produção (BOPD) ↓</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {filtered.map((field, i) => (
                           <TableRow key={i}>
                             <TableCell className="font-medium">{field.name}</TableCell>
                             <TableCell>
                               <Badge variant="outline" className={
                                 field.status === "Producing" ? "bg-success/15 text-success border-success/30" :
                                 field.status === "Development" ? "bg-warning/15 text-warning border-warning/30" :
                                 field.status === "Discovery" ? "bg-primary/15 text-primary border-primary/30" :
                                 "bg-danger/15 text-danger border-danger/30"
                               }>
                                 {statusLabel(field.status)}
                               </Badge>
                             </TableCell>
                             <TableCell className="text-right">{field.discoveryYear || "—"}</TableCell>
                             <TableCell className="text-right font-mono">{field.peakProduction?.toLocaleString() || "—"}</TableCell>
                           </TableRow>
                         ))}
                         {filtered.length === 0 && (
                           <TableRow>
                             <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                               Nenhum campo com este filtro
                             </TableCell>
                           </TableRow>
                         )}
                       </TableBody>
                     </Table>
                   </CardContent>
                 </Card>
               );
             })()}
              {/* Projecções */}
              <div className="pt-2">
                <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />Projecções de Produção (2025–2034)
                </h3>
                <ChartWrapper title="Projecções de Produção (3 Cenários)" height={450} fullscreenHeight={700}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionYears}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={tooltipStyle}
                          formatter={(val: number, name: string) => [`${val.toLocaleString()} BOPD`, name]} />
                        <Legend wrapperStyle={legendStyle} />
                        <Line type="monotone" dataKey="conservative" name="Conservador" stroke="hsl(0, 72%, 51%)" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={1000} />
                        <Line type="monotone" dataKey="base" name="Base" stroke="hsl(199, 89%, 48%)" strokeWidth={2.5} dot={false} animationDuration={1000} animationBegin={200} />
                        <Line type="monotone" dataKey="expansion" name="Expansão" stroke="hsl(152, 69%, 40%)" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={1000} animationBegin={400} />
                      </LineChart>
                    </ResponsiveContainer>
                </ChartWrapper>
              </div>

              {/* Tier Production Profiles */}
              {block.tierProductionProfiles && block.tierProductionProfiles.length > 0 && (
                <TierProductionSection profiles={block.tierProductionProfiles} tooltipStyle={tooltipStyle} legendStyle={legendStyle} />
              )}
              {block.gasBalance && (
                <BlockGasPanel block={block} />
              )}

              {/* Technical Recommendations */}
              {block.technicalRecommendations && block.technicalRecommendations.length > 0 && (
                <TechnicalRecommendationsPanel recommendations={block.technicalRecommendations} blockName={block.name} />
              )}

              {/* Revitalization Scenarios */}
              {block.revitalizationScenarios && block.revitalizationScenarios.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    Cenários de Revitalização
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 2xl:gap-6">
                    {block.revitalizationScenarios.map((scenario, idx) => {
                      const accentColors = [
                        { border: "border-primary/40", icon: "text-primary", bg: "bg-primary/5", tag: "bg-primary/10 text-primary" },
                        { border: "border-warning/40", icon: "text-warning", bg: "bg-warning/5", tag: "bg-warning/10 text-warning" },
                        { border: "border-success/40", icon: "text-success", bg: "bg-success/5", tag: "bg-success/10 text-success" },
                      ];
                      const accent = accentColors[idx % 3];
                      return (
                        <RevitalizationCard key={scenario.id} scenario={scenario} accent={accent} index={idx} />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Development Projects */}
              {block.developmentProjects && block.developmentProjects.length > 0 && (
                <DevelopmentProjectsPanel projects={block.developmentProjects} />
              )}
           </TabsContent>

          {/* Tab: Instalações & HSE */}
          <TabsContent value="facilities-hse" className="space-y-6 2xl:space-y-8">
            {block.facilityData && (
              <>
                <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />Instalações & Facilidades
                </h3>
                <FacilitiesTab facilityData={block.facilityData} />
              </>
            )}

            {/* Equipment Scale Table */}
            {block.equipmentScale && block.equipmentScale.length > 0 && (
              <>
                <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-warning" />Escala de Equipamentos por Área
                </h3>
                <Card className="glass-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="font-semibold text-xs whitespace-nowrap">Área</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Capacidade (BOPD)</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Reservas Orig. (MMBO)</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Prod. Acum. (MMBO)</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Plataformas</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Poços Activos</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Potência (MW)</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Topsides (t)</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Compressores</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Inj. Água (BWPD)</TableHead>
                            <TableHead className="text-right text-xs whitespace-nowrap">Vida Útil</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {block.equipmentScale.map((eq) => (
                            <TableRow key={eq.area} className="hover:bg-muted/30">
                              <TableCell className="font-semibold text-xs whitespace-nowrap">{eq.area}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.designCapacityBOPD?.toLocaleString() ?? eq.capacityBOPD?.toLocaleString() ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.originalReservesMMBO?.toLocaleString() ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.cumulativeProductionMMBO?.toLocaleString() ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.platforms ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.activeWells ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.installedPowerMW ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.topsideWeightTons?.toLocaleString() ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.compressors ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.waterInjectionBWPD?.toLocaleString() ?? "—"}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{eq.lifeEndYear ?? "—"}</TableCell>
                            </TableRow>
                          ))}
                          {/* Totals row */}
                          <TableRow className="bg-muted/50 font-semibold border-t-2 border-border">
                            <TableCell className="text-xs">Total</TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.designCapacityBOPD || e.capacityBOPD || 0), 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.originalReservesMMBO || 0), 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.cumulativeProductionMMBO || 0), 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.platforms || 0), 0)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.activeWells || 0), 0)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.installedPowerMW || 0), 0)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.topsideWeightTons || 0), 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.compressors || 0), 0)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {block.equipmentScale.reduce((s, e) => s + (e.waterInjectionBWPD || 0), 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-xs">—</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
              <Leaf className="w-4 h-4 text-success" />HSE & Ambiente
            </h3>
            <HSEEnvironmentTab
              hseData={block.hseData}
              environmentalData={block.environmentalData}
              facilityData={block.facilityData}
              economicVision={block.economicVision}
              revitalizationScenarios={block.revitalizationScenarios}
            />
          </TabsContent>

          {/* Tab: Análise SWOT */}
          <TabsContent value="swot" className="space-y-4">
            <SwotAnalysis block={block} />
          </TabsContent>

          {/* Tab: Documentos (Legislação + Homologações) */}
          <TabsContent value="documents" className="space-y-6 2xl:space-y-8">
            <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />Documentos & Legislação
            </h3>
            <LegislationSearch docs={block.legislationDocs || []} contractInfo={block.contractInfo} />
            <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2 pt-4">
              <FileText className="w-4 h-4 text-warning" />Homologações
            </h3>
            <HomologacoesPanel filterBloco={block.name} />
          </TabsContent>

          {/* Tab: Estado da Concessão */}
          <TabsContent value="concession-status" className="space-y-4 2xl:space-y-6">
            <ConcessionStatusTab block={block} />
          </TabsContent>

          {/* Tab: Económico & Financeiro (merges Visão Económica + Financeiro + Consórcio) */}
          <TabsContent value="econ-financial" className="space-y-6 2xl:space-y-8">
            {/* Sub-navigation */}
            <div className="sticky top-[57px] z-30 glass-card border border-border/50 rounded-lg p-1.5 flex items-center gap-1 flex-wrap">
              {(block.economicVision || block.economicData) && (
                <button
                  onClick={() => document.getElementById("section-visao-economica")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />Visão Económica
                </button>
              )}
              <button
                onClick={() => document.getElementById("section-resumo-financeiro")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />Resumo Financeiro
              </button>
              <button
                onClick={() => document.getElementById("section-consorcio")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />Consórcio
              </button>
            </div>

            {/* Section 1: Visão Económica ANPG */}
            {(block.economicVision || block.economicData) && (
              <>
                <h3 id="section-visao-economica" className="text-sm 2xl:text-base font-semibold flex items-center gap-2 scroll-mt-28">
                  <Scale className="w-4 h-4 text-primary" />Visão Económica ANPG
                </h3>
                <EconomicVisionTab block={block} />
              </>
            )}

            {/* Section 2: Financeiro & Contratual */}
            {(() => {
              const ci = block.contractInfo;
              const fc = ci?.fiscalConditions;
              const rp = ci?.researchPeriod;
              const totalBonus = (ci?.signatureBonus || 0) + (ci?.socialBonus || 0) + (ci?.productionBonus || 0);
              const investProgress = block.plannedInvestment > 0 ? Math.min((block.accumulatedInvestment / block.plannedInvestment) * 100, 100) : 0;
              const capexTotalPlanned = block.capexHistory.reduce((s, c) => s + c.planned, 0);
              const capexTotalActual = block.capexHistory.reduce((s, c) => s + c.actual, 0);

              return (
                <>
                  {/* Export dropdown */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 id="section-resumo-financeiro" className="text-sm 2xl:text-base font-semibold flex items-center gap-2 scroll-mt-28">
                      <DollarSign className="w-4 h-4 text-warning" />Resumo Financeiro
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Download className="w-3.5 h-3.5" />Exportar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => exportToPdf()} className="gap-2 text-xs cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />PDF (Imprimir)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => { await exportToExcel([block], `financeiro_${block.id}.xlsx`); toast({ title: "Exportado!", description: "Ficheiro Excel gerado com sucesso." }); }} className="gap-2 text-xs cursor-pointer">
                          <FileSpreadsheet className="w-3.5 h-3.5" />Excel (.xlsx)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { exportToCsv([block], `financeiro_${block.id}.csv`); toast({ title: "Exportado!", description: "Ficheiro CSV gerado com sucesso." }); }} className="gap-2 text-xs cursor-pointer">
                          <FileDown className="w-3.5 h-3.5" />CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Section 1: Resumo Financeiro */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 2xl:gap-5">
                      {block.economicVision ? (() => {
                        const ev = block.economicVision;
                        const ed = block.economicData;
                        const invTotal = ed?.investmentPlan?.reduce((s, y) => s + y.exploracao + y.desenvolvimento + (y.operacao || 0), 0) || 0;
                        const invExpl = ed?.investmentPlan?.reduce((s, y) => s + y.exploracao, 0) || 0;
                        const invDev = ed?.investmentPlan?.reduce((s, y) => s + y.desenvolvimento, 0) || 0;
                        const invOps = ed?.investmentPlan?.reduce((s, y) => s + (y.operacao || 0), 0) || 0;
                        const explPct = invTotal ? Math.round((invExpl / invTotal) * 100) : 0;
                        const devPct = invTotal ? Math.round((invDev / invTotal) * 100) : 0;
                        const opsPct = invTotal ? Math.round((invOps / invTotal) * 100) : 0;
                        const tc = ev.technicalCost;
                        const stateRevenue = ev.revenueShare?.reduce((s, r) => s + (r.impostosMMUSD || 0), 0) || 0;
                        const latestPeriod = ev.revenueShare?.[ev.revenueShare.length - 1];
                        const abd = ev.abandonmentDetail;
                        const fundedPct = abd ? Math.round((abd.fundeado / abd.total) * 100) : 0;
                        return (
                          <>
                            {/* Card 1: Investimento Quinquenal */}
                            <Card className="glass-card">
                              <CardContent className="p-4 2xl:p-6">
                                <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  Investimento Quinquenal
                                  <InfoTooltip text="Soma do plano de investimentos 2026-2030 (exploração + desenvolvimento + operação)" />
                                </div>
                                <div className="text-2xl 2xl:text-3xl font-bold font-mono">${invTotal >= 1000 ? (invTotal / 1000).toFixed(1) + "B" : invTotal.toLocaleString() + "M"}</div>
                                <div className="text-[10px] text-muted-foreground mb-2">MMUSD — {ed?.investmentPlan?.length || 0} anos</div>
                                <div className="flex gap-0.5 h-2 w-full rounded-full overflow-hidden">
                                  <div className="bg-primary rounded-l-full" style={{ width: `${explPct}%` }} title={`Exploração ${explPct}%`} />
                                  <div className="bg-chart-2" style={{ width: `${devPct}%` }} title={`Desenvolvimento ${devPct}%`} />
                                  <div className="bg-chart-3 rounded-r-full" style={{ width: `${opsPct}%` }} title={`Operação ${opsPct}%`} />
                                </div>
                                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                                  <span>Expl. {explPct}%</span>
                                  <span>Dev. {devPct}%</span>
                                  <span>Ops. {opsPct}%</span>
                                </div>
                              </CardContent>
                            </Card>
                            {/* Card 2: Custo Técnico */}
                            <Card className="glass-card">
                              <CardContent className="p-4 2xl:p-6">
                                <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  Custo Técnico ($/bbl)
                                  <InfoTooltip text="OPEX e CAPEX por barril — valores de referência do ano corrente" />
                                </div>
                                <div className="text-2xl 2xl:text-3xl font-bold font-mono">${tc?.opex2025 ?? tc?.opexPerBarrel ?? "—"}<span className="text-sm font-normal text-muted-foreground">/bbl</span></div>
                                <div className="text-[10px] text-muted-foreground mb-1">OPEX 2025</div>
                                <div className="space-y-1 mt-2">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">CAPEX/bbl</span>
                                    <span className="font-mono font-semibold">${tc?.capexPerBarrel ?? "—"}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">OPEX/bbl</span>
                                    <span className="font-mono font-semibold">${tc?.opexPerBarrel ?? "—"}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            {/* Card 3: Receita Estado */}
                            <Card className="glass-card">
                              <CardContent className="p-4 2xl:p-6">
                                <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  Receita Estado (Acum.)
                                  <InfoTooltip text="Total acumulado de impostos e participações do Estado em todos os períodos" />
                                </div>
                                <div className="text-2xl 2xl:text-3xl font-bold font-mono text-warning">${stateRevenue >= 1000 ? (stateRevenue / 1000).toFixed(1) + "B" : stateRevenue.toLocaleString() + "M"}</div>
                                <div className="text-[10px] text-muted-foreground">MMUSD — {ev.revenueShare?.length || 0} períodos</div>
                                {latestPeriod && (
                                  <div className="flex justify-between text-[10px] mt-2">
                                    <span className="text-muted-foreground">{latestPeriod.period}</span>
                                    <span className="font-mono font-semibold">{latestPeriod.impostosPercent}% Estado</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            {/* Card 4: Custo de Abandono */}
                            <Card className="glass-card">
                              <CardContent className="p-4 2xl:p-6">
                                <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  Custo de Abandono
                                  <InfoTooltip text="Obrigação total de descomissionamento vs montante já fundeado" />
                                </div>
                                <div className="text-2xl 2xl:text-3xl font-bold font-mono">${abd ? (abd.total >= 1000 ? (abd.total / 1000).toFixed(1) + "B" : abd.total.toLocaleString()) : "—"}<span className="text-sm font-normal text-muted-foreground">M</span></div>
                                <div className="text-[10px] text-muted-foreground mb-2">MMUSD</div>
                                {abd && (
                                  <>
                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                      <div className={`h-full rounded-full transition-all ${fundedPct < 10 ? "bg-danger" : fundedPct < 30 ? "bg-warning" : "bg-success"}`} style={{ width: `${Math.max(fundedPct, 2)}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-1">
                                      <span className={fundedPct < 10 ? "text-danger font-semibold" : "text-muted-foreground"}>{fundedPct}% fundeado</span>
                                      <span className="text-muted-foreground font-mono">${abd.fundeado}M</span>
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </>
                        );
                      })() : (
                        <>
                          <Card className="glass-card">
                            <CardContent className="p-4 2xl:p-6">
                              <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 flex items-center gap-1">Investimento Acum. vs Planeado {tooltipDescriptions["Investimento Acum."] && <InfoTooltip text={tooltipDescriptions["Investimento Acum."]} />}</div>
                              <div className="text-2xl 2xl:text-3xl font-bold font-mono">${(block.accumulatedInvestment / 1000).toFixed(1)}B</div>
                              <div className="text-xs text-muted-foreground mb-2">de ${(block.plannedInvestment / 1000).toFixed(1)}B planeado</div>
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${investProgress}%` }} />
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1 text-right font-mono">{investProgress.toFixed(0)}%</div>
                            </CardContent>
                          </Card>
                          <Card className="glass-card">
                            <CardContent className="p-4 2xl:p-6">
                              <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 flex items-center gap-1">Taxa de Execução</div>
                              <div className="text-2xl 2xl:text-3xl font-bold font-mono">{block.executionRate}%</div>
                              <div className={`text-xs mt-1 ${block.executionRate >= 85 ? "text-success" : block.executionRate >= 70 ? "text-warning" : "text-danger"}`}>
                                {block.executionRate >= 85 ? "Excelente" : block.executionRate >= 70 ? "Moderado" : "Baixo"}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="glass-card">
                            <CardContent className="p-4 2xl:p-6">
                              <div className="text-xs 2xl:text-sm text-muted-foreground mb-2">Bónus Total</div>
                              <div className="text-2xl 2xl:text-3xl font-bold font-mono text-warning">
                                {totalBonus > 0 ? `$${(totalBonus / 1e6).toFixed(0)}M` : "—"}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">Assinatura + Social + Produção</div>
                            </CardContent>
                          </Card>
                          <Card className="glass-card">
                            <CardContent className="p-4 2xl:p-6">
                              <div className="text-xs 2xl:text-sm text-muted-foreground mb-2">Contribuições & P. Sociais</div>
                              <div className="space-y-1">
                                {ci?.socialProjects ? (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">P. Sociais</span>
                                    <span className="font-mono font-semibold">${(ci.socialProjects / 1e6).toFixed(2)}M</span>
                                  </div>
                                ) : null}
                                {ci?.regulatoryContribution ? (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">C. Regulatória</span>
                                    <span className="font-mono font-semibold">${(ci.regulatoryContribution / 1e6).toFixed(2)}M</span>
                                  </div>
                                ) : null}
                                {!ci?.socialProjects && !ci?.regulatoryContribution && (
                                  <div className="text-xs text-muted-foreground">Sem dados</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Evolução CAPEX */}
                  <Card className="glass-card">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />Evolução CAPEX — Planeado vs Real ($M)
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Total Planeado: <span className="font-mono font-semibold text-foreground">${capexTotalPlanned.toLocaleString()}M</span></span>
                          <span>Total Real: <span className="font-mono font-semibold text-primary">${capexTotalActual.toLocaleString()}M</span></span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={block.capexHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                            formatter={(val: number) => [`$${val}M`]} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="planned" name="Planeado" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="actual" name="Real" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Section 2b: Dados Económicos (from PDF) */}
                  {block.economicData && (() => {
                    const eco = block.economicData;
                    return (
                      <>
                        {/* Custos Históricos */}
                        {eco.costHistory && eco.costHistory.length > 0 && (
                          <div>
                            <h3 className="text-sm 2xl:text-base font-semibold mb-3 flex items-center gap-2">
                              <History className="w-4 h-4 text-muted-foreground" />Custos Incorridos & Previsão (MMUSD)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 2xl:gap-5">
                              {eco.costHistory.map(c => (
                                <Card key={c.period} className="glass-card">
                                  <CardContent className="p-4 2xl:p-6">
                                    <div className="text-xs 2xl:text-sm text-muted-foreground mb-2 font-medium">{c.period}</div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <div className="text-[9px] uppercase text-muted-foreground flex items-center gap-1">CAPEX <InfoTooltip text={tooltipDescriptions["CAPEX"]} /></div>
                                        <div className="text-lg 2xl:text-xl font-bold font-mono text-primary">${c.capex.toLocaleString()}</div>
                                      </div>
                                      <div>
                                        <div className="text-[9px] uppercase text-muted-foreground flex items-center gap-1">OPEX <InfoTooltip text={tooltipDescriptions["OPEX"]} /></div>
                                        <div className="text-lg 2xl:text-xl font-bold font-mono text-warning">${c.opex.toLocaleString()}</div>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-2 font-mono">Total: ${(c.capex + c.opex).toLocaleString()}M</div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Plano de Investimentos Quinquenal */}
                        {eco.investmentPlan && eco.investmentPlan.length > 0 && (
                          <Card className="glass-card">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-success" />Plano de Investimentos Quinquenal (MMUSD)
                                </CardTitle>
                                <span className="text-xs text-muted-foreground font-mono">
                                  Total: <span className="font-semibold text-foreground">${eco.investmentPlan.reduce((s, y) => s + y.exploracao + y.desenvolvimento + (y.operacao || 0), 0).toLocaleString()}M</span>
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={eco.investmentPlan}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${v}`} />
                                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number, name: string) => [`$${val}M`, name]} />
                                  <Legend wrapperStyle={legendStyle} />
                                  <Bar dataKey="exploracao" name="Exploração" fill="hsl(199, 89%, 48%)" stackId="invest" radius={[0, 0, 0, 0]} animationDuration={800} />
                                  <Bar dataKey="desenvolvimento" name="Desenvolvimento" fill="hsl(38, 92%, 50%)" stackId="invest" radius={[0, 0, 0, 0]} animationDuration={800} animationBegin={200} />
                                  <Bar dataKey="operacao" name="Operação" fill="hsl(152, 69%, 40%)" stackId="invest" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={400} />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        )}

                        {/* Partilha de Produção GE + Abandono side by side */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 2xl:gap-6">
                          {/* Partilha de Produção GE */}
                          {eco.productionShareGE && eco.productionShareGE.length > 0 && (
                            <Card className="glass-card">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                                    <Droplets className="w-4 h-4 text-primary" />Partilha de Produção GE (MMBO)
                                  </CardTitle>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    Total: <span className="font-semibold text-foreground">{eco.productionShareGE.reduce((s, y) => s + y.mmbo, 0)} MMBO</span>
                                  </span>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={eco.productionShareGE}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val} MMBO`]} />
                                    <Bar dataKey="mmbo" name="Produção GE" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={800} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          )}

                          {/* Abandono & Dívida + KPIs operacionais */}
                          <div className="space-y-4">
                            {eco.abandonment && (
                              <Card className="glass-card">
                                <CardHeader className="p-4 pb-2">
                                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-danger" />Abandono & Fundo de Descomissionamento
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="glass-card rounded-lg p-3 text-center border border-danger/20">
                                      <div className="text-[9px] uppercase text-muted-foreground">Custo Total</div>
                                      <div className="font-bold font-mono text-xl text-danger">${eco.abandonment.total.toLocaleString()}</div>
                                      <div className="text-[9px] text-muted-foreground">MMUSD</div>
                                    </div>
                                    <div className="glass-card rounded-lg p-3 text-center border border-warning/20">
                                      <div className="text-[9px] uppercase text-muted-foreground">Fundeamento</div>
                                      <div className="font-bold font-mono text-xl text-warning">${eco.abandonment.fundingRequired.toLocaleString()}</div>
                                      <div className="text-[9px] text-muted-foreground">MMUSD necessário</div>
                                    </div>
                                    <div className="glass-card rounded-lg p-3 text-center border border-success/20">
                                      <div className="text-[9px] uppercase text-muted-foreground">Depositado</div>
                                      <div className="font-bold font-mono text-xl text-success">${eco.abandonment.fundingDeposited.toLocaleString()}</div>
                                      <div className="text-[9px] text-muted-foreground">MMUSD</div>
                                    </div>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="mt-3">
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                      <span>Progresso do fundo</span>
                                      <span className="font-mono">{((eco.abandonment.fundingDeposited / eco.abandonment.fundingRequired) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${Math.min((eco.abandonment.fundingDeposited / eco.abandonment.fundingRequired) * 100, 100)}%` }} />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* KPIs operacionais */}
                            <div className="grid grid-cols-2 gap-3">
                              {eco.opexPerBarrel != null && (
                                <Card className="glass-card">
                                  <CardContent className="p-4 text-center">
                                    <div className="text-[9px] uppercase text-muted-foreground mb-1 flex items-center gap-1">OPEX/Barril ({eco.opexPerBarrelYear}) <InfoTooltip text={tooltipDescriptions["OPEX/Barril"]} /></div>
                                    <div className="text-2xl font-bold font-mono text-warning">${eco.opexPerBarrel}</div>
                                    <div className="text-[9px] text-muted-foreground">USD/bbl</div>
                                  </CardContent>
                                </Card>
                              )}
                              {eco.sonangolDebt != null && (
                                <Card className="glass-card">
                                  <CardContent className="p-4 text-center">
                                    <div className="text-[9px] uppercase text-muted-foreground mb-1">Dívida Sonangol</div>
                                    <div className="text-2xl font-bold font-mono text-danger">${eco.sonangolDebt}</div>
                                    <div className="text-[9px] text-muted-foreground">MMUSD</div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>

                            {/* Receitas do Estado */}
                            {eco.stateRevenueShare && eco.stateRevenueShare.length > 0 && (
                              <Card className="glass-card">
                                <CardContent className="p-4">
                                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Receitas do Estado</div>
                                  <div className="space-y-2">
                                    {eco.stateRevenueShare.map(s => (
                                      <div key={s.period} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0 text-sm">
                                        <span className="text-muted-foreground">{s.period}</span>
                                        <span className="font-mono font-bold">{s.percentage}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>

                        {/* Observações Estratégicas */}
                        {eco.observations && eco.observations.length > 0 && (
                          <Card className="glass-card border-l-2 border-warning">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-warning" />Observações Estratégicas
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <ul className="space-y-2">
                                {eco.observations.map((obs, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                                    {obs}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    );
                  })()}

                  {/* Section 3 & 4: Estrutura Contratual + Condições Fiscais */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 2xl:gap-6">
                    {/* Estrutura Contratual */}
                    <Card className="glass-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-warning" />Estrutura Contratual
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-4">
                        <div className="space-y-2">
                          {[
                            ci?.decretoLei && { label: "Decreto-Lei", value: ci.decretoLei },
                            ci?.contractType && { label: "Tipo de Contrato", value: ci.contractType },
                            ci?.signingDate && { label: "Data de Assinatura", value: new Date(ci.signingDate).toLocaleDateString("pt-AO", { year: "numeric", month: "long", day: "numeric" }) },
                            ci?.effectiveDate && { label: "Data Efectiva", value: new Date(ci.effectiveDate).toLocaleDateString("pt-AO", { year: "numeric", month: "long", day: "numeric" }) },
                            ci?.location && { label: "Localização", value: ci.location },
                            ci?.productionPeriodStart && ci?.productionPeriodEnd && {
                              label: "Período de Produção",
                              value: `${new Date(ci.productionPeriodStart).getFullYear()} — ${new Date(ci.productionPeriodEnd).getFullYear()}`
                            },
                          ].filter(Boolean).map((item: any) => (
                            <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                              <span className="text-xs 2xl:text-sm text-muted-foreground">{item.label}</span>
                              <span className="text-sm font-medium text-right max-w-[60%]">{item.value}</span>
                            </div>
                          ))}
                          {!ci && <div className="text-xs text-muted-foreground">Dados contratuais não disponíveis.</div>}
                        </div>

                        {/* GE Inicial */}
                        {ci?.initialConsortium && ci.initialConsortium.length > 0 && (
                          <div>
                            <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                              <Building2 className="w-3 h-3" /> GE Inicial (Consórcio Original)
                            </div>
                            <div className="space-y-1">
                              {ci.initialConsortium.map(p => (
                                <div key={p.name} className="flex justify-between items-center py-1 text-xs 2xl:text-sm">
                                  <span className="text-muted-foreground">{p.name} {p.isOperator && <Badge variant="outline" className="text-[8px] ml-1 py-0 px-1">Op.</Badge>}</span>
                                  <span className="font-mono font-semibold">{p.share.toFixed(2)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Períodos de Pesquisa */}
                        {rp && (
                          <div>
                            <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Períodos de Pesquisa</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="glass-card rounded-lg p-3">
                                <div className="text-[9px] uppercase text-muted-foreground">Fase Inicial</div>
                                <div className="font-bold font-mono text-lg">{rp.initialPhaseYears} <span className="text-xs font-normal text-muted-foreground">anos</span></div>
                                <div className="text-[10px] text-muted-foreground">{rp.initialPhaseWells} poços obrigatórios</div>
                              </div>
                              <div className="glass-card rounded-lg p-3">
                                <div className="text-[9px] uppercase text-muted-foreground">Fase Subsequente</div>
                                <div className="font-bold font-mono text-lg">{rp.subsequentPhaseYears} <span className="text-xs font-normal text-muted-foreground">anos</span></div>
                                <div className="text-[10px] text-muted-foreground">{rp.subsequentPhaseWells} poços obrigatórios</div>
                              </div>
                            </div>
                            {rp.seismic3dKm2 && (
                              <div className="text-xs text-muted-foreground mt-2">
                                Obrigação Sísmica 3D: <span className="font-mono font-medium text-foreground">{rp.seismic3dKm2.toLocaleString()} km²</span>
                                {rp.seismic3dReprocKm2 && <span> | Reproc.: <span className="font-mono font-medium text-foreground">{rp.seismic3dReprocKm2.toLocaleString()} km²</span></span>}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Condições Fiscais */}
                    <Card className="glass-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                          <Scale className="w-4 h-4 text-primary" />Condições Fiscais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-4">
                        {fc ? (
                          <>
                            {/* Cost Recovery */}
                            {(fc.costRecoveryPreProd != null || fc.costRecoveryPostProd != null) && (
                              <div>
                                <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1">Cost Recovery <InfoTooltip text={tooltipDescriptions["Cost Recovery"]} /></div>
                                <div className="grid grid-cols-2 gap-2">
                                  {fc.costRecoveryPreProd != null && (
                                    <div className="glass-card rounded-lg p-3 text-center">
                                      <div className="text-[9px] uppercase text-muted-foreground">Pré-Produção</div>
                                      <div className="font-bold font-mono text-xl text-warning">{fc.costRecoveryPreProd}%</div>
                                    </div>
                                  )}
                                  {fc.costRecoveryPostProd != null && (
                                    <div className="glass-card rounded-lg p-3 text-center">
                                      <div className="text-[9px] uppercase text-muted-foreground">Pós-Produção</div>
                                      <div className="font-bold font-mono text-xl text-warning">{fc.costRecoveryPostProd}%</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* IRP / IPP / ITP */}
                            <div>
                              <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Impostos</div>
                              <div className="grid grid-cols-3 gap-2">
                                {fc.irp != null && (
                                  <div className="glass-card rounded-lg p-3 text-center border border-primary/20">
                                    <div className="text-[9px] uppercase text-muted-foreground flex items-center gap-0.5">IRP <InfoTooltip text={tooltipDescriptions["IRP"]} /></div>
                                    <div className="font-bold font-mono text-2xl text-primary">{fc.irp}%</div>
                                    <div className="text-[8px] text-muted-foreground">Rend. Petróleo</div>
                                  </div>
                                )}
                                {fc.ipp != null && (
                                  <div className="glass-card rounded-lg p-3 text-center">
                                    <div className="text-[9px] uppercase text-muted-foreground flex items-center gap-0.5">IPP <InfoTooltip text={tooltipDescriptions["IPP"]} /></div>
                                    <div className="font-bold font-mono text-2xl">{fc.ipp}%</div>
                                    <div className="text-[8px] text-muted-foreground">Prod. Petróleo</div>
                                  </div>
                                )}
                                {fc.itp != null && (
                                  <div className="glass-card rounded-lg p-3 text-center">
                                    <div className="text-[9px] uppercase text-muted-foreground flex items-center gap-0.5">ITP <InfoTooltip text={tooltipDescriptions["ITP"]} /></div>
                                    <div className="font-bold font-mono text-2xl">{fc.itp}%</div>
                                    <div className="text-[8px] text-muted-foreground">Trans. Petróleo</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Prémios */}
                            {(fc.productionPremium != null || fc.investmentPremiumAreaA != null) && (
                              <div className="space-y-1.5">
                                <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground font-medium">Prémios</div>
                                {fc.productionPremium != null && (
                                  <div className="flex justify-between py-1 border-b border-border/30 text-xs">
                                    <span className="text-muted-foreground">Prémio de Produção</span>
                                    <span className="font-mono font-semibold">{fc.productionPremium} USD/bbl</span>
                                  </div>
                                )}
                                {fc.investmentPremiumAreaA != null && (
                                  <div className="flex justify-between py-1 border-b border-border/30 text-xs">
                                    <span className="text-muted-foreground">Prémio Invest. (Área A / B)</span>
                                    <span className="font-mono font-semibold">{fc.investmentPremiumAreaA}% / {fc.investmentPremiumAreaB}%</span>
                                  </div>
                                )}
                                {fc.investmentPremiumReduction && (
                                  <div className="text-[10px] text-muted-foreground italic">{fc.investmentPremiumReduction}</div>
                                )}
                              </div>
                            )}

                            {/* Notes */}
                            {fc.irpNoteAngolan && (
                              <div className="glass-card rounded-lg p-3 border-l-2 border-warning">
                                <div className="text-[10px] uppercase text-muted-foreground mb-1 font-medium">Nota Especial</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{fc.irpNoteAngolan}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">Condições fiscais não disponíveis para este bloco.</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Section 5: Bónus & Obrigações */}
                  {ci && (ci.signatureBonus || ci.socialBonus || ci.productionBonus || ci.socialProjects || ci.regulatoryContribution) && (
                    <div>
                      <h3 className="text-sm 2xl:text-base font-semibold mb-3 flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-warning" />Bónus & Obrigações
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 2xl:gap-5">
                        {ci.signatureBonus && (
                          <Card className="glass-card border-l-2 border-warning">
                            <CardContent className="p-4">
                              <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Bónus de Assinatura</div>
                              <div className="text-xl 2xl:text-2xl font-bold font-mono text-warning">US$ {(ci.signatureBonus / 1e6).toFixed(0)}M</div>
                              {ci.signingDate && <div className="text-[10px] text-muted-foreground mt-1">Pago em {new Date(ci.signingDate).getFullYear()}</div>}
                            </CardContent>
                          </Card>
                        )}
                        {ci.socialBonus && (
                          <Card className="glass-card border-l-2 border-success">
                            <CardContent className="p-4">
                              <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Bónus Social</div>
                              <div className="text-xl 2xl:text-2xl font-bold font-mono text-success">US$ {(ci.socialBonus / 1e6).toFixed(0)}M</div>
                            </CardContent>
                          </Card>
                        )}
                        {ci.productionBonus && (
                          <Card className="glass-card border-l-2 border-primary">
                            <CardContent className="p-4">
                              <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Bónus de Produção</div>
                              <div className="text-xl 2xl:text-2xl font-bold font-mono text-primary">US$ {(ci.productionBonus / 1e6).toFixed(0)}M</div>
                            </CardContent>
                          </Card>
                        )}
                        {ci.socialProjects && (
                          <Card className="glass-card">
                            <CardContent className="p-4">
                              <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Projectos Sociais</div>
                              <div className="text-lg font-bold font-mono">US$ {(ci.socialProjects / 1e6).toFixed(2)}M</div>
                              {ci.socialProjectsPeriod && <div className="text-[10px] text-muted-foreground mt-1">Período: {ci.socialProjectsPeriod}</div>}
                            </CardContent>
                          </Card>
                        )}
                        {ci.regulatoryContribution && (
                          <Card className="glass-card">
                            <CardContent className="p-4">
                              <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-1">Contribuição Regulatória</div>
                              <div className="text-lg font-bold font-mono">US$ {(ci.regulatoryContribution / 1e6).toFixed(2)}M</div>
                              {ci.regulatoryContributionPeriod && <div className="text-[10px] text-muted-foreground mt-1">Período: {ci.regulatoryContributionPeriod}</div>}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 6: Notas Históricas */}
                  {ci?.historicalNotes && ci.historicalNotes.length > 0 && (
                    <Card className="glass-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                          <History className="w-4 h-4 text-muted-foreground" />Notas Históricas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="relative pl-6 space-y-4">
                          <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
                          {ci.historicalNotes.map((note, i) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                              <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}

            {/* Section: Consórcio */}
            <h3 id="section-consorcio" className="text-sm 2xl:text-base font-semibold flex items-center gap-2 pt-4 scroll-mt-28">
              <Users className="w-4 h-4 text-primary" />Composição do Consórcio
            </h3>

            {/* GE Inicial → GE Actual comparative */}
            {block.contractInfo?.initialConsortium && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base flex items-center gap-2"><History className="w-4 h-4 text-primary" />Evolução do Grupo Empreiteiro</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 items-start">
                    {/* GE Inicial */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <span className="text-xs 2xl:text-sm font-semibold uppercase tracking-wider text-muted-foreground">GE Inicial</span>
                        {block.contractInfo.signingDate && <span className="text-[10px] text-muted-foreground">({new Date(block.contractInfo.signingDate).getFullYear()})</span>}
                      </div>
                      {block.contractInfo.initialConsortium.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0 opacity-50" style={{ backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p.name}</span>
                              {p.isOperator && <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/30 py-0 px-1">Op.</Badge>}
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                              <div className="h-full rounded-full opacity-50" style={{ width: `${p.share}%`, backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold w-14 text-right text-muted-foreground">{p.share.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex flex-col items-center justify-center gap-2 py-8">
                      <div className="w-px h-8 bg-border" />
                      <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center border border-primary/30">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">Evolução</span>
                    </div>
                    <div className="lg:hidden flex items-center justify-center py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-px w-12 bg-border" />
                        <ArrowRight className="w-4 h-4 text-primary rotate-90 lg:rotate-0" />
                        <div className="h-px w-12 bg-border" />
                      </div>
                    </div>

                    {/* GE Actual */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs 2xl:text-sm font-semibold uppercase tracking-wider text-primary">GE Actual</span>
                        <span className="text-[10px] text-muted-foreground">(Presente)</span>
                      </div>
                      {block.concession.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{p.name}</span>
                              {p.isOperator && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">Operador</Badge>}
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${p.share}%`, backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold w-14 text-right">{p.share.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <InstitutionalFooter />
    </div>
  );
};

export default BlockPage;
