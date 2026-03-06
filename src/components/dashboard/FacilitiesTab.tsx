import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { FacilityData } from "@/data/angolaBlocks";
import {
  Factory, AlertTriangle, Camera, FileText, Wrench, ShieldCheck,
  ChevronLeft, ChevronRight, X, Anchor, Clock, CheckCircle2,
  Loader2, CalendarClock, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FacilitiesSchematic } from "./FacilitiesSchematic";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [docFilter, setDocFilter] = useState<string>("all");

  const photos = facilityData.photos || [];
  const docs = facilityData.documents || [];
  const specs = facilityData.platformSpecs || [];
  const maintenance = facilityData.maintenancePlan || [];

  const filteredDocs = docFilter === "all" ? docs : docs.filter(d => d.type === docFilter);
  const docTypes = [...new Set(docs.map(d => d.type))];

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const navigateLightbox = (dir: -1 | 1) => {
    setLightboxIndex((prev) => (prev + dir + photos.length) % photos.length);
  };

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-[9px] uppercase text-muted-foreground">Eficiência Global</div>
            <div className="text-2xl font-bold font-mono text-success">{facilityData.overallEfficiency}%</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-[9px] uppercase text-muted-foreground">Poços Activos</div>
            <div className="text-2xl font-bold font-mono">{facilityData.activeWells.op + facilityData.activeWells.wi + facilityData.activeWells.gi}</div>
            <div className="text-[9px] text-muted-foreground">{facilityData.activeWells.op} OP · {facilityData.activeWells.wi} WI · {facilityData.activeWells.gi} GI</div>
          </CardContent>
        </Card>
        {facilityData.capacityBOPD && (
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-[9px] uppercase text-muted-foreground">Capacidade</div>
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

      {/* Areas with Efficiency */}
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

      {/* Interactive Schematic Diagram */}
      <FacilitiesSchematic />

      {/* Platform Specifications Table */}
      {specs.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Anchor className="w-4 h-4 text-primary" />Especificações das Plataformas
            </CardTitle>
          </CardHeader>
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
        </Card>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />Galeria de Instalações
              <Badge variant="outline" className="text-[10px] ml-auto">{photos.length} fotos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-foreground font-medium leading-tight">{photo.caption}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {photo.platform && <span className="text-[9px] text-muted-foreground">{photo.platform}</span>}
                      {photo.year && <span className="text-[9px] text-muted-foreground">· {photo.year}</span>}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-4 h-4 text-foreground/70" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-border p-0">
          <DialogTitle className="sr-only">Galeria de Instalações</DialogTitle>
          {photos.length > 0 && (
            <div className="relative">
              <img
                src={photos[lightboxIndex]?.url}
                alt={photos[lightboxIndex]?.caption}
                className="w-full max-h-[70vh] object-contain rounded-t-lg"
              />
              <div className="p-4 space-y-1">
                <p className="text-sm font-medium">{photos[lightboxIndex]?.caption}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {photos[lightboxIndex]?.platform && <span>{photos[lightboxIndex]?.platform}</span>}
                  {photos[lightboxIndex]?.year && <span>· {photos[lightboxIndex]?.year}</span>}
                  <span className="ml-auto">{lightboxIndex + 1} / {photos.length}</span>
                </div>
              </div>
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full"
                    onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full"
                    onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Maintenance Plan */}
      {maintenance.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-warning" />Plano de Manutenção
            </CardTitle>
          </CardHeader>
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
        </Card>
      )}

      {/* Documents */}
      {docs.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />Documentos & Certificações
                <Badge variant="outline" className="text-[10px]">{docs.length}</Badge>
              </CardTitle>
              <div className="flex items-center gap-1.5">
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
            </div>
          </CardHeader>
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
        </Card>
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
