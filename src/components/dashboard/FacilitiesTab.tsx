import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import type { FacilityData } from "@/data/angolaBlocks";
import {
  Factory, AlertTriangle, FileText, Wrench, ShieldCheck,
  Anchor, Clock, CheckCircle2,
  Loader2, CalendarClock, ChevronDown, ArrowLeft,
  Target, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { tooltipDescriptions } from "@/lib/tooltipDescriptions";
import { FacilitiesSchematic } from "./FacilitiesSchematic";
import { FacilityDetailCard } from "./FacilityDetailCard";

interface Props {
  facilityData: FacilityData;
}

const docTypeMap: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  "ficha-tecnica": { label: "Ficha Técnica", color: "bg-primary/10 text-primary border-primary/30", icon: FileText },
  "inspecao": { label: "Inspecção", color: "bg-warning/10 text-warning border-warning/30", icon: ShieldCheck },
  "manutencao": { label: "Manutenção", color: "bg-success/10 text-success border-success/30", icon: Wrench },
  "certificacao": { label: "Certificação", color: "bg-[hsl(280,65%,60%)]/10 text-[hsl(280,65%,60%)] border-[hsl(280,65%,60%)]/30", icon: ShieldCheck },
  "outro": { label: "Outro", color: "bg-muted text-muted-foreground border-border", icon: FileText },
};

const statusColor: Record<string, string> = {
  "Operacional": "text-success border-success/30 bg-success/10",
  "Manutenção": "text-warning border-warning/30 bg-warning/10",
  "Descomissionada": "text-muted-foreground border-border bg-muted",
  "Suspensa": "text-danger border-danger/30 bg-danger/10",
};

const maintenanceStatusColor: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  "Concluído": { color: "text-success", icon: CheckCircle2 },
  "Em Curso": { color: "text-warning", icon: Loader2 },
  "Planeado": { color: "text-primary", icon: CalendarClock },
};

