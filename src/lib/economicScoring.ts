import { type OilBlock } from "@/data/angolaBlocks";

// ── Economic Score Engine ──
// 5 dimensions, 0-100 score per concession

const BRENT_PRICE = 78; // USD/bbl reference

export type EconomicClassification =
  | "Activo Estratégico"
  | "Activo Rentável"
  | "Activo em Observação"
  | "Activo de Alto Risco"
  | "Activo Inviável";

export interface EconomicDimension {
  label: string;
  score: number;
  weight: number;
  weighted: number;
  drivers: string[];
}

export interface EconomicScoreResult {
  blockId: string;
  blockName: string;
  operator: string;
  basin: string;
  dailyProduction: number;
  estimatedReserves: number;
  totalScore: number;
  classification: EconomicClassification;
  dimensions: EconomicDimension[];
  recommendation: string;
  // Derived KPIs
  opexPerBarrel: number;
  breakeven: number;
  npvTotal: number; // MMUSD
  stateRevenue: number; // MMUSD/year estimated
  economicMargin: number; // % margin above breakeven
}

// ── Dimension 1: Rentabilidade (30%) ──
function rentabilidadeScore(block: OilBlock): EconomicDimension {
  const drivers: string[] = [];
  let score = 50;

  // NPV analysis
  const npvData = block.economicVision?.npvByPeriod;
  if (npvData?.length) {
    const totalGE = npvData.reduce((s, p) => s + p.ge, 0);
    const totalImpostos = npvData.reduce((s, p) => s + p.impostos, 0);
    const total = totalGE + totalImpostos;
    if (total > 50000) { score = 95; drivers.push(`NPV total elevado: $${(total / 1000).toFixed(1)}B`); }
    else if (total > 10000) { score = 80; drivers.push(`NPV sólido: $${(total / 1000).toFixed(1)}B`); }
    else if (total > 2000) { score = 60; drivers.push(`NPV moderado: $${total.toFixed(0)}MM`); }
    else if (total > 0) { score = 40; drivers.push(`NPV reduzido: $${total.toFixed(0)}MM`); }
    else { score = 15; drivers.push("NPV negativo ou zero"); }
  } else {
    // Proxy: use daily production * Brent
    const annualRevenue = block.dailyProduction * 365 * BRENT_PRICE / 1e6;
    if (annualRevenue > 1000) { score = 75; drivers.push(`Receita anual estimada: $${annualRevenue.toFixed(0)}MM`); }
    else if (annualRevenue > 200) { score = 55; drivers.push(`Receita anual estimada: $${annualRevenue.toFixed(0)}MM`); }
    else if (annualRevenue > 0) { score = 35; drivers.push(`Receita anual reduzida: $${annualRevenue.toFixed(0)}MM`); }
    else { score = 10; drivers.push("Sem produção/receita"); }
  }

  // Cash flow trend
  const cf = block.economicVision?.cashFlowTimeSeries;
  if (cf && cf.length >= 4) {
    const recent = cf.filter(c => c.year >= 2022);
    if (recent.length >= 2) {
      const first = recent[0].ge + recent[0].impostos;
      const last = recent[recent.length - 1].ge + recent[recent.length - 1].impostos;
      if (last < first * 0.5) { score -= 10; drivers.push("Cash flow em declínio acentuado"); }
    }
  }

  return { label: "Rentabilidade", score: clamp(score), weight: 30, weighted: 0, drivers };
}

// ── Dimension 2: Eficiência de Custos (20%) ──
function eficienciaCustosScore(block: OilBlock): EconomicDimension {
  const drivers: string[] = [];
  let score = 50;

  const opex = block.economicData?.opexPerBarrel;
  if (opex != null) {
    if (opex < 12) { score = 90; drivers.push(`OPEX muito competitivo: $${opex}/bbl`); }
    else if (opex < 18) { score = 75; drivers.push(`OPEX competitivo: $${opex}/bbl`); }
    else if (opex < 25) { score = 55; drivers.push(`OPEX moderado: $${opex}/bbl`); }
    else if (opex < 35) { score = 35; drivers.push(`OPEX elevado: $${opex}/bbl`); }
    else { score = 15; drivers.push(`OPEX muito elevado: $${opex}/bbl`); }
  } else {
    drivers.push("Sem dados de OPEX/barril");
  }

  // Technical cost
  const tc = block.economicVision?.technicalCost;
  if (tc) {
    const total = tc.capexPerBarrel + tc.opexPerBarrel;
    if (total < 20) { score += 10; drivers.push(`Custo técnico baixo: $${total.toFixed(1)}/bbl`); }
    else if (total > 40) { score -= 10; drivers.push(`Custo técnico elevado: $${total.toFixed(1)}/bbl`); }
  }

  return { label: "Eficiência de Custos", score: clamp(score), weight: 20, weighted: 0, drivers };
}

