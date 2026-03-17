import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Maximize2, Minimize2, Globe } from "lucide-react";

interface Props {
  matterportUrl: string;
  facilityName: string;
}

export const VirtualTourViewer = ({ matterportUrl, facilityName }: Props) => {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          Visita Virtual 360°
          <Badge variant="outline" className="text-[9px] ml-1 bg-primary/10 text-primary border-primary/30">Matterport</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7"
            onClick={toggleFullscreen}
            title={fullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro"}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-border/50 bg-muted/20">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card">
              <Skeleton className="w-full h-full absolute inset-0" />
              <Globe className="w-8 h-8 text-primary animate-pulse relative z-10" />
              <p className="text-xs text-muted-foreground relative z-10">A carregar tour virtual de {facilityName}…</p>
            </div>
          )}
          <div className="aspect-video">
            <iframe
              src={matterportUrl}
              title={`Tour virtual — ${facilityName}`}
              className="w-full h-full border-0"
              allow="fullscreen; xr-spatial-tracking"
              allowFullScreen
              onLoad={() => setLoading(false)}
            />
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-2">
          Use o rato para navegar. Clique nos pontos de interesse para inspecionar detalhes dos equipamentos.
        </p>
      </CardContent>
    </Card>
  );
};
