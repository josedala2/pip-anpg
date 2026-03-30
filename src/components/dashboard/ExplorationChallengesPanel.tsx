import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ExplorationChallenge } from "@/data/angolaBlocks";
import { ShieldAlert, Crosshair, TrendingDown } from "lucide-react";

interface Props {
  challenges: ExplorationChallenge[];
  blockName: string;
}

const severityConfig: Record<string, { badge: "destructive" | "default" | "secondary"; icon: string }> = {
  Alta: { badge: "destructive", icon: "🔴" },
  Média: { badge: "default", icon: "🟡" },
  Baixa: { badge: "secondary", icon: "🟢" },
};

const categoryIcon: Record<string, React.ReactNode> = {
  Técnico: <Crosshair className="w-4 h-4 text-primary" />,
  Operacional: <TrendingDown className="w-4 h-4 text-warning" />,
  Estratégico: <ShieldAlert className="w-4 h-4 text-danger" />,
};

export const ExplorationChallengesPanel = ({ challenges, blockName }: Props) => {
  if (!challenges || challenges.length === 0) return null;

  const highCount = challenges.filter(c => c.severity === "Alta").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-danger" />
            <CardTitle className="text-sm font-semibold">Desafios de Exploração</CardTitle>
          </div>
          {highCount > 0 && (
            <Badge variant="destructive" className="text-[9px]">
              {highCount} Alta Prioridade
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Fonte: Relatório Estado das Concessões 2026 — {blockName}
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {challenges.map((challenge, i) => {
          const cfg = severityConfig[challenge.severity] || severityConfig.Média;
          return (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="shrink-0 mt-0.5">
                {categoryIcon[challenge.category] || categoryIcon.Técnico}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">{challenge.title}</span>
                  <Badge variant={cfg.badge} className="text-[9px]">
                    {challenge.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    {challenge.category}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
