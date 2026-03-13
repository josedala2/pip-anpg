import { type OilBlock } from "@/data/angolaBlocks";

// ── Strategic Concession Score ──
// 6 dimensions weighted as per ANPG strategic document

export type StrategicClassification =
  | "Revitalizar"
  | "Manter & Optimizar"
  | "Renegociar"
  | "Monitorar"
  | "Preparar Abandono"
  | "Relicitar";

export type UrgencyLevel = "Imediata" | "Elevada" | "Moderada" | "Baixa";

export interface DimensionScore {
  label: string;
  score: number; // 0-100
  weight: number; // percentage
  weighted: number; // score * weight / 100
  drivers: string[]; // explanation of key factors
}

export interface StrategicScore {
  blockId: string;
  blockName: string;
  operator: string;
  phase: string;
  totalScore: number; // 0-100
  dimensions: DimensionScore[];
  classification: StrategicClassification;
  urgency: UrgencyLevel;
  recommendation: string;
  riskOfInaction: string;
  expectedImpact: string;
  topDrivers: string[]; // top 3 variables influencing score
}

// ── Dimension calculators ──

const currentYear = 2026;

function productionScore(block: OilBlock): DimensionScore {
  const drivers: string[] = [];
  let score = 50; // baseline

  // Current production vs peak (from history)
  const peak = Math.max(...block.productionHistory.map(h => h.value), 1);
  const current = block.dailyProduction;
  const ratio = current / peak;

  if (current === 0) {
    score = 10;
    drivers.push("Sem produção activa");
  } else if (ratio >= 0.9) {
    score = 90;
    drivers.push(`Produção estável (${Math.round(ratio * 100)}% do pico)`);
  } else if (ratio >= 0.7) {
    score = 70;
    drivers.push(`Produção moderada (${Math.round(ratio * 100)}% do pico)`);
  } else if (ratio >= 0.5) {
    score = 50;
    drivers.push(`Declínio significativo (${Math.round(ratio * 100)}% do pico)`);
  } else {
    score = 30;
    drivers.push(`Declínio severo (${Math.round(ratio * 100)}% do pico)`);
  }

  // Decline trend from last months
  const history = block.productionHistory;
  if (history.length >= 6) {
    const first3 = history.slice(0, 3).reduce((s, h) => s + h.value, 0) / 3;
    const last3 = history.slice(-3).reduce((s, h) => s + h.value, 0) / 3;
    const decline = ((first3 - last3) / first3) * 100;
    if (decline > 10) {
      score -= 15;
      drivers.push(`Declínio recente de ${decline.toFixed(1)}%`);
    } else if (decline > 5) {
      score -= 8;
      drivers.push(`Declínio moderado de ${decline.toFixed(1)}%`);
    }
  }

  // Reserves
  if (block.estimatedReserves > 500) {
    score += 10;
    drivers.push(`Reservas elevadas: ${block.estimatedReserves} Mb`);
  } else if (block.estimatedReserves < 50) {
    score -= 10;
    drivers.push(`Reservas reduzidas: ${block.estimatedReserves} Mb`);
  }

  return { label: "Desempenho Produtivo", score: clamp(score), weight: 25, weighted: 0, drivers };
}

function facilitiesScore(block: OilBlock): DimensionScore {
  const drivers: string[] = [];
  let score = 50;

  const fd = block.facilityData;
  if (!fd) {
    return { label: "Integridade Instalações", score: 50, weight: 20, weighted: 0, drivers: ["Sem dados de instalações"] };
  }

  // Overall efficiency
  if (fd.overallEfficiency) {
    if (fd.overallEfficiency >= 90) {
      score = 85;
      drivers.push(`Eficiência elevada: ${fd.overallEfficiency}%`);
    } else if (fd.overallEfficiency >= 80) {
      score = 70;
      drivers.push(`Eficiência adequada: ${fd.overallEfficiency}%`);
    } else if (fd.overallEfficiency >= 70) {
      score = 55;
      drivers.push(`Eficiência moderada: ${fd.overallEfficiency}%`);
    } else {
      score = 35;
      drivers.push(`Eficiência baixa: ${fd.overallEfficiency}%`);
    }
  }

  // Age of installations
  if (fd.platformSpecs?.length) {
    const ages = fd.platformSpecs
      .filter(p => p.installationYear)
      .map(p => currentYear - p.installationYear!);
    const avgAge = ages.reduce((s, a) => s + a, 0) / (ages.length || 1);
    if (avgAge > 35) {
      score -= 20;
      drivers.push(`Instalações envelhecidas (média ${Math.round(avgAge)} anos)`);
    } else if (avgAge > 25) {
      score -= 10;
      drivers.push(`Instalações maduras (média ${Math.round(avgAge)} anos)`);
    }
  }

  // Production losses
  if (fd.productionLossesBbls && fd.production2025Bbls) {
    const lossRatio = fd.productionLossesBbls / fd.production2025Bbls;
    if (lossRatio > 0.1) {
      score -= 15;
      drivers.push(`Perdas elevadas: ${(lossRatio * 100).toFixed(1)}% da produção`);
    } else if (lossRatio > 0.05) {
      score -= 5;
      drivers.push(`Perdas moderadas: ${(lossRatio * 100).toFixed(1)}%`);
    }
  }

  // Issues
  const totalIssues = fd.areas.reduce((s, a) => s + (a.issues?.length || 0), 0);
  if (totalIssues >= 4) {
    score -= 10;
    drivers.push(`${totalIssues} problemas identificados`);
  }

  return { label: "Integridade Instalações", score: clamp(score), weight: 20, weighted: 0, drivers };
}

