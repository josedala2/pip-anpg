import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PlatformSpec, FacilityPhoto, FacilityDocument } from "@/data/angolaBlocks";
import { VirtualTourViewer } from "./VirtualTourViewer";
import {
  Anchor, ChevronLeft, ChevronRight, Clock, Camera,
  Factory, Wrench, ShieldCheck, FileText, Waves, Calendar,
  Ruler, Gauge, Image as ImageIcon, X,
} from "lucide-react";

interface Props {
  spec: PlatformSpec;
  photos: FacilityPhoto[];
  documents: FacilityDocument[];
  maintenanceItems: { period: string; scope: string; status: "Concluído" | "Em Curso" | "Planeado" }[];
}

const statusColor: Record<string, string> = {
  Operacional: "text-success border-success/30 bg-success/10",
  Manutenção: "text-warning border-warning/30 bg-warning/10",
  Descomissionada: "text-muted-foreground border-border bg-muted",
  Suspensa: "text-danger border-danger/30 bg-danger/10",
};

const docTypeMap: Record<string, { label: string; color: string }> = {
  "ficha-tecnica": { label: "Ficha Técnica", color: "bg-primary/10 text-primary border-primary/30" },
  inspecao: { label: "Inspecção", color: "bg-warning/10 text-warning border-warning/30" },
  manutencao: { label: "Manutenção", color: "bg-success/10 text-success border-success/30" },
  certificacao: { label: "Certificação", color: "bg-[hsl(280,65%,60%)]/10 text-[hsl(280,65%,60%)] border-[hsl(280,65%,60%)]/30" },
  outro: { label: "Outro", color: "bg-muted text-muted-foreground border-border" },
};

export const FacilityDetailCard = ({ spec, photos, documents, maintenanceItems }: Props) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const navLightbox = (dir: -1 | 1) => {
    setLightboxIdx((prev) => (prev + dir + photos.length) % photos.length);
  };

  const age = spec.installationYear ? new Date().getFullYear() - spec.installationYear : null;

  return (
    <div className="space-y-4">
      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Photo / hero image */}
        <div className="lg:col-span-1">
          {spec.photo ? (
            <div
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/50 cursor-pointer group"
              onClick={() => {
                const idx = photos.findIndex(p => p.url === spec.photo);
                setLightboxIdx(idx >= 0 ? idx : 0);
                setLightboxOpen(true);
              }}
            >
              <img src={spec.photo} alt={spec.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="text-sm font-bold text-foreground">{spec.name}</h3>
                <p className="text-[10px] text-muted-foreground">{spec.type}</p>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className={`text-[9px] ${statusColor[spec.status] || ""}`}>{spec.status}</Badge>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-xl border border-border/50 bg-muted/30 flex flex-col items-center justify-center">
              <Factory className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <h3 className="text-sm font-bold">{spec.name}</h3>
              <p className="text-[10px] text-muted-foreground">{spec.type}</p>
              <Badge variant="outline" className={`text-[9px] mt-2 ${statusColor[spec.status] || ""}`}>{spec.status}</Badge>
            </div>
          )}
        </div>

        {/* Specs grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SpecKPI icon={<Factory className="w-3.5 h-3.5" />} label="Tipo" value={spec.type} />
          {spec.installationYear && (
            <SpecKPI icon={<Calendar className="w-3.5 h-3.5" />} label="Instalação" value={String(spec.installationYear)} sub={age ? `${age} anos` : undefined} />
          )}
          {spec.waterDepthM && (
            <SpecKPI icon={<Waves className="w-3.5 h-3.5" />} label="Profundidade" value={`${spec.waterDepthM} m`} />
          )}
          {spec.capacity && (
            <SpecKPI icon={<Gauge className="w-3.5 h-3.5" />} label="Capacidade" value={spec.capacity} />
          )}
          {spec.lastInspection && (
            <SpecKPI icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Última Inspecção" value={spec.lastInspection} />
          )}
          {spec.nextMaintenance && (
            <SpecKPI icon={<Wrench className="w-3.5 h-3.5" />} label="Próx. Manutenção" value={spec.nextMaintenance} />
          )}
        </div>
      </div>

      {/* Photo gallery for this facility */}
      {photos.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-primary" />Galeria
              <Badge variant="outline" className="text-[9px] ml-auto">{photos.length} fotos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => { setLightboxIdx(idx); setLightboxOpen(true); }}
                >
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-foreground font-medium leading-tight truncate">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents for this facility */}
      {documents.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />Documentos
              <Badge variant="outline" className="text-[9px] ml-auto">{documents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {documents.map((doc, i) => {
                const info = docTypeMap[doc.type] || docTypeMap.outro;
                return (
                  <div key={i} className="rounded-lg border border-border/50 p-2.5 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-medium leading-tight">{doc.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-[8px] ${info.color}`}>{info.label}</Badge>
                          {doc.date && <span className="text-[9px] text-muted-foreground">{new Date(doc.date).toLocaleDateString("pt-AO", { year: "numeric", month: "short" })}</span>}
                        </div>
                        {doc.description && <p className="text-[9px] text-muted-foreground mt-1">{doc.description}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance items */}
      {maintenanceItems.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-warning" />Plano de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Período</TableHead>
                  <TableHead className="text-[10px]">Âmbito</TableHead>
                  <TableHead className="text-[10px] text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{item.period}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.scope}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[9px] ${
                        item.status === "Concluído" ? "text-success border-success/30" :
                        item.status === "Em Curso" ? "text-warning border-warning/30" :
                        "text-primary border-primary/30"
                      }`}>{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-border p-0">
          <DialogTitle className="sr-only">{spec.name} — Galeria</DialogTitle>
          {photos.length > 0 && (
            <div className="relative">
              <img
                src={photos[lightboxIdx]?.url}
                alt={photos[lightboxIdx]?.caption}
                className="w-full max-h-[70vh] object-contain rounded-t-lg"
              />
              <div className="p-4 space-y-1">
                <p className="text-sm font-medium">{photos[lightboxIdx]?.caption}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {photos[lightboxIdx]?.year && <span>{photos[lightboxIdx].year}</span>}
                  <span className="ml-auto">{lightboxIdx + 1} / {photos.length}</span>
                </div>
              </div>
              {photos.length > 1 && (
                <>
                  <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full" onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full" onClick={(e) => { e.stopPropagation(); navLightbox(1); }}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function SpecKPI({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[9px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-sm font-bold text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
