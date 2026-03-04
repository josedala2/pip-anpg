import { useParams, useNavigate } from "react-router-dom";
import { oilBlocks } from "@/data/angolaBlocks";
import { ProspectsTable } from "@/components/dashboard/ProspectsTable";
import { ProspectsSummary } from "@/components/dashboard/ProspectsSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Droplets, DollarSign, ShieldCheck, TrendingUp, Users, Activity, Target, Layers, BarChart3, MapPin, Brain, FileText, Landmark, Building2, Clock, Scale, ArrowRight, History } from "lucide-react";
import { SwotAnalysis } from "@/components/dashboard/SwotAnalysis";
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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

const BlockPage = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const block = oilBlocks.find(b => b.id === blockId);

  if (!block) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Bloco não encontrado</h2>
          <p className="text-muted-foreground mb-4">O bloco "{blockId}" não existe na base de dados.</p>
          <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao Dashboard</Button>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center gap-4">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="gap-2">
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
      <main className="max-w-[1920px] mx-auto p-4 2xl:p-8 space-y-4 2xl:space-y-6">
         <Tabs defaultValue="overview" className="space-y-4 2xl:space-y-6">
           <TabsList className="glass-card p-1 2xl:p-1.5 h-auto flex-wrap">
             <TabsTrigger value="overview" className="gap-1.5 text-xs 2xl:text-sm"><Activity className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Visão Geral</TabsTrigger>
             <TabsTrigger value="consortium" className="gap-1.5 text-xs 2xl:text-sm"><Users className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Consórcio</TabsTrigger>
             <TabsTrigger value="exploration" className="gap-1.5 text-xs 2xl:text-sm"><Target className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Exploração</TabsTrigger>
             <TabsTrigger value="production" className="gap-1.5 text-xs 2xl:text-sm"><BarChart3 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Produção</TabsTrigger>
             <TabsTrigger value="projections" className="gap-1.5 text-xs 2xl:text-sm"><TrendingUp className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Projecções</TabsTrigger>
             <TabsTrigger value="swot" className="gap-1.5 text-xs 2xl:text-sm"><Brain className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />Análise SWOT</TabsTrigger>
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

                    {/* GE Inicial mini-table */}
                    {block.contractInfo.initialConsortium && (
                      <div className="mt-2">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" /> GE Inicial
                        </div>
                        <div className="space-y-1">
                          {block.contractInfo.initialConsortium.map(p => (
                            <div key={p.name} className="flex justify-between items-center py-1 text-xs 2xl:text-sm">
                              <span className="text-muted-foreground">{p.name} {p.isOperator && <Badge variant="outline" className="text-[8px] ml-1 py-0 px-1">Op.</Badge>}</span>
                              <span className="font-mono font-semibold">{p.share.toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                    {/* Decade summary bar */}
                    <div className="flex items-center gap-1">
                      {Object.entries(decades).sort(([a], [b]) => a.localeCompare(b)).map(([decade, count]) => {
                        const pct = Math.max((count / totalFields) * 100, 8);
                        return (
                          <div
                            key={decade}
                            className="relative h-7 rounded bg-primary/15 flex items-center justify-center transition-all hover:bg-primary/25"
                            style={{ width: `${pct}%`, minWidth: 48 }}
                            title={`${decade}: ${count} campo${count > 1 ? "s" : ""}`}
                          >
                            <span className="text-[10px] font-mono font-semibold text-primary">{decade}</span>
                            <span className="absolute -top-1.5 right-1 text-[9px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Discovery timeline chart */}
                    {timelineData.length > 1 && (
                      <div className="glass-card rounded-lg p-3 2xl:p-4">
                        <div className="text-[10px] 2xl:text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Timeline de Descobertas</div>
                        <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" />
                            <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" width={30} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} stroke="hsl(var(--border))" width={30} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }}
                              formatter={(val: number, name: string) => [val, name === "discoveries" ? "Descobertas" : "Acumulado"]}
                              labelFormatter={(label) => `Ano ${label}`}
                            />
                            <Bar yAxisId="left" dataKey="discoveries" fill="hsl(199, 89%, 48%)" radius={[3, 3, 0, 0]} name="discoveries" barSize={12} />
                            <Area yAxisId="right" type="monotone" dataKey="cumulative" stroke="hsl(152, 69%, 40%)" fill="url(#discGrad)" strokeWidth={2} name="cumulative" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Fields grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 2xl:gap-3">
                      {sortedFields.map(f => (
                        <div key={f.name} className="glass-card p-3 2xl:p-4 rounded-lg group hover:border-primary/30 transition-colors border border-transparent relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full rounded-l" style={{
                            backgroundColor: f.status === "Producing" ? "hsl(152, 69%, 40%)" :
                              f.status === "Development" ? "hsl(38, 92%, 50%)" :
                              f.status === "Discovery" ? "hsl(199, 89%, 48%)" : "hsl(0, 72%, 51%)"
                          }} />
                          <div className="pl-2">
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-semibold text-sm 2xl:text-base leading-tight">{f.name}</div>
                              <Badge variant="outline" className={`text-[9px] shrink-0 ${statusColor[f.status] || "bg-muted text-muted-foreground"}`}>{f.status === "Producing" ? "Produção" : f.status === "Development" ? "Desenvolvimento" : f.status === "Discovery" ? "Descoberta" : "Abandonado"}</Badge>
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
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* Tab 2: Consórcio */}
          <TabsContent value="consortium" className="space-y-4 2xl:space-y-6">
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

                  {/* Change summary */}
                  {(() => {
                    const initial = block.contractInfo.initialConsortium;
                    const actual = block.concession;
                    const allNames = new Set([...initial.map(p => p.name), ...actual.map(p => p.name)]);
                    const changes: { name: string; from: number; to: number }[] = [];
                    allNames.forEach(name => {
                      const ini = initial.find(p => p.name === name)?.share || 0;
                      const act = actual.find(p => p.name === name)?.share || 0;
                      if (Math.abs(ini - act) > 0.01) {
                        changes.push({ name, from: ini, to: act });
                      }
                    });
                    if (changes.length === 0) return null;
                    return (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Alterações Relevantes</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {changes.map(c => (
                            <div key={c.name} className="glass-card rounded-lg p-2.5 flex items-center justify-between text-xs">
                              <span className="truncate font-medium">{c.name}</span>
                              <div className="flex items-center gap-1 font-mono shrink-0 ml-2">
                                <span className="text-muted-foreground">{c.from > 0 ? `${c.from.toFixed(1)}%` : "—"}</span>
                                <ArrowRight className="w-3 h-3 text-primary" />
                                <span className={c.to > 0 ? "font-bold" : "text-danger"}>{c.to > 0 ? `${c.to.toFixed(1)}%` : "Saiu"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Pie chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base">Parceiros Actuais</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {block.concession.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm 2xl:text-base font-medium truncate">{p.name}</span>
                            {p.isOperator && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">Operador</Badge>}
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${p.share}%`, backgroundColor: CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length] }} />
                          </div>
                        </div>
                        <span className="font-mono text-sm 2xl:text-base font-bold w-14 text-right">{p.share.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base">Distribuição de Participações</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie data={block.concession.map(p => ({ name: p.name, value: p.share }))}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                        label={({ name, value }) => `${name.split(" ")[0]} ${value.toFixed(0)}%`}>
                        {block.concession.map((_, i) => (
                          <Cell key={i} fill={CONSORTIUM_COLORS[i % CONSORTIUM_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `${val.toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Exploração */}
          <TabsContent value="exploration" className="space-y-4 2xl:space-y-6">
            {block.seismicData && block.seismicData.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
                <Card className="glass-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm 2xl:text-base">Dados Sísmicos (km)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                     <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={block.seismicData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="seismic2D" name="2D" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="seismic3D" name="3D" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="seismic4D" name="4D" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {block.wellsData && block.wellsData.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm 2xl:text-base">Poços Perfurados</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                       <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={block.wellsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="pesquisa" name="Pesquisa" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="avaliacao" name="Avaliação" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
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

            {/* Prospects Summary */}
            <ProspectsSummary blocks={[block]} scopeLabel={block.name} />

            {/* Prospects Table */}
            <ProspectsTable blocks={[block]} scopeLabel={block.name} />
          </TabsContent>

          {/* Tab 4: Produção */}
           <TabsContent value="production" className="space-y-4 2xl:space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base">Tendência de Produção (12 meses)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                   <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={block.productionHistory}>
                      <defs>
                        <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(152, 69%, 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                        formatter={(val: number) => [`${(val / 1000).toFixed(1)}k BOPD`, "Produção"]} />
                      <Area type="monotone" dataKey="value" stroke="hsl(152, 69%, 40%)" fill="url(#prodGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm 2xl:text-base">CAPEX: Planeado vs Real ($M)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={block.capexHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                        formatter={(val: number) => [`$${val}M`]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="planned" name="Planeado" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" name="Real" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 5: Projecções */}
          <TabsContent value="projections">
            <Card className="glass-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm 2xl:text-base">Projecções de Produção (2025–2034)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart data={projectionYears}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      formatter={(val: number) => [`${(val / 1000).toFixed(1)}k BOPD`]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="conservative" name="Conservador" stroke="hsl(0, 72%, 51%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="base" name="Base" stroke="hsl(199, 89%, 48%)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="expansion" name="Expansão" stroke="hsl(152, 69%, 40%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Análise SWOT */}
          <TabsContent value="swot" className="space-y-4">
            <SwotAnalysis block={block} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BlockPage;
