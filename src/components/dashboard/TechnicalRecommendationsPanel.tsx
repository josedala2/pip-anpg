import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type TechnicalRecommendation } from "@/data/angolaBlocks";
import { Wrench, AlertTriangle, ArrowUp } from "lucide-react";

interface Props {
  recommendations: TechnicalRecommendation[];
  blockName: string;
}

const urgencyConfig: Record<string, { color: string; badge: "destructive" | "default" | "secondary" }> = {
  "Muito Alta": { color: "text-danger", badge: "destructive" },
  "Alta": { color: "text-warning", badge: "default" },
  "Média": { color: "text-muted-foreground", badge: "secondary" },
  "Baixa": { color: "text-muted-foreground", badge: "secondary" },
};

export const TechnicalRecommendationsPanel = ({ recommendations, blockName }: Props) => {
  if (!recommendations || recommendations.length === 0) return null;

  const muitoAlta = recommendations.filter(r => r.urgency === "Muito Alta").length;
  const alta = recommendations.filter(r => r.urgency === "Alta").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Recomendações Técnicas — Medidas Possíveis</CardTitle>
          </div>
          <div className="flex gap-2">
            {muitoAlta > 0 && (
              <Badge variant="destructive" className="text-[9px]">
                {muitoAlta} Muito Alta
              </Badge>
            )}
            {alta > 0 && (
              <Badge variant="default" className="text-[9px]">
                {alta} Alta
              </Badge>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Fonte: Relatório Estado das Concessões 2026 — {blockName}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] w-[180px]">Oportunidade</TableHead>
              <TableHead className="text-[10px]">Medidas Possíveis</TableHead>
              <TableHead className="text-[10px]">Impacto</TableHead>
              <TableHead className="text-[10px] text-center w-[90px]">Urgência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendations.map((rec, i) => {
              const cfg = urgencyConfig[rec.urgency] || urgencyConfig["Média"];
              return (
                <TableRow key={i}>
                  <TableCell className="py-2 text-xs font-semibold align-top">{rec.opportunity}</TableCell>
                  <TableCell className="py-2 text-[11px] align-top">
                    <ul className="space-y-0.5">
                      {rec.measures.map((m, j) => (
                        <li key={j} className="flex gap-1.5">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="py-2 text-[11px] text-muted-foreground align-top">{rec.impact}</TableCell>
                  <TableCell className="py-2 text-center align-top">
                    <Badge variant={cfg.badge} className="text-[9px]">
                      {rec.urgency}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