// ── Dimension 3: Sustentabilidade do Activo (20%) ──
function sustentabilidadeScore(block: OilBlock): EconomicDimension {
  const drivers: string[] = [];
  let score = 50;

  // Reserves
  if (block.estimatedReserves > 500) { score = 85; drivers.push(`Reservas elevadas: ${block.estimatedReserves} Mb`); }
  else if (block.estimatedReserves > 200) { score = 70; drivers.push(`Reservas adequadas: ${block.estimatedReserves} Mb`); }
  else if (block.estimatedReserves > 50) { score = 50; drivers.push(`Reservas moderadas: ${block.estimatedReserves} Mb`); }
  else if (block.estimatedReserves > 0) { score = 30; drivers.push(`Reservas reduzidas: ${block.estimatedReserves} Mb`); }
  else { score = 10; drivers.push("Sem reservas estimadas"); }

  // Decline rate proxy
  const history = block.productionHistory;
  if (history.length >= 6) {
    const first3 = history.slice(0, 3).reduce((s, h) => s + h.value, 0) / 3;
    const last3 = history.slice(-3).reduce((s, h) => s + h.value, 0) / 3;
    if (first3 > 0) {
      const decline = ((first3 - last3) / first3) * 100;
      if (decline > 15) { score -= 15; drivers.push(`Declínio acentuado: ${decline.toFixed(1)}%`); }
      else if (decline > 5) { score -= 5; drivers.push(`Declínio moderado: ${decline.toFixed(1)}%`); }
      else if (decline < -2) { score += 5; drivers.push("Produção em crescimento"); }
    }
  }

  // End of life
  const eol = block.facilityData?.endOfLifeYear;
  if (eol) {
    const remaining = eol - 2026;
    if (remaining > 15) { score += 5; drivers.push(`Vida útil longa: ${remaining} anos`); }
    else if (remaining < 5) { score -= 10; drivers.push(`Vida útil curta: ${remaining} anos`); }
  }

  return { label: "Sustentabilidade", score: clamp(score), weight: 20, weighted: 0, drivers };
}

// ── Dimension 4: Contribuição Fiscal (15%) ──
function contribuicaoFiscalScore(block: OilBlock): EconomicDimension {
  const drivers: string[] = [];
  let score = 50;

  const fiscal = block.contractInfo?.fiscalConditions;
  if (fiscal) {
    // Higher fiscal take = more for the State
    const totalRate = (fiscal.irp || 0) + (fiscal.ipp || 0);
    if (totalRate > 70) { score = 85; drivers.push(`Carga fiscal elevada: ${totalRate}%`); }
    else if (totalRate > 50) { score = 65; drivers.push(`Carga fiscal moderada: ${totalRate}%`); }
    else if (totalRate > 30) { score = 45; drivers.push(`Carga fiscal reduzida: ${totalRate}%`); }
    else { score = 25; drivers.push("Regime fiscal muito favorável ao operador"); }
  }

  // Revenue share history
  const share = block.economicData?.stateRevenueShare;
  if (share?.length) {
    const latest = share[share.length - 1];
    if (latest.percentage > 50) { score += 10; drivers.push(`Estado recebe ${latest.percentage}% (${latest.period})`); }
    else if (latest.percentage < 20) { score -= 10; drivers.push(`Receita Estado reduzida a ${latest.percentage}%`); }
  }

  // Annual state revenue proxy
  const annualStateRev = block.dailyProduction * 365 * BRENT_PRICE * 0.3 / 1e6;
  if (annualStateRev > 500) { drivers.push(`Contribuição anual estimada: $${annualStateRev.toFixed(0)}MM`); }

  return { label: "Contribuição Fiscal", score: clamp(score), weight: 15, weighted: 0, drivers };
}

