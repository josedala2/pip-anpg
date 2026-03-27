import { type OilBlock, oilBlocks } from "@/data/angolaBlocks";
import { runAllScenarios, runAllScenariosForBlock, PREDEFINED_SCENARIOS, type ScenarioOutput } from "@/lib/scenarioEngine";

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertCategory = "contract" | "integrity" | "decline" | "opex" | "compliance" | "esg" | "forecast";

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
  /** If set, this rule has a user-configurable numeric threshold */
  configurable?: { key: string; unit: string; min: number; max: number; step: number; value: number };
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
  // ESG: TRIR elevated
  {
    id: "esg-trir-high",
    category: "esg",
    label: "TRIR > 0.5",
    description: "Blocos com taxa de incidentes registáveis (TRIR) acima de 0.5",
    enabled: true,
    evaluate: (block) => {
      if (!block.hseData?.length) return [];
      const latest = block.hseData[block.hseData.length - 1];
      if (latest.trir > 0.5) {
        return [{
          id: makeId(block.id, "esg-trir-high"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "esg", severity: latest.trir > 1.0 ? "critical" : "high",
          title: "TRIR elevado",
          description: `TRIR de ${latest.trir.toFixed(2)} em ${latest.year} no ${block.name}.`,
          metric: `${latest.trir.toFixed(2)}`,
          threshold: "> 0.50",
          actionRequired: "Rever plano de segurança ocupacional e reforçar medidas preventivas.",
        }];
      }
      return [];
    },
  },
  // ESG: Flaring elevated
  {
    id: "esg-flaring-high",
    category: "esg",
    label: "Flaring > 10 MMSCFD",
    description: "Blocos com queima de gás (flaring) acima de 10 MMSCFD",
    enabled: true,
    evaluate: (block) => {
      if (!block.environmentalData?.length) return [];
      const latest = block.environmentalData[block.environmentalData.length - 1];
      if (latest.gasFlaredMMSCFD != null && latest.gasFlaredMMSCFD > 10) {
        return [{
          id: makeId(block.id, "esg-flaring-high"),
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "esg", severity: latest.gasFlaredMMSCFD > 20 ? "critical" : "high",
          title: "Flaring elevado",
          description: `Flaring de ${latest.gasFlaredMMSCFD.toFixed(1)} MMSCFD em ${latest.year} no ${block.name}.`,
          metric: `${latest.gasFlaredMMSCFD.toFixed(1)} MMSCFD`,
          threshold: "> 10 MMSCFD",
          actionRequired: "Avaliar soluções de aproveitamento de gás e plano de redução de flaring.",
        }];
      }
      return [];
    },
  },
];

// ── Forecast-specific alerts (national + per-block) ──

export interface ForecastAlert extends Alert {
  scenarioId?: string;
  scenarioName?: string;
  yearHorizon?: number;
}

