import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { OilBlock } from "@/data/angolaBlocks";
import { Brain, Shield, AlertTriangle, Lightbulb, TrendingDown, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SwotItem {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  summary: string;
  recommendation: string;
}

const impactColor = (impact: string) => {
  switch (impact) {
    case "high": return "bg-danger/15 text-danger border-danger/30";
    case "medium": return "bg-warning/15 text-warning border-warning/30";
    case "low": return "bg-muted text-muted-foreground border-border";
    default: return "bg-muted text-muted-foreground";
  }
};

const impactLabel = (impact: string) => {
  switch (impact) {
    case "high": return "Alto";
    case "medium": return "Médio";
    case "low": return "Baixo";
    default: return impact;
  }
};

const SwotSection = ({
  title,
  icon: Icon,
  items,
  color,
  bgColor,
}: {
  title: string;
  icon: React.ElementType;
  items: SwotItem[];
  color: string;
  bgColor: string;
}) => (
   <Card className={`glass-card border-l-4 ${color}`}>
     <CardHeader className="p-4 2xl:p-6 3xl:p-8 pb-2">
       <CardTitle className="text-sm 2xl:text-lg 3xl:text-xl flex items-center gap-2 3xl:gap-3">
         <div className={`p-1.5 2xl:p-2.5 3xl:p-3 rounded-md ${bgColor}`}>
           <Icon className="w-4 h-4 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7" />
         </div>
         {title}
         <Badge variant="outline" className="ml-auto text-[10px] 2xl:text-sm 3xl:text-base">{items.length}</Badge>
       </CardTitle>
     </CardHeader>
     <CardContent className="p-4 2xl:p-6 3xl:p-8 pt-0 space-y-3 2xl:space-y-5 3xl:space-y-6">
       {items.map((item, i) => (
         <div key={i} className="space-y-1 2xl:space-y-2">
           <div className="flex items-center gap-2 3xl:gap-3">
             <span className="text-sm 2xl:text-base 3xl:text-lg font-medium">{item.title}</span>
             <Badge variant="outline" className={`text-[9px] 2xl:text-xs 3xl:text-sm ${impactColor(item.impact)}`}>
               {impactLabel(item.impact)}
             </Badge>
           </div>
           <p className="text-xs 2xl:text-base 3xl:text-lg text-muted-foreground leading-relaxed">{item.description}</p>
         </div>
       ))}
     </CardContent>
   </Card>
);

const SwotSkeleton = () => (
  <div className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="glass-card">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            {[1, 2, 3].map(j => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const SwotAnalysis = ({ block }: { block: OilBlock }) => {
  const [swot, setSwot] = useState<SwotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Check if block has static SWOT data from document
  const hasStaticSwot = !!block.swotData;

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("swot-analysis", {
        body: { block },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSwot(data);
      setHasGenerated(true);
    } catch (e: any) {
      console.error("SWOT error:", e);
      toast.error(e.message || "Erro ao gerar análise SWOT");
    } finally {
      setLoading(false);
    }
  };

  // Render static SWOT from document if available and no AI-generated SWOT
  if (hasStaticSwot && !hasGenerated && !loading) {
    const sd = block.swotData!;
    const staticSections = [
      { title: "Forças", icon: Shield, items: sd.strengths, color: "border-l-success", bgColor: "bg-success/10 text-success" },
      { title: "Fraquezas", icon: TrendingDown, items: sd.weaknesses, color: "border-l-danger", bgColor: "bg-danger/10 text-danger" },
      { title: "Oportunidades", icon: Lightbulb, items: sd.opportunities, color: "border-l-primary", bgColor: "bg-primary/10 text-primary" },
      { title: "Ameaças", icon: AlertTriangle, items: sd.threats, color: "border-l-warning", bgColor: "bg-warning/10 text-warning" },
    ];

    return (
      <div className="space-y-4 2xl:space-y-6 3xl:space-y-8">
        <Card className="glass-card bg-muted/30 border-muted-foreground/20">
          <CardContent className="p-4 2xl:p-6 3xl:p-8">
            <div className="flex items-start gap-3 2xl:gap-4">
              <div className="p-2 2xl:p-3 rounded-lg bg-primary/10 shrink-0">
                <Brain className="w-5 h-5 2xl:w-7 2xl:h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm 2xl:text-lg">Análise SWOT — Documento Oficial</h3>
                  <Button onClick={generate} variant="ghost" size="sm" className="gap-1.5 text-xs 2xl:text-sm h-7 2xl:h-9">
                    <Sparkles className="w-3 h-3 2xl:w-4 2xl:h-4" />
                    Gerar com IA
                  </Button>
                </div>
                <p className="text-xs 2xl:text-base text-muted-foreground mt-1">
                  Análise SWOT extraída do relatório "Estado das Concessões". Pode gerar uma versão preditiva com IA.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6 3xl:gap-8">
          {staticSections.map(sec => (
            <Card key={sec.title} className={`glass-card border-l-4 ${sec.color}`}>
              <CardHeader className="p-4 2xl:p-6 pb-2">
                <CardTitle className="text-sm 2xl:text-lg flex items-center gap-2">
                  <div className={`p-1.5 2xl:p-2.5 rounded-md ${sec.bgColor}`}>
                    <sec.icon className="w-4 h-4 2xl:w-6 2xl:h-6" />
                  </div>
                  {sec.title}
                  <Badge variant="outline" className="ml-auto text-[10px] 2xl:text-sm">{sec.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 2xl:p-6 pt-0 space-y-2 2xl:space-y-4">
                {sec.items.map((item, i) => (
                  <p key={i} className="text-xs 2xl:text-base text-muted-foreground leading-relaxed flex gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasGenerated && !loading) {
    return (
      <Card className="glass-card">
       <CardContent className="p-12 2xl:p-16 3xl:p-20 text-center space-y-4 2xl:space-y-6">
          <div className="mx-auto w-16 h-16 2xl:w-20 2xl:h-20 3xl:w-24 3xl:h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
             <Brain className="w-8 h-8 2xl:w-10 2xl:h-10 3xl:w-12 3xl:h-12 text-primary" />
           </div>
           <div>
              <h3 className="text-lg 2xl:text-2xl 3xl:text-3xl font-bold mb-1">Análise SWOT Preditiva com IA</h3>
              <p className="text-sm 2xl:text-lg 3xl:text-xl text-muted-foreground max-w-md 2xl:max-w-lg mx-auto">
              Gere uma análise SWOT baseada em inteligência artificial considerando os dados operacionais, 
              exploratórios e financeiros do {block.name}.
            </p>
          </div>
          <Button onClick={generate} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Gerar Análise SWOT
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">A analisar dados do {block.name} com IA...</span>
        </div>
        <SwotSkeleton />
      </div>
    );
  }

  if (!swot) return null;

  return (
      <div className="space-y-4 2xl:space-y-6 3xl:space-y-8">
      {/* Summary */}
      <Card className="glass-card bg-primary/5 border-primary/20">
        <CardContent className="p-4 2xl:p-6 3xl:p-8">
          <div className="flex items-start gap-3 2xl:gap-4 3xl:gap-5">
            <div className="p-2 2xl:p-3 3xl:p-4 rounded-lg bg-primary/10 shrink-0">
              <Brain className="w-5 h-5 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-primary" />
            </div>
            <div className="space-y-2 2xl:space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm 2xl:text-lg 3xl:text-xl">Resumo Executivo</h3>
                <Button onClick={generate} variant="ghost" size="sm" className="gap-1.5 text-xs 2xl:text-sm 3xl:text-base h-7 2xl:h-9">
                  <RefreshCw className="w-3 h-3 2xl:w-4 2xl:h-4" />
                  Regenerar
                </Button>
              </div>
               <p className="text-sm 2xl:text-base 3xl:text-lg text-muted-foreground leading-relaxed">{swot.summary}</p>
               <div className="pt-1 2xl:pt-2 border-t border-border/50">
                 <p className="text-xs 2xl:text-base 3xl:text-lg font-medium text-primary">{swot.recommendation}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6 3xl:gap-8">
        <SwotSection title="Forças" icon={Shield} items={swot.strengths}
          color="border-l-success" bgColor="bg-success/10 text-success" />
        <SwotSection title="Fraquezas" icon={TrendingDown} items={swot.weaknesses}
          color="border-l-danger" bgColor="bg-danger/10 text-danger" />
        <SwotSection title="Oportunidades" icon={Lightbulb} items={swot.opportunities}
          color="border-l-primary" bgColor="bg-primary/10 text-primary" />
        <SwotSection title="Ameaças" icon={AlertTriangle} items={swot.threats}
          color="border-l-warning" bgColor="bg-warning/10 text-warning" />
      </div>
    </div>
  );
};
