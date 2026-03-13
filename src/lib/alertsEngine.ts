import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertCategory = "contract" | "integrity" | "decline" | "opex" | "compliance" | "esg";

export interface Alert {
  id: string;
  blockId: string;
  blockName: string;
  operator: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  metric?: string;
  threshold?: string;
  actionRequired: string;
}

export interface AlertRule {
  id: string;
  category: AlertCategory;
  label: string;
  description: string;
  enabled: boolean;
  evaluate: (block: OilBlock) => Alert[];
}

const currentYear = 2026;

function makeId(blockId: string, rule: string) {
  return `${blockId}--${rule}`;
}

const severityOrder: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// ── Rules ──

export const defaultRules: AlertRule[] = [
  // CONTRACT: expiry < 12m
  {
    id: "contract-12m",
    category: "contract",
    label: "Contrato expira em <12 meses",
    description: "Blocos com prazo contratual inferior a 12 meses",
    enabled: true,
    evaluate: (block) => {
      if (!block.contractInfo?.productionPeriodEnd) return [];
      const end = new Date(block.contractInfo.productionPeriodEnd);
      const months = Math.round((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      if (months > 0 && months <= 12) {
        return [{
          id: makeId(block.id, "contract-12m"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "contract", severity: "critical",
          title: "Contrato a expirar em breve",
          description: `O contrato do ${block.name} expira em ${months} meses (${block.contractInfo.productionPeriodEnd}).`,
          metric: `${months} meses`,
          threshold: "< 12 meses",
          actionRequired: "Iniciar processo de renegociação ou relicitação imediata.",
        }];
      }
      return [];
    },
  },
  // CONTRACT: expiry < 24m
  {
    id: "contract-24m",
    category: "contract",
    label: "Contrato expira em <24 meses",
    description: "Blocos com prazo contratual inferior a 24 meses",
    enabled: true,
    evaluate: (block) => {
      if (!block.contractInfo?.productionPeriodEnd) return [];
      const end = new Date(block.contractInfo.productionPeriodEnd);
      const months = Math.round((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      if (months > 12 && months <= 24) {
        return [{
          id: makeId(block.id, "contract-24m"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "contract", severity: "high",
          title: "Contrato expira dentro de 24 meses",
          description: `O contrato do ${block.name} expira em ${months} meses.`,
          metric: `${months} meses`,
          threshold: "< 24 meses",
          actionRequired: "Planear renegociação contratual e avaliar condições de extensão.",
        }];
      }
      return [];
    },
  },
  // INTEGRITY: efficiency < 70%
  {
    id: "integrity-efficiency",
    category: "integrity",
    label: "Eficiência de instalações < 70%",
    description: "Blocos com eficiência operacional abaixo de 70%",
    enabled: true,
    evaluate: (block) => {
      if (!block.facilityData?.overallEfficiency) return [];
      if (block.facilityData.overallEfficiency < 70) {
        return [{
          id: makeId(block.id, "integrity-eff"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "integrity", severity: "high",
          title: "Eficiência de instalações baixa",
          description: `Eficiência de ${block.facilityData.overallEfficiency}% no ${block.name}.`,
          metric: `${block.facilityData.overallEfficiency}%`,
          threshold: "< 70%",
          actionRequired: "Programar inspecção técnica e avaliar plano de manutenção.",
        }];
      }
      return [];
    },
  },
  // INTEGRITY: age > 30 years
  {
    id: "integrity-age",
    category: "integrity",
    label: "Instalações com mais de 30 anos",
    description: "Plataformas ou FPSOs com idade superior a 30 anos",
    enabled: true,
    evaluate: (block) => {
      if (!block.facilityData?.platformSpecs?.length) return [];
      const old = block.facilityData.platformSpecs.filter(p => p.installationYear && (currentYear - p.installationYear) > 30);
      if (old.length > 0) {
        return [{
          id: makeId(block.id, "integrity-age"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "integrity", severity: "medium",
          title: `${old.length} instalação(ões) com >30 anos`,
          description: `${old.map(p => `${p.name} (${currentYear - p.installationYear!} anos)`).join(", ")}`,
          metric: `${old.length} instalações`,
          threshold: "> 30 anos",
          actionRequired: "Avaliar extensão de vida útil ou plano de descomissionamento.",
        }];
      }
      return [];
    },
  },
  // DECLINE: production < 50% of peak
  {
    id: "decline-severe",
    category: "decline",
    label: "Declínio severo de produção",
    description: "Produção actual inferior a 50% do pico histórico",
    enabled: true,
    evaluate: (block) => {
      if (block.dailyProduction === 0) return [];
      const peak = Math.max(...block.productionHistory.map(h => h.value), 1);
      const ratio = block.dailyProduction / peak;
      if (ratio < 0.5) {
        return [{
          id: makeId(block.id, "decline-severe"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "decline", severity: "high",
          title: "Declínio severo de produção",
          description: `Produção actual é ${Math.round(ratio * 100)}% do pico (${block.dailyProduction.toLocaleString()} vs ${peak.toLocaleString()} BOPD).`,
          metric: `${Math.round(ratio * 100)}% do pico`,
          threshold: "< 50%",
          actionRequired: "Avaliar programa de revitalização ou workover.",
        }];
      }
      return [];
    },
  },
  // DECLINE: recent trend (last 6 months)
  {
    id: "decline-recent",
    category: "decline",
    label: "Tendência de declínio recente (>10%)",
    description: "Queda superior a 10% nos últimos 6 meses de produção",
    enabled: true,
    evaluate: (block) => {
      const h = block.productionHistory;
      if (h.length < 6) return [];
      const first3 = h.slice(0, 3).reduce((s, v) => s + v.value, 0) / 3;
      const last3 = h.slice(-3).reduce((s, v) => s + v.value, 0) / 3;
      if (first3 === 0) return [];
      const decline = ((first3 - last3) / first3) * 100;
      if (decline > 10) {
        return [{
          id: makeId(block.id, "decline-recent"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "decline", severity: "medium",
          title: "Tendência de declínio recente",
          description: `Declínio de ${decline.toFixed(1)}% nos últimos 6 meses no ${block.name}.`,
          metric: `${decline.toFixed(1)}%`,
          threshold: "> 10%",
          actionRequired: "Monitorizar evolução e avaliar causas do declínio.",
        }];
      }
      return [];
    },
  },
  // OPEX: high cost per barrel
  {
    id: "opex-high",
    category: "opex",
    label: "OPEX > $25/barril",
    description: "Custo operacional por barril acima de $25",
    enabled: true,
    evaluate: (block) => {
      const opex = block.economicData?.opexPerBarrel;
      if (!opex || opex <= 25) return [];
      return [{
        id: makeId(block.id, "opex-high"),
        blockId: block.id, blockName: block.name, operator: block.operator,
        category: "opex", severity: opex > 35 ? "critical" : "high",
        title: "OPEX por barril elevado",
        description: `OPEX de $${opex}/bbl no ${block.name}.`,
        metric: `$${opex}/bbl`,
        threshold: "> $25/bbl",
        actionRequired: "Rever estrutura de custos operacionais com o operador.",
      }];
    },
  },
  // OPEX: execution rate < 60%
  {
    id: "opex-execution",
    category: "opex",
    label: "Taxa de execução < 60%",
    description: "Investimento executado abaixo de 60% do planeado",
    enabled: true,
    evaluate: (block) => {
      if (block.executionRate >= 60) return [];
      return [{
        id: makeId(block.id, "opex-execution"),
        blockId: block.id, blockName: block.name, operator: block.operator,
        category: "opex", severity: block.executionRate < 40 ? "high" : "medium",
        title: "Taxa de execução baixa",
        description: `Execução de ${block.executionRate}% no ${block.name}.`,
        metric: `${block.executionRate}%`,
        threshold: "< 60%",
        actionRequired: "Solicitar justificação ao operador e avaliar penalizações.",
      }];
    },
  },
  // COMPLIANCE: < 70%
  {
    id: "compliance-low",
    category: "compliance",
    label: "Compliance < 70%",
    description: "Score de compliance abaixo de 70%",
    enabled: true,
    evaluate: (block) => {
      if (block.complianceScore >= 70) return [];
      return [{
        id: makeId(block.id, "compliance-low"),
        blockId: block.id, blockName: block.name, operator: block.operator,
        category: "compliance", severity: block.complianceScore < 50 ? "critical" : "high",
        title: "Compliance insuficiente",
        description: `Compliance de ${block.complianceScore}% no ${block.name}.`,
        metric: `${block.complianceScore}%`,
        threshold: "< 70%",
        actionRequired: "Notificar operador e agendar auditoria contratual.",
      }];
    },
  },
  // ESG: fatalities
  {
    id: "esg-fatalities",
    category: "esg",
    label: "Fatalidades registadas",
    description: "Blocos com fatalidades no último ano",
    enabled: true,
    evaluate: (block) => {
      if (!block.hseData?.length) return [];
      const latest = block.hseData[block.hseData.length - 1];
      if (latest.fat > 0) {
        return [{
          id: makeId(block.id, "esg-fat"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "esg", severity: "critical",
          title: "Fatalidade(s) registada(s)",
          description: `${latest.fat} fatalidade(s) em ${latest.year} no ${block.name}.`,
          metric: `${latest.fat}`,
          threshold: "> 0",
          actionRequired: "Revisão imediata do plano de segurança e investigação do incidente.",
        }];
      }
      return [];
    },
  },
  // ESG: oil spills
  {
    id: "esg-spills",
    category: "esg",
    label: "Derrames de petróleo",
    description: "Blocos com derrames no último ano",
    enabled: true,
    evaluate: (block) => {
      if (!block.environmentalData?.length) return [];
      const latest = block.environmentalData[block.environmentalData.length - 1];
      if (latest.oilSpillCount && latest.oilSpillCount > 0) {
        return [{
          id: makeId(block.id, "esg-spill"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "esg", severity: latest.oilSpillCount > 2 ? "critical" : "high",
          title: "Derrames de petróleo",
          description: `${latest.oilSpillCount} derrame(s) registado(s) em ${latest.year}.`,
          metric: `${latest.oilSpillCount}`,
          threshold: "> 0",
          actionRequired: "Investigar causa e reforçar medidas preventivas.",
        }];
      }
      return [];
    },
  },
];

// ── Evaluate all ──

export function evaluateAlerts(blocks: OilBlock[] = oilBlocks, rules: AlertRule[] = defaultRules): Alert[] {
  const alerts: Alert[] = [];
  const enabledRules = rules.filter(r => r.enabled);

  for (const block of blocks) {
    for (const rule of enabledRules) {
      alerts.push(...rule.evaluate(block));
    }
  }

  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export const categoryLabels: Record<AlertCategory, string> = {
  contract: "Contratos",
  integrity: "Integridade",
  decline: "Declínio",
  opex: "OPEX",
  compliance: "Compliance",
  esg: "ESG",
};

export const severityLabels: Record<AlertSeverity, string> = {
  critical: "Crítico",
  high: "Elevado",
  medium: "Moderado",
  low: "Baixo",
};

export const severityStyles: Record<AlertSeverity, { color: string; bg: string }> = {
  critical: { color: "text-danger", bg: "bg-danger/10 border-danger/30" },
  high: { color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  medium: { color: "text-[hsl(var(--chart-3))]", bg: "bg-[hsl(var(--chart-3))]/10 border-[hsl(var(--chart-3))]/30" },
  low: { color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
};

export const categoryStyles: Record<AlertCategory, { color: string; icon: string }> = {
  contract: { color: "text-[hsl(var(--chart-4))]", icon: "FileText" },
  integrity: { color: "text-warning", icon: "Wrench" },
  decline: { color: "text-danger", icon: "TrendingDown" },
  opex: { color: "text-[hsl(var(--chart-5))]", icon: "DollarSign" },
  compliance: { color: "text-[hsl(var(--chart-3))]", icon: "Shield" },
  esg: { color: "text-success", icon: "Leaf" },
};