export function evaluateForecastAlerts(): ForecastAlert[] {
  const alerts: ForecastAlert[] = [];
  const nationalOutputs = runAllScenarios();
  const baseScenario = nationalOutputs.find(o => o.scenario.id === "continuidade")!;
  const optimScenario = nationalOutputs.find(o => o.scenario.id === "optimizacao")!;

  // ── National-level alerts ──

  // 1. NPV negativo em qualquer cenário
  nationalOutputs.forEach(o => {
    if (o.npv < 0) {
      alerts.push({
        id: `forecast-nat-npv-neg-${o.scenario.id}`,
        blockId: "national", blockName: "Nacional", operator: "—",
        category: "forecast", severity: "critical",
        title: `NPV Nacional negativo — ${o.scenario.name}`,
        description: `O cenário "${o.scenario.name}" resulta em NPV de $${(o.npv / 1000).toFixed(1)}B, indicando destruição de valor a nível nacional.`,
        metric: `$${(o.npv / 1000).toFixed(1)}B`,
        threshold: "< $0",
        actionRequired: "Avaliar medidas urgentes de optimização ou revisão de regime fiscal.",
        scenarioId: o.scenario.id,
        scenarioName: o.scenario.name,
      });
    }
  });

  // 2. Produção nacional cai abaixo de 800k BOPD (limiar estratégico)
  const PROD_THRESHOLD = 800000;
  nationalOutputs.forEach(o => {
    const belowYears = o.projections.filter(p => p.production < PROD_THRESHOLD);
    if (belowYears.length > 0) {
      const firstYear = belowYears[0].year;
      alerts.push({
        id: `forecast-nat-prod-low-${o.scenario.id}`,
        blockId: "national", blockName: "Nacional", operator: "—",
        category: "forecast",
        severity: firstYear <= 2030 ? "critical" : firstYear <= 2035 ? "high" : "medium",
        title: `Produção nacional < 800k BOPD em ${firstYear}`,
        description: `No cenário "${o.scenario.name}", a produção cai para ${(belowYears[0].production / 1000).toFixed(0)}k BOPD em ${firstYear}.`,
        metric: `${(belowYears[0].production / 1000).toFixed(0)}k BOPD`,
        threshold: "< 800k BOPD",
        actionRequired: "Intensificar programas de revitalização e acelerar licenciamento de novos blocos.",
        scenarioId: o.scenario.id,
        scenarioName: o.scenario.name,
        yearHorizon: firstYear,
      });
    }
  });

  // 3. Receita do Estado cai > 40% face ao primeiro ano
  nationalOutputs.forEach(o => {
    const firstYearRevenue = o.projections[0]?.stateRevenue || 1;
    const droppedYears = o.projections.filter(p => p.stateRevenue < firstYearRevenue * 0.6);
    if (droppedYears.length > 0) {
      const firstDrop = droppedYears[0];
      const dropPct = ((firstYearRevenue - firstDrop.stateRevenue) / firstYearRevenue * 100).toFixed(0);
      alerts.push({
        id: `forecast-nat-revenue-drop-${o.scenario.id}`,
        blockId: "national", blockName: "Nacional", operator: "—",
        category: "forecast",
        severity: parseInt(dropPct) > 60 ? "critical" : "high",
        title: `Receita Estado cai ${dropPct}% em ${firstDrop.year}`,
        description: `No cenário "${o.scenario.name}", a receita do Estado baixa de $${firstYearRevenue}MM para $${firstDrop.stateRevenue}MM em ${firstDrop.year}.`,
        metric: `-${dropPct}%`,
        threshold: "> -40%",
        actionRequired: "Rever política fiscal e avaliar impacto no Orçamento Geral do Estado.",
        scenarioId: o.scenario.id,
        scenarioName: o.scenario.name,
        yearHorizon: firstDrop.year,
      });
    }
  });

  // ── Per-block alerts ──
  const producing = oilBlocks.filter(b => b.dailyProduction > 0);
  producing.forEach(block => {
    const blockOutputs = runAllScenariosForBlock(block);

    // 4. Bloco com NPV negativo no cenário base (continuidade)
    const baseCont = blockOutputs.find(o => o.scenario.id === "continuidade");
    if (baseCont && baseCont.npv < 0) {
      alerts.push({
        id: `forecast-block-npv-neg-${block.id}`,
        blockId: block.id, blockName: block.name, operator: block.operator,
        category: "forecast", severity: "critical",
        title: `NPV negativo no cenário Continuidade`,
        description: `${block.name} tem NPV de $${baseCont.npv}MM no cenário base, indicando que a concessão destrói valor sem intervenção.`,
        metric: `$${baseCont.npv}MM`,
        threshold: "< $0",
        actionRequired: "Avaliar viabilidade económica da concessão e considerar abandono planeado.",
        scenarioId: "continuidade",
        scenarioName: "Continuidade",
      });
    }

    // 5. Produção do bloco cai > 70% em 5 anos (cenário optimização)
    const optim = blockOutputs.find(o => o.scenario.id === "optimizacao");
    if (optim) {
      const prod5 = optim.projections[4]?.production || 0;
      const decline = block.dailyProduction > 0 ? ((block.dailyProduction - prod5) / block.dailyProduction * 100) : 0;
      if (decline > 70) {
        alerts.push({
          id: `forecast-block-decline70-${block.id}`,
          blockId: block.id, blockName: block.name, operator: block.operator,
          category: "forecast", severity: "high",
          title: `Declínio > 70% mesmo com optimização`,
          description: `Mesmo no cenário optimizado, ${block.name} perde ${decline.toFixed(0)}% de produção em 5 anos (${(prod5 / 1000).toFixed(1)}k BOPD).`,
          metric: `-${decline.toFixed(0)}%`,
          threshold: "> -70% em 5 anos",
          actionRequired: "Priorizar programa de EOR/IOR ou iniciar planeamento de descomissionamento.",
          scenarioId: "optimizacao",
          scenarioName: "Optimização Operacional",
          yearHorizon: 2031,
        });
      }
    }

    // 6. Break-even do bloco acima do Brent no cenário base
    if (baseCont && baseCont.avgCostPerBarrel > 78) {
      alerts.push({
        id: `forecast-block-breakeven-${block.id}`,
        blockId: block.id, blockName: block.name, operator: block.operator,
        category: "forecast", severity: baseCont.avgCostPerBarrel > 90 ? "critical" : "high",
        title: `Break-even acima do preço Brent`,
        description: `${block.name} tem custo médio de $${baseCont.avgCostPerBarrel.toFixed(1)}/bbl, acima da referência de $78/bbl.`,
        metric: `$${baseCont.avgCostPerBarrel.toFixed(1)}/bbl`,
        threshold: "> $78/bbl",
        actionRequired: "Rever estrutura de custos e avaliar optimização operacional urgente.",
        scenarioId: "continuidade",
        scenarioName: "Continuidade",
      });
    }
  });

  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ── Evaluate all ──

export function evaluateAlerts(blocks: OilBlock[] = oilBlocks, rules: AlertRule[] = defaultRules): Alert[] {
  const alerts: Alert[] = [];
  const enabledRules = rules.filter(r => r.enabled);

  for (const block of blocks) {
    if (!block) continue;
    for (const rule of enabledRules) {
      try {
        alerts.push(...rule.evaluate(block));
      } catch {
        // skip blocks missing expected properties
      }
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
  forecast: "Previsão",
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
  forecast: { color: "text-primary", icon: "TrendingUp" },
};