export const FacilitiesTab = ({ facilityData }: Props) => {
  const [docFilter, setDocFilter] = useState<string>("all");
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [schematicOpen, setSchematicOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);

  const photos = facilityData.photos || [];
  const docs = facilityData.documents || [];
  const specs = facilityData.platformSpecs || [];
  const maintenance = facilityData.maintenancePlan || [];

  const filteredDocs = docFilter === "all" ? docs : docs.filter(d => d.type === docFilter);
  const docTypes = [...new Set(docs.map(d => d.type))];

  const selectedSpec = specs.find(s => s.name === selectedFacility);

  // Filter photos/docs/maintenance relevant to the selected facility
  const facilityPhotos = selectedSpec
    ? photos.filter(p => p.platform === selectedSpec.name || p.caption?.toLowerCase().includes(selectedSpec.name.toLowerCase()))
    : [];
  const facilityDocs = selectedSpec
    ? docs.filter(d => d.title?.toLowerCase().includes(selectedSpec.name.toLowerCase()))
    : [];
  const facilityMaintenance = selectedSpec
    ? maintenance.filter(m => m.scope?.toLowerCase().includes(selectedSpec.name.toLowerCase()))
    : [];

  // If a facility is selected, show its detail view
  if (selectedSpec) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedFacility(null)}
          className="gap-1.5 text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar à lista de instalações
        </Button>
        <FacilityDetailCard
          spec={selectedSpec}
          photos={facilityPhotos.length > 0 ? facilityPhotos : (selectedSpec.photo ? [{ url: selectedSpec.photo, caption: selectedSpec.name }] : [])}
          documents={facilityDocs}
          maintenanceItems={facilityMaintenance}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Eficiência Global <InfoTooltip text={tooltipDescriptions["Eficiência Global"]} /></div>
            <div className="text-2xl font-bold font-mono text-success">{facilityData.overallEfficiency}%</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Poços Activos <InfoTooltip text={tooltipDescriptions["Poços Activos"]} /></div>
            <div className="text-2xl font-bold font-mono">{facilityData.activeWells.op + facilityData.activeWells.wi + facilityData.activeWells.gi}</div>
            <div className="text-[9px] text-muted-foreground">{facilityData.activeWells.op} OP · {facilityData.activeWells.wi} WI · {facilityData.activeWells.gi} GI</div>
          </CardContent>
        </Card>
        {facilityData.capacityBOPD && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-1">Capacidade <InfoTooltip text={tooltipDescriptions["Capacidade"]} /></div>
              <div className="text-2xl font-bold font-mono">{(facilityData.capacityBOPD / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-muted-foreground">BOPD</div>
            </CardContent>
          </Card>
        )}
        {facilityData.productionStartYear && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Em Produção Desde</div>
              <div className="text-2xl font-bold font-mono">{facilityData.productionStartYear}</div>
            </CardContent>
          </Card>
        )}
        {facilityData.production2025Bbls && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Produção 2025</div>
              <div className="text-xl font-bold font-mono">{(facilityData.production2025Bbls / 1e6).toFixed(1)}M</div>
              <div className="text-[9px] text-muted-foreground">bbls</div>
            </CardContent>
          </Card>
        )}
        {facilityData.productionLossesBbls && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Perdas 2025</div>
              <div className="text-xl font-bold font-mono text-danger">{(facilityData.productionLossesBbls / 1e6).toFixed(1)}M</div>
              <div className="text-[9px] text-muted-foreground">bbls</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Facility List — clickable cards */}
      {specs.length > 0 && (
        <Collapsible open={facilitiesOpen} onOpenChange={setFacilitiesOpen}>
          <Card className="glass-card">
            <CollapsibleTrigger asChild>
              <CardHeader className="p-4 pb-2 cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-xl">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-primary" />Instalações
                  <Badge variant="outline" className="text-[10px] ml-auto mr-2">{specs.length} instalações</Badge>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${facilitiesOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {specs.map(spec => {
                    const age = spec.installationYear ? new Date().getFullYear() - spec.installationYear : null;
                    return (
                      <div
                        key={spec.name}
                        className="group rounded-xl border border-border/50 hover:border-primary/50 bg-card hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => setSelectedFacility(spec.name)}
                      >
                        {spec.photo ? (
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <img src={spec.photo} alt={spec.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className={`text-[8px] backdrop-blur-sm ${statusColor[spec.status] || ""}`}>{spec.status}</Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center relative">
                            <Factory className="w-8 h-8 text-muted-foreground/30" />
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className={`text-[8px] ${statusColor[spec.status] || ""}`}>{spec.status}</Badge>
                            </div>
                          </div>
                        )}
                        <div className="p-3 space-y-1.5">
                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{spec.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{spec.type}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-muted-foreground">
                            {spec.capacity && <span>{spec.capacity}</span>}
                            {spec.waterDepthM && <span>{spec.waterDepthM}m</span>}
                            {age && <span>{age} anos</span>}
                            {spec.matterportUrl && (
                              <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/30">360°</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
        {facilityData.areas.map(area => (
          <Card key={area.name} className="glass-card">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Factory className="w-4 h-4 text-primary" />{area.name}
                </CardTitle>
                <Badge variant="outline" className={area.efficiency >= 90 ? "text-success border-success/30" : "text-warning border-warning/30"}>
                  Eficiência: {area.efficiency}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {area.platforms.map(p => (
                  <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                ))}
              </div>
              <Progress value={area.efficiency} className={`h-2 ${area.efficiency >= 90 ? "[&>div]:bg-success" : "[&>div]:bg-warning"}`} />
              {area.issues && area.issues.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-warning" /> Desafios Identificados
                  </div>
                  {area.issues.map((issue, i) => (
                    <p key={i} className="text-xs text-muted-foreground pl-4">› {issue}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations from ANPG / Platform */}
      {facilityData.recommendations && facilityData.recommendations.length > 0 && (
        <Card className="glass-card border-primary/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Recomendações da Plataforma
              <Badge variant="outline" className="text-[10px] ml-auto">{facilityData.recommendations.length} acções</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {facilityData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Schematic Diagram — Collapsible */}
      <Collapsible open={schematicOpen} onOpenChange={setSchematicOpen}>
        <Card className="glass-card">
          <CollapsibleTrigger asChild>
            <CardHeader className="p-4 pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2">
                <Factory className="w-4 h-4 text-primary" />Diagrama Esquemático — Infraestrutura
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ml-auto ${schematicOpen ? "rotate-180" : ""}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FacilitiesSchematic renderAsContent />
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Platform Specifications Table — Collapsible */}
      {specs.length > 0 && (
        <Collapsible open={specsOpen} onOpenChange={setSpecsOpen}>
          <Card className="glass-card">
            <CollapsibleTrigger asChild>
              <CardHeader className="p-4 pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-primary" />Especificações das Plataformas
                  <Badge variant="outline" className="text-[10px] ml-auto mr-2">{specs.length} plataformas</Badge>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${specsOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Plataforma</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs text-center">Instalação</TableHead>
                    <TableHead className="text-xs text-center">Prof. (m)</TableHead>
                    <TableHead className="text-xs">Capacidade</TableHead>
                    <TableHead className="text-xs text-center">Estado</TableHead>
                    <TableHead className="text-xs text-center">Última Inspecção</TableHead>
                    <TableHead className="text-xs text-center">Próx. Manutenção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.map(spec => (
                    <TableRow key={spec.name}>
                      <TableCell className="text-xs font-medium">{spec.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{spec.type}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{spec.installationYear || "—"}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{spec.waterDepthM || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{spec.capacity || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] ${statusColor[spec.status] || ""}`}>{spec.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center font-mono text-muted-foreground">{spec.lastInspection || "—"}</TableCell>
                      <TableCell className="text-xs text-center font-mono text-muted-foreground">{spec.nextMaintenance || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Maintenance Plan — Collapsible */}
      {maintenance.length > 0 && (
        <Collapsible open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
          <Card className="glass-card">
            <CollapsibleTrigger asChild>
              <CardHeader className="p-4 pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-warning" />Plano de Manutenção
                  <Badge variant="outline" className="text-[10px] ml-auto mr-2">{maintenance.length} itens</Badge>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${maintenanceOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Período</TableHead>
                        <TableHead className="text-xs">Âmbito</TableHead>
                        <TableHead className="text-xs text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenance
                        .sort((a, b) => a.period.localeCompare(b.period))
                        .map((item, i) => {
                          const st = maintenanceStatusColor[item.status] || maintenanceStatusColor["Planeado"];
                          return (
                            <TableRow key={i}>
                              <TableCell className="text-xs font-mono">{item.period}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{item.scope}</TableCell>
                              <TableCell className="text-center">
                                <div className={`inline-flex items-center gap-1 text-[10px] font-medium ${st.color}`}>
                                  <st.icon className="w-3 h-3" />
                                  {item.status}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Documents — Collapsible */}
      {docs.length > 0 && (
        <Collapsible open={docsOpen} onOpenChange={setDocsOpen}>
          <Card className="glass-card">
            <CollapsibleTrigger asChild>
              <CardHeader className="p-4 pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />Documentos & Certificações
                    <Badge variant="outline" className="text-[10px]">{docs.length}</Badge>
                  </CardTitle>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${docsOpen ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant={docFilter === "all" ? "default" : "outline"}
                  className="text-[10px] cursor-pointer transition-colors"
                  onClick={() => setDocFilter("all")}
                >
                  Todos
                </Badge>
                {docTypes.map(t => {
                  const info = docTypeMap[t] || docTypeMap["outro"];
                  return (
                    <Badge
                      key={t}
                      variant={docFilter === t ? "default" : "outline"}
                      className={`text-[10px] cursor-pointer transition-colors ${docFilter !== t ? info.color : ""}`}
                      onClick={() => setDocFilter(docFilter === t ? "all" : t)}
                    >
                      {info.label}
                    </Badge>
                  );
                })}
              </div>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredDocs.map((doc, i) => {
                    const info = docTypeMap[doc.type] || docTypeMap["outro"];
                    const DocIcon = info.icon;
                    return (
                      <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2 hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <DocIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium leading-tight">{doc.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[9px] ${info.color}`}>{info.label}</Badge>
                              {doc.date && (
                                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {new Date(doc.date).toLocaleDateString("pt-AO", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {doc.description && (
                          <p className="text-[10px] text-muted-foreground leading-relaxed pl-6">{doc.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Timeline info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {facilityData.productionStartYear && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Início Produção</div>
              <div className="text-xl font-bold font-mono">{facilityData.productionStartYear}</div>
            </CardContent>
          </Card>
        )}
        {facilityData.endOfLifeYear && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Vida Útil Até</div>
              <div className="text-xl font-bold font-mono">{facilityData.endOfLifeYear}</div>
              {facilityData.endOfLifeField && <div className="text-[9px] text-muted-foreground">{facilityData.endOfLifeField}</div>}
            </CardContent>
          </Card>
        )}
        {facilityData.cumulativeProductionBO && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Prod. Acumulada</div>
              <div className="text-lg font-bold font-mono">{(facilityData.cumulativeProductionBO / 1e9).toFixed(1)}B</div>
              <div className="text-[9px] text-muted-foreground">BO</div>
            </CardContent>
          </Card>
        )}
        {facilityData.terminalName && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Terminal</div>
              <div className="text-sm font-bold">{facilityData.terminalName}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
