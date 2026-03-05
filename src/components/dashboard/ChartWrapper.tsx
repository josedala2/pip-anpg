import { useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

interface ChartWrapperProps {
  title: string;
  children: ReactNode;
  height?: number;
  fullscreenHeight?: number;
  className?: string;
  icon?: ReactNode;
  headerExtra?: ReactNode;
}

export const ChartWrapper = ({
  title,
  children,
  height = 400,
  fullscreenHeight = 600,
  className = "",
  icon,
  headerExtra,
}: ChartWrapperProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const fullscreenChartRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { theme } = useTheme();

  const handleExport = async (ref: React.RefObject<HTMLDivElement | null>) => {
    const node = ref.current;
    if (!node) return;

    setIsExporting(true);

    // Show watermark before capture
    const watermarks = node.querySelectorAll<HTMLElement>("[data-watermark]");
    watermarks.forEach(el => (el.style.display = "flex"));

    try {
      await new Promise(r => setTimeout(r, 100));

      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--background").trim();
      const dataUrl = await toPng(node, {
        backgroundColor: `hsl(${bgColor})`,
        pixelRatio: 2,
        quality: 1,
        filter: (domNode) => {
          if (domNode instanceof HTMLElement && domNode.dataset.chartToolbar === "true") {
            return false;
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-zA-Z0-9À-ÿ\s]/g, "").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Gráfico exportado com sucesso");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Erro ao exportar gráfico");
    } finally {
      // Hide watermark again
      watermarks.forEach(el => (el.style.display = "none"));
      setIsExporting(false);
    }
  };

  const logoSrc = theme === "dark" ? anpgLogoWhite : anpgLogoColor;

  const Watermark = () => (
    <div
      data-watermark="true"
      className="absolute bottom-3 right-3 items-center gap-1.5 pointer-events-none"
      style={{ display: "none", opacity: 0.35 }}
    >
      <img src={logoSrc} alt="ANPG" className="h-6" />
    </div>
  );

  return (
    <>
      <Card className={`glass-card group/chart relative ${className}`}>
        <div ref={chartRef} className="relative">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm 2xl:text-base flex items-center gap-2">
                {icon}
                {title}
              </CardTitle>
              <div className="flex items-center gap-1" data-chart-toolbar="true">
                {headerExtra}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover/chart:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  onClick={() => handleExport(chartRef)}
                  disabled={isExporting}
                  title="Exportar como PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover/chart:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  onClick={() => setIsFullscreen(true)}
                  title="Ver em tela cheia"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div style={{ height }}>{children}</div>
          </CardContent>
          <Watermark />
        </div>
      </Card>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-auto bg-card border-border p-0 gap-0 [&>button[class*='absolute']]:hidden">
          <div ref={fullscreenChartRef} className="p-6 relative">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg flex items-center gap-2">
                  {icon}
                  {title}
                </DialogTitle>
                <div className="flex items-center gap-1" data-chart-toolbar="true">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleExport(fullscreenChartRef)}
                    disabled={isExporting}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar PNG
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsFullscreen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div style={{ height: fullscreenHeight }}>{children}</div>
            <Watermark />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