// ── Dimension 5: Risco Económico (15%) ──
function riscoEconomicoScore(block: OilBlock): EconomicDimension {
  const drivers: string[] = [];
  let score = 70; // higher = less risk

  const opex = block.economicData?.opexPerBarrel || 20;
  const breakeven = getBlockBreakeven(block);
  const margin = ((BRENT_PRICE - breakeven) / BRENT_PRICE) * 100;

  if (margin > 50) { score = 90; drivers.push(`Margem confortável: ${margin.toFixed(0)}%`); }
  else if (margin > 30) { score = 70; drivers.push(`Margem adequada: ${margin.toFixed(0)}%`); }
  else if (margin > 10) { score = 45; drivers.push(`Margem reduzida: ${margin.toFixed(0)}%`); }
  else if (margin > 0) { score = 20; drivers.push(`Próximo do break-even: margem ${margin.toFixed(0)}%`); }
  else { score = 5; drivers.push("Abaixo do break-even — destruição de valor"); }

  // Abandonment costs
  const aband = block.economicData?.abandonment;
  if (aband) {
    const funded = aband.fundingDeposited / aband.total * 100;
    if (funded < 10) { score -= 15; drivers.push(`Abandono sub-financiado: ${funded.toFixed(0)}%`); }
    else if (funded < 50) { score -= 5; drivers.push(`Fundo de abandono a ${funded.toFixed(0)}%`); }
  }

  return { label: "Risco Económico", score: clamp(score), weight: 15, weighted: 0, drivers };
}

// ── Classification ──
function getClassification(score: number): EconomicClassification {
  if (score >= 80) return "Activo Estratégico";
  if (score >= 60) return "Activo Rentável";
  if (score >= 40) return "Activo em Observação";
  if (score >= 20) return "Activo de Alto Risco";
  return "Activo Inviável";
}

function getRecommendation(cls: EconomicClassification): string {
  switch (cls) {
    case "Activo Estratégico": return "Manter e optimizar produção. Activo de referência.";
    case "Activo Rentável": return "Monitorizar e melhorar eficiência operacional.";
    case "Activo em Observação": return "Analisar redução de custos e potencial de revitalização.";
    case "Activo de Alto Risco": return "Avaliar revitalização urgente ou renegociação contratual.";
    case "Activo Inviável": return "Preparar abandono ou reestruturação profunda.";
  }
}

// ── Derived KPIs ──
export function getBlockBreakeven(block: OilBlock): number {
  const opex = block.economicData?.opexPerBarrel || 20;
  const tc = block.economicVision?.technicalCost;
  if (tc) return tc.capexPerBarrel + tc.opexPerBarrel;
  // Estimate: opex + capex amortisation
  const capexPerBarrel = block.estimatedReserves > 0
    ? (block.accumulatedInvestment / block.estimatedReserves)
    : 5;
  return opex + capexPerBarrel;
}

export function getBlockNPV(block: OilBlock): number {
  const npv = block.economicVision?.npvByPeriod;
  if (npv?.length) return npv.reduce((s, p) => s + p.ge + p.impostos, 0);
  // Proxy
  return block.dailyProduction * 365 * BRENT_PRICE * 5 / 1e6; // 5-year proxy
}

export function getBlockStateRevenue(block: OilBlock): number {
  // Annual estimated state revenue MMUSD
  const fiscalRate = 0.3; // default 30%
  const fiscal = block.contractInfo?.fiscalConditions;
  const rate = fiscal ? ((fiscal.ipp || 0) + (fiscal.irp || 0)) / 100 * 0.5 : fiscalRate;
  return block.dailyProduction * 365 * BRENT_PRICE * rate / 1e6;
}

// ── Main scoring ──
export function calculateEconomicScore(block: OilBlock): EconomicScoreResult {
  const dimensions = [
    rentabilidadeScore(block),
    eficienciaCustosScore(block),
    sustentabilidadeScore(block),
    contribuicaoFiscalScore(block),
    riscoEconomicoScore(block),
  ];

  dimensions.forEach(d => { d.weighted = Math.round((d.score * d.weight) / 100); });
  const totalScore = dimensions.reduce((s, d) => s + d.weighted, 0);
  const classification = getClassification(totalScore);

  const opexPerBarrel = block.economicData?.opexPerBarrel || 20;
  const breakeven = getBlockBreakeven(block);
  const npvTotal = getBlockNPV(block);
  const stateRevenue = getBlockStateRevenue(block);
  const economicMargin = ((BRENT_PRICE - breakeven) / BRENT_PRICE) * 100;

  return {
    blockId: block.id,
    blockName: block.name,
    operator: block.operator,
    basin: block.basin,
    dailyProduction: block.dailyProduction,
    estimatedReserves: block.estimatedReserves,
    totalScore,
    classification,
    dimensions,
    recommendation: getRecommendation(classification),
    opexPerBarrel,
    breakeven,
    npvTotal,
    stateRevenue,
    economicMargin,
  };
}