function economicScore(block: OilBlock): DimensionScore {
  const drivers: string[] = [];
  let score = 50;

  // Execution rate as proxy for economic health
  if (block.executionRate >= 85) {
    score = 80;
    drivers.push(`Taxa de execução elevada: ${block.executionRate}%`);
  } else if (block.executionRate >= 70) {
    score = 65;
    drivers.push(`Taxa de execução adequada: ${block.executionRate}%`);
  } else if (block.executionRate >= 50) {
    score = 45;
    drivers.push(`Taxa de execução moderada: ${block.executionRate}%`);
  } else {
    score = 25;
    drivers.push(`Taxa de execução baixa: ${block.executionRate}%`);
  }

  // OPEX per barrel
  if (block.economicData?.opexPerBarrel) {
    if (block.economicData.opexPerBarrel > 25) {
      score -= 15;
      drivers.push(`OPEX elevado: $${block.economicData.opexPerBarrel}/bbl`);
    } else if (block.economicData.opexPerBarrel < 15) {
      score += 10;
      drivers.push(`OPEX competitivo: $${block.economicData.opexPerBarrel}/bbl`);
    }
  }

  // Investment ratio (accumulated vs planned)
  if (block.plannedInvestment > 0) {
    const investRatio = block.accumulatedInvestment / block.plannedInvestment;
    if (investRatio > 0.9) {
      score += 5;
      drivers.push("Investimento quase concluído");
    } else if (investRatio < 0.3) {
      score -= 5;
      drivers.push(`Apenas ${Math.round(investRatio * 100)}% do investimento executado`);
    }
  }

  return { label: "Viabilidade Económica", score: clamp(score), weight: 15, weighted: 0, drivers };
}

