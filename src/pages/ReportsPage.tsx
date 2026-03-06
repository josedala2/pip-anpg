import { useState } from "react";
import { Printer, Copy, Check, FileSpreadsheet, FileDown, Loader2 } from "lucide-react";
import { exportToCsv, exportToExcel } from "@/lib/exportFinancial";
import { exportReportPdf } from "@/lib/exportPdf";
import { Button } from "@/components/ui/button";
import { ReportConfigurator, type ReportConfig } from "@/components/reports/ReportConfigurator";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { oilBlocks } from "@/data/angolaBlocks";

const ReportsPage = () => {
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    reportTypes: [],
    selectedBlockIds: [],
    includeCharts: false,
    includeTables: true,
    includeAiNarrative: false,
    pdfOrientation: "portrait",
  });

  const handleGenerate = async () => {
    setGenerated(true);
    setAiNarrative(null);

    if (config.includeAiNarrative) {
      setAiLoading(true);
      try {
        const selectedBlocks = oilBlocks.filter(b => config.selectedBlockIds.includes(b.id));
        const { data, error } = await supabase.functions.invoke("report-narrative", {
          body: {
            blocks: selectedBlocks,
            reportTypes: config.reportTypes,
          },
        });

        if (error) throw error;
        if (data?.error) {
          toast({ title: "Erro IA", description: data.error, variant: "destructive" });
        } else {
          setAiNarrative(data.narrative);
        }
      } catch (e: any) {
        console.error("AI narrative error:", e);
        toast({
          title: "Erro ao gerar sumário IA",
          description: e.message || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setAiLoading(false);
      }
    }
  };

  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePrint = async () => {
    setPdfLoading(true);
    try {
      const selectedBlocks = oilBlocks.filter(b => config.selectedBlockIds.includes(b.id));
      const blockNames = selectedBlocks.map(b => b.id).join("_");
      const reportTypeLabels: Record<string, string> = {
        executive: "Resumo Executivo",
        contractual: "Contractual & Fiscal",
        exploration: "Exploração & Produção",
        consortium: "Consórcio & Participações",
        legislation: "Legislação & Documentos",
        financial: "Económico & Financeiro",
      };
      await exportReportPdf(
        "report-content",
        `relatorio_ANPG_${blockNames}.pdf`,
        config.pdfOrientation,
        {
          title: "Relatório de Concessões",
          blockNames: selectedBlocks.map(b => b.name),
          reportTypes: config.reportTypes.map(t => reportTypeLabels[t] || t),
        }
      );
      toast({ title: "PDF exportado!", description: "Ficheiro PDF gerado com sucesso." });
    } catch (e: any) {
      console.error("PDF export error:", e);
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  };

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
    <div className="min-h-[calc(100vh-56px)] bg-background text-foreground">
      {/* Action bar — hidden on print */}
      {generated && (
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 print:hidden px-4 md:px-6 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">
            <span className="text-gradient">Relatórios</span>
            <span className="text-muted-foreground font-light ml-2">Automáticos</span>
          </h2>
          <div className="flex items-center gap-2">
            {config.reportTypes.includes("financial") && (
              <>
                <Button variant="outline" size="sm" onClick={() => {
                  const selectedBlocks = oilBlocks.filter(b => config.selectedBlockIds.includes(b.id));
                  exportToExcel(selectedBlocks, "relatorio_financeiro.xlsx");
                  toast({ title: "Exportado!", description: "Ficheiro Excel gerado com sucesso." });
                }} className="gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const selectedBlocks = oilBlocks.filter(b => config.selectedBlockIds.includes(b.id));
                  exportToCsv(selectedBlocks, "relatorio_financeiro.csv");
                  toast({ title: "Exportado!", description: "Ficheiro CSV gerado com sucesso." });
                }} className="gap-1.5">
                  <FileDown className="w-3.5 h-3.5" />CSV
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="anpg" size="sm" onClick={handlePrint} className="gap-1.5" disabled={pdfLoading}>
              {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              {pdfLoading ? "A gerar…" : "Exportar PDF"}
            </Button>
          </div>
        </div>
      )}

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
              <div className="instruction-card max-w-md mx-auto text-center">
                <div className="instruction-icon mx-auto mb-4">
                  <Printer className="w-5 h-5" />
                </div>
                <h2 className="instruction-title text-lg mb-2">Nenhum relatório gerado</h2>
                <p className="instruction-desc">
                  Configure o tipo de relatório e seleccione os blocos no painel à esquerda, depois clique em "Gerar Relatório".
                </p>
              </div>
            </div>
          ) : (
            <ReportPreview config={config} aiNarrative={aiNarrative} aiLoading={aiLoading} />
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