export function calculateAllEconomicScores(blocks: OilBlock[]): EconomicScoreResult[] {
  return blocks.map(calculateEconomicScore).sort((a, b) => b.totalScore - a.totalScore);
}

// ── National aggregates ──
export function getNationalEconomicKPIs(blocks: OilBlock[]) {
  const scores = calculateAllEconomicScores(blocks);
  const producing = scores.filter(s => s.dailyProduction > 0);

  const totalStateRevenue = scores.reduce((s, r) => s + r.stateRevenue, 0);
  const totalNPV = scores.reduce((s, r) => s + r.npvTotal, 0);

  // Weighted avg OPEX/bbl
  const totalProd = producing.reduce((s, r) => s + r.dailyProduction, 0);
  const avgOpexPerBarrel = totalProd > 0
    ? producing.reduce((s, r) => s + r.opexPerBarrel * r.dailyProduction, 0) / totalProd
    : 0;
  const avgBreakeven = totalProd > 0
    ? producing.reduce((s, r) => s + r.breakeven * r.dailyProduction, 0) / totalProd
    : 0;

  const viableProduction = producing
    .filter(s => s.breakeven < BRENT_PRICE * 0.8)
    .reduce((s, r) => s + r.dailyProduction, 0);
  const atRiskProduction = producing
    .filter(s => s.breakeven >= BRENT_PRICE * 0.8)
    .reduce((s, r) => s + r.dailyProduction, 0);

  // Classification summary
  const classificationCounts: Record<EconomicClassification, number> = {
    "Activo Estratégico": 0,
    "Activo Rentável": 0,
    "Activo em Observação": 0,
    "Activo de Alto Risco": 0,
    "Activo Inviável": 0,
  };
  scores.forEach(s => { classificationCounts[s.classification]++; });

  return {
    totalStateRevenue,
    totalNPV,
    avgOpexPerBarrel,
    avgBreakeven,
    viableProduction,
    atRiskProduction,
    totalProduction: totalProd,
    scores,
    classificationCounts,
    brentPrice: BRENT_PRICE,
  };
}

// Revenue by basin
export function getRevenueByBasin(blocks: OilBlock[]) {
  const map: Record<string, number> = {};
  blocks.forEach(b => {
    const rev = getBlockStateRevenue(b);
    map[b.basin] = (map[b.basin] || 0) + rev;
  });
  return Object.entries(map).map(([basin, revenue]) => ({ basin, revenue })).sort((a, b) => b.revenue - a.revenue);
}

// Revenue by operator
export function getRevenueByOperator(blocks: OilBlock[]) {
  const map: Record<string, number> = {};
  blocks.forEach(b => {
    const rev = getBlockStateRevenue(b);
    map[b.operator] = (map[b.operator] || 0) + rev;
  });
  return Object.entries(map).map(([operator, revenue]) => ({ operator, revenue })).sort((a, b) => b.revenue - a.revenue);
}

// Aggregated cash flow timeline
export function getAggregatedCashFlow(blocks: OilBlock[]) {
  const map: Record<number, { year: number; ge: number; impostos: number }> = {};
  blocks.forEach(b => {
    b.economicVision?.cashFlowTimeSeries?.forEach(cf => {
      if (!map[cf.year]) map[cf.year] = { year: cf.year, ge: 0, impostos: 0 };
      map[cf.year].ge += cf.ge;
      map[cf.year].impostos += cf.impostos;
    });
  });
  return Object.values(map).sort((a, b) => a.year - b.year);
}

// ── Config ──
export const classificationColors: Record<EconomicClassification, { text: string; bg: string; dot: string }> = {
  "Activo Estratégico": { text: "text-success", bg: "bg-success/10", dot: "bg-success" },
  "Activo Rentável": { text: "text-[hsl(var(--chart-5))]", bg: "bg-[hsl(var(--chart-5))]/10", dot: "bg-[hsl(var(--chart-5))]" },
  "Activo em Observação": { text: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
  "Activo de Alto Risco": { text: "text-[hsl(var(--chart-4))]", bg: "bg-[hsl(var(--chart-4))]/10", dot: "bg-[hsl(var(--chart-4))]" },
  "Activo Inviável": { text: "text-danger", bg: "bg-danger/10", dot: "bg-danger" },
};

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}