function contractualScore(block: OilBlock): DimensionScore {
  const drivers: string[] = [];
  let score = 50;

  // Compliance score
  if (block.complianceScore >= 90) {
    score = 85;
    drivers.push(`Compliance elevado: ${block.complianceScore}%`);
  } else if (block.complianceScore >= 75) {
    score = 65;
    drivers.push(`Compliance adequado: ${block.complianceScore}%`);
  } else if (block.complianceScore >= 50) {
    score = 40;
    drivers.push(`Compliance insuficiente: ${block.complianceScore}%`);
  } else {
    score = 20;
    drivers.push(`Compliance crítico: ${block.complianceScore}%`);
  }

  // Contract time remaining
  if (block.contractInfo?.productionPeriodEnd) {
    const end = new Date(block.contractInfo.productionPeriodEnd);
    const months = Math.round((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
    if (months <= 12) {
      score -= 20;
      drivers.push("Contrato expira em menos de 12 meses");
    } else if (months <= 24) {
      score -= 10;
      drivers.push("Contrato expira em menos de 24 meses");
    } else if (months > 60) {
      score += 10;
      drivers.push("Prazo contratual confortável");
    }
  }

  return { label: "Estado Contratual", score: clamp(score), weight: 15, weighted: 0, drivers };
}

function explorationScore(block: OilBlock): DimensionScore {
  const drivers: string[] = [];
  let score = 30; // baseline lower — exploration is future potential

  // Prospects
  const numProspects = block.prospects?.length || 0;
  if (numProspects >= 10) {
    score = 80;
    drivers.push(`${numProspects} prospectos identificados`);
  } else if (numProspects >= 5) {
    score = 60;
    drivers.push(`${numProspects} prospectos identificados`);
  } else if (numProspects > 0) {
    score = 45;
    drivers.push(`${numProspects} prospecto(s) identificado(s)`);
  } else {
    drivers.push("Sem prospectos identificados");
  }

  // Resource estimates from prospects
  if (block.prospects?.length) {
    const totalResources = block.prospects.reduce((s, p) => s + p.resourcesMMBO, 0);
    const avgPos = block.prospects.reduce((s, p) => s + p.pos, 0) / block.prospects.length;
    if (totalResources > 500) {
      score += 15;
      drivers.push(`Recursos prospectivos: ${totalResources.toFixed(0)} MMBO`);
    }
    if (avgPos > 40) {
      score += 5;
      drivers.push(`Probabilidade média de sucesso: ${avgPos.toFixed(0)}%`);
    }
  }

  // Seismic coverage
  if (block.explorationSummary?.totalSeismic3DKm2 && block.explorationSummary.totalSeismic3DKm2 > 5000) {
    score += 5;
    drivers.push("Cobertura sísmica 3D extensa");
  }

  // Fields discovered
  const producingFields = block.fields?.filter(f => f.status === "Producing").length || 0;
  if (producingFields >= 3) {
    score += 5;
    drivers.push(`${producingFields} campos em produção`);
  }

  return { label: "Potencial Exploratório", score: clamp(score), weight: 15, weighted: 0, drivers };
}

function esgScore(block: OilBlock): DimensionScore {
  const drivers: string[] = [];
  let score = 60; // baseline

  // Environmental data
  if (block.environmentalData?.length) {
    const latest = block.environmentalData[block.environmentalData.length - 1];
    if (latest.oilSpillCount && latest.oilSpillCount > 0) {
      score -= 15;
      drivers.push(`${latest.oilSpillCount} derrame(s) registado(s) em ${latest.year}`);
    } else {
      score += 10;
      drivers.push("Zero derrames no último ano");
    }

    if (latest.gasFlaredMMSCFD && latest.gasFlaredTarget) {
      if (latest.gasFlaredMMSCFD > latest.gasFlaredTarget) {
        score -= 10;
        drivers.push("Flaring acima do objectivo");
      } else {
        score += 5;
        drivers.push("Flaring dentro do objectivo");
      }
    }
  } else {
    drivers.push("Sem dados ambientais disponíveis");
  }

  // HSE data
  if (block.hseData?.length) {
    const latest = block.hseData[block.hseData.length - 1];
    if (latest.fat > 0) {
      score -= 20;
      drivers.push(`${latest.fat} fatalidade(s) registada(s)`);
    }
    if (latest.trir > 2) {
      score -= 10;
      drivers.push(`TRIR elevado: ${latest.trir}`);
    } else if (latest.trir < 1) {
      score += 10;
      drivers.push(`TRIR excelente: ${latest.trir}`);
    }
  }

  return { label: "Risco ESG", score: clamp(score), weight: 10, weighted: 0, drivers };
}

// ── Classification logic ──

function classify(totalScore: number, block: OilBlock): { classification: StrategicClassification; urgency: UrgencyLevel; recommendation: string; riskOfInaction: string; expectedImpact: string } {
  const hasProduction = block.dailyProduction > 0;
  const hasReserves = block.estimatedReserves > 50;
  const lowCompliance = block.complianceScore < 70;
  const highRisk = block.riskScore >= 7;

  // Critical: very low score
  if (totalScore < 25) {
    if (!hasProduction && !hasReserves) {
      return {
        classification: "Preparar Abandono",
        urgency: "Elevada",
        recommendation: "Iniciar planeamento de abandono ou descomissionamento. Sem justificação económica para manutenção.",
        riskOfInaction: "Custos de manutenção sem retorno, degradação ambiental, responsabilidades legais crescentes.",
        expectedImpact: "Libertação de recursos para blocos produtivos, redução de passivo ambiental.",
      };
    }
    return {
      classification: "Relicitar",
      urgency: "Elevada",
      recommendation: "Preparar relicitação com novos termos contratuais e requisitos técnicos actualizados.",
      riskOfInaction: "Activo improdutivo, perda de janela de oportunidade, depreciação do potencial.",
      expectedImpact: "Novo operador pode revitalizar o bloco com investimento fresco.",
    };
  }

  if (totalScore < 40) {
    if (lowCompliance || highRisk) {
      return {
        classification: "Renegociar",
        urgency: "Imediata",
        recommendation: "Iniciar renegociação contratual com metas objectivas de investimento e produção.",
        riskOfInaction: "Incumprimento continuado, perda de receita fiscal, degradação operacional.",
        expectedImpact: "Novos termos podem reactivar investimento e reverter declínio.",
      };
    }
    return {
      classification: "Monitorar",
      urgency: "Moderada",
      recommendation: "Manter monitorização reforçada. Avaliar evolução nos próximos 6-12 meses.",
      riskOfInaction: "Declínio pode tornar-se irreversível sem intervenção atempada.",
      expectedImpact: "Identificação precoce de oportunidades de intervenção.",
    };
  }

  if (totalScore < 60) {
    if (hasReserves && hasProduction) {
      return {
        classification: "Revitalizar",
        urgency: "Moderada",
        recommendation: "Avaliar programa de revitalização: workover, infill drilling, EOR ou debottlenecking.",
        riskOfInaction: "Declínio produtivo acelerado, perda de reservas recuperáveis.",
        expectedImpact: "Potencial de recuperação de 10-30% de produção adicional.",
      };
    }
    return {
      classification: "Monitorar",
      urgency: "Baixa",
      recommendation: "Acompanhar indicadores-chave. Sem necessidade de intervenção imediata.",
      riskOfInaction: "Risco limitado no curto prazo.",
      expectedImpact: "Manutenção do desempenho actual.",
    };
  }

  if (totalScore < 80) {
    return {
      classification: "Manter & Optimizar",
      urgency: "Baixa",
      recommendation: "Optimizar operações correntes. Avaliar oportunidades de expansão marginal.",
      riskOfInaction: "Perda de oportunidades de optimização.",
      expectedImpact: "Ganhos incrementais de eficiência e produção.",
    };
  }

  return {
    classification: "Manter & Optimizar",
    urgency: "Baixa",
    recommendation: "Bloco de referência. Manter estratégia actual e explorar oportunidades de expansão.",
    riskOfInaction: "Mínimo. Activo em excelente condição.",
    expectedImpact: "Continuação do desempenho elevado.",
  };
}

// ── Main scoring function ──

export function calculateStrategicScore(block: OilBlock): StrategicScore {
  const dimensions = [
    productionScore(block),
    facilitiesScore(block),
    economicScore(block),
    contractualScore(block),
    explorationScore(block),
    esgScore(block),
  ];

  // Calculate weighted scores
  dimensions.forEach(d => {
    d.weighted = Math.round((d.score * d.weight) / 100);
  });

  const totalScore = dimensions.reduce((s, d) => s + d.weighted, 0);

  // Get top drivers across all dimensions
  const allDrivers = dimensions
    .flatMap(d => d.drivers.map(driver => ({ driver, score: d.score, weight: d.weight })))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(d => d.driver);

  const { classification, urgency, recommendation, riskOfInaction, expectedImpact } = classify(totalScore, block);

  return {
    blockId: block.id,
    blockName: block.name,
    operator: block.operator,
    phase: block.phase,
    totalScore,
    dimensions,
    classification,
    urgency,
    recommendation,
    riskOfInaction,
    expectedImpact,
    topDrivers: allDrivers,
  };
}

export function calculateAllScores(blocks: OilBlock[]): StrategicScore[] {
  return blocks.map(calculateStrategicScore).sort((a, b) => a.totalScore - b.totalScore);
}

// ── Helpers ──

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export const classificationConfig: Record<StrategicClassification, { color: string; bgColor: string }> = {
  "Revitalizar": { color: "text-[hsl(var(--chart-5))]", bgColor: "bg-[hsl(var(--chart-5))]/10 border-[hsl(var(--chart-5))]/30" },
  "Manter & Optimizar": { color: "text-success", bgColor: "bg-success/10 border-success/30" },
  "Renegociar": { color: "text-warning", bgColor: "bg-warning/10 border-warning/30" },
  "Monitorar": { color: "text-muted-foreground", bgColor: "bg-muted/50 border-border" },
  "Preparar Abandono": { color: "text-danger", bgColor: "bg-danger/10 border-danger/30" },
  "Relicitar": { color: "text-[hsl(var(--chart-4))]", bgColor: "bg-[hsl(var(--chart-4))]/10 border-[hsl(var(--chart-4))]/30" },
};

export const urgencyConfig: Record<UrgencyLevel, { color: string }> = {
  "Imediata": { color: "text-danger" },
  "Elevada": { color: "text-warning" },
  "Moderada": { color: "text-[hsl(var(--chart-3))]" },
  "Baixa": { color: "text-success" },
};
