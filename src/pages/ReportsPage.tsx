import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { ReportConfigurator, type ReportConfig } from "@/components/reports/ReportConfigurator";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { toast } from "@/hooks/use-toast";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

const ReportsPage = () => {
  const { theme } = useTheme();
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    reportTypes: [],
    selectedBlockIds: [],
    includeCharts: false,
    includeTables: true,
  });

  const handleGenerate = () => setGenerated(true);

  const handlePrint = () => window.print();

  const handleCopy = async () => {
    const el = document.getElementById("report-content");
    if (!el) return;
    try {
      await navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      toast({ title: "Copiado!", description: "Conteúdo do relatório copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header — hidden on print */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 print:hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-8 md:h-10"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                <span className="text-gradient">Relatórios</span>
                <span className="text-muted-foreground font-light ml-2">Automáticos</span>
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">Geração de relatórios personalizados</p>
            </div>
          </div>

          {generated && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                Exportar PDF
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar configurator — hidden on print */}
        <aside className="w-full lg:w-80 xl:w-96 border-r border-border/50 p-4 md:p-6 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:overflow-y-auto print:hidden">
          <ReportConfigurator config={config} onChange={setConfig} onGenerate={handleGenerate} />
        </aside>

        {/* Preview area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-57px)]">
          {!generated ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Printer className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Nenhum relatório gerado</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Configure o tipo de relatório e seleccione os blocos no painel à esquerda, depois clique em "Gerar Relatório".
              </p>
            </div>
          ) : (
            <ReportPreview config={config} />
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
