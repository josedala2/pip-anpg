import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";

// ── Scenario Variables ──

export interface ScenarioVariables {
  // Market
  brentPrice: number;        // USD/bbl
  exchangeRate: number;      // AOA/USD
  inflationRate: number;     // % annual

  // Operational
  opexMultiplier: number;    // 1.0 = current, 0.8 = 20% reduction
  declineRate: number;       // % annual production decline
  efficiencyGain: number;    // % improvement in facility efficiency

  // Fiscal
  royaltyRate: number;       // IPP %
  taxRate: number;           // IRP %
  stateParticipation: number; // % of profit oil
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  variables: ScenarioVariables;
}

export interface YearProjection {
  year: number;
  production: number;       // BOPD
  revenue: number;          // MMUSD
  opex: number;             // MMUSD
  netCashFlow: number;      // MMUSD
  stateRevenue: number;     // MMUSD
  cumulativeCashFlow: number;
}

export interface ScenarioOutput {
  scenario: ScenarioDefinition;
  npv: number;              // MMUSD (10% discount rate)
  irr: number;              // % 
  totalCashFlow: number;    // MMUSD over projection period
  totalStateRevenue: number;
  avgCostPerBarrel: number;
  breakeven: number;
  projections: YearProjection[];
  paybackYear: number | null;
}

// ── Default / Base values ──

const BASE_VARIABLES: ScenarioVariables = {
  brentPrice: 78,
  exchangeRate: 850,
  inflationRate: 3,
  opexMultiplier: 1.0,
  declineRate: 5,
  efficiencyGain: 0,
  royaltyRate: 20,
  taxRate: 50,
  stateParticipation: 30,
};

// ── 5 Predefined Scenarios ──

export const PREDEFINED_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "continuidade",
    name: "Continuidade",
    description: "Evolução natural sem intervenções. Produção em declínio moderado, custos estáveis, regime fiscal actual.",
    icon: "⏳",
    color: "hsl(200, 45%, 28%)",
    variables: { ...BASE_VARIABLES },
  },
  {
    id: "optimizacao",
    name: "Optimização Operacional",
    description: "Redução de 15% no OPEX, melhoria de eficiência de 10%, declínio controlado a 3%/ano.",
    icon: "⚡",
    color: "hsl(152, 50%, 38%)",
    variables: {
      ...BASE_VARIABLES,
      opexMultiplier: 0.85,
      declineRate: 3,
      efficiencyGain: 10,
    },
  },
  {
    id: "revitalizacao",
    name: "Revitalização de Campos",
    description: "Investimento adicional em EOR/IOR. Declínio reduzido a 2%/ano, OPEX sobe 10% por investimento.",
    icon: "🔄",
    color: "hsl(38, 75%, 48%)",
    variables: {
      ...BASE_VARIABLES,
      opexMultiplier: 1.10,
      declineRate: 2,
      efficiencyGain: 15,
    },
  },
  {
    id: "declinio",
    name: "Declínio Natural",
    description: "Declínio acelerado de 8%/ano, aumento progressivo do OPEX em 20%, sem intervenção.",
    icon: "📉",
    color: "hsl(280, 50%, 55%)",
    variables: {
      ...BASE_VARIABLES,
      opexMultiplier: 1.20,
      declineRate: 8,
      efficiencyGain: -5,
    },
  },
  {
    id: "abandono",
    name: "Abandono Planeado",
    description: "Produção residual com declínio de 12%/ano. OPEX elevado. Preparação para descomissionamento.",
    icon: "🏚️",
    color: "hsl(0, 65%, 42%)",
    variables: {
      ...BASE_VARIABLES,
      opexMultiplier: 1.40,
      declineRate: 12,
      efficiencyGain: -10,
    },
  },
];

// ── Projection Engine ──

const PROJECTION_YEARS = 15; // 2026-2040
const DISCOUNT_RATE = 0.10;

function getNationalBaseline(blocks?: OilBlock[]) {
  const source = blocks || oilBlocks.filter(b => !b.pendingRealData);
  const totalProduction = source.reduce((s, b) => s + b.dailyProduction, 0);

  // Weighted avg OPEX/bbl
  const producing = source.filter(b => b.dailyProduction > 0);
  const totalProd = producing.reduce((s, b) => s + b.dailyProduction, 0);
  const avgOpex = totalProd > 0
    ? producing.reduce((s, b) => s + (b.economicData?.opexPerBarrel || 20) * b.dailyProduction, 0) / totalProd
    : 20;

  // Total abandonment costs
  const totalAbandonment = source.reduce((s, b) => s + (b.economicData?.abandonment?.total || 0), 0);

  return { totalProduction, avgOpex, totalAbandonment };
}

export function runScenario(scenario: ScenarioDefinition): ScenarioOutput {
  const vars = scenario.variables;
  const baseline = getNationalBaseline();

  const projections: YearProjection[] = [];
  let cumulativeCF = 0;
  let paybackYear: number | null = null;

  for (let i = 0; i < PROJECTION_YEARS; i++) {
    const year = 2026 + i;

    // Production with decline and efficiency
    const declineFactor = Math.pow(1 - vars.declineRate / 100, i);
    const efficiencyFactor = 1 + (vars.efficiencyGain / 100) * Math.min(i / 3, 1); // ramp up over 3 years
    const production = Math.max(baseline.totalProduction * declineFactor * efficiencyFactor, 0);

    // Revenue
    const inflationFactor = Math.pow(1 + vars.inflationRate / 100, i);
    const annualBarrels = production * 365;
    const revenue = annualBarrels * vars.brentPrice / 1e6;

    // OPEX
    const baseOpex = baseline.avgOpex * vars.opexMultiplier * inflationFactor;
    const opex = annualBarrels * baseOpex / 1e6;

    // Net cash flow
    const netCashFlow = revenue - opex;

    // State revenue
    const stateShare = (vars.royaltyRate + vars.taxRate * 0.5 + vars.stateParticipation * 0.3) / 100;
    const stateRevenue = Math.max(revenue * stateShare, 0);

    cumulativeCF += netCashFlow;
    if (paybackYear === null && cumulativeCF > 0) paybackYear = year;

    projections.push({
      year,
      production: Math.round(production),
      revenue: Math.round(revenue),
      opex: Math.round(opex),
      netCashFlow: Math.round(netCashFlow),
      stateRevenue: Math.round(stateRevenue),
      cumulativeCashFlow: Math.round(cumulativeCF),
    });
  }

  // NPV calculation (10% discount)
  const npv = projections.reduce((s, p, i) => {
    return s + p.netCashFlow / Math.pow(1 + DISCOUNT_RATE, i + 1);
  }, 0);

  // IRR approximation (bisection method)
  const irr = calculateIRR(projections.map(p => p.netCashFlow));

  const totalCashFlow = projections.reduce((s, p) => s + p.netCashFlow, 0);
  const totalStateRevenue = projections.reduce((s, p) => s + p.stateRevenue, 0);

  // Avg cost per barrel
  const totalBarrels = projections.reduce((s, p) => s + p.production * 365, 0);
  const totalOpex = projections.reduce((s, p) => s + p.opex, 0);
  const avgCostPerBarrel = totalBarrels > 0 ? (totalOpex * 1e6) / totalBarrels : 0;

  // Breakeven
  const breakeven = avgCostPerBarrel;

  return {
    scenario,
    npv: Math.round(npv),
    irr,
    totalCashFlow: Math.round(totalCashFlow),
    totalStateRevenue: Math.round(totalStateRevenue),
    avgCostPerBarrel,
    breakeven,
    projections,
    paybackYear,
  };
}

export function runAllScenarios(): ScenarioOutput[] {
  return PREDEFINED_SCENARIOS.map(s => runScenario(s));
}

// ── Per-block scenario engine ──

function getBlockBaseline(block: OilBlock) {
  const totalProduction = block.dailyProduction;
  const avgOpex = block.economicData?.opexPerBarrel || 20;
  const totalAbandonment = block.economicData?.abandonment?.total || 0;
  return { totalProduction, avgOpex, totalAbandonment };
}

export function runScenarioForBlock(scenario: ScenarioDefinition, block: OilBlock): ScenarioOutput {
  const vars = scenario.variables;
  const baseline = getBlockBaseline(block);

  const projections: YearProjection[] = [];
  let cumulativeCF = 0;
  let paybackYear: number | null = null;

  for (let i = 0; i < PROJECTION_YEARS; i++) {
    const year = 2026 + i;
    const declineFactor = Math.pow(1 - vars.declineRate / 100, i);
    const efficiencyFactor = 1 + (vars.efficiencyGain / 100) * Math.min(i / 3, 1);
    const production = Math.max(baseline.totalProduction * declineFactor * efficiencyFactor, 0);

    const inflationFactor = Math.pow(1 + vars.inflationRate / 100, i);
    const annualBarrels = production * 365;
    const revenue = annualBarrels * vars.brentPrice / 1e6;

    const baseOpex = baseline.avgOpex * vars.opexMultiplier * inflationFactor;
    const opex = annualBarrels * baseOpex / 1e6;

    const netCashFlow = revenue - opex;
    const stateShare = (vars.royaltyRate + vars.taxRate * 0.5 + vars.stateParticipation * 0.3) / 100;
    const stateRevenue = Math.max(revenue * stateShare, 0);

    cumulativeCF += netCashFlow;
    if (paybackYear === null && cumulativeCF > 0) paybackYear = year;

    projections.push({
      year,
      production: Math.round(production),
      revenue: Math.round(revenue),
      opex: Math.round(opex),
      netCashFlow: Math.round(netCashFlow),
      stateRevenue: Math.round(stateRevenue),
      cumulativeCashFlow: Math.round(cumulativeCF),
    });
  }

  const npv = projections.reduce((s, p, i) => s + p.netCashFlow / Math.pow(1 + DISCOUNT_RATE, i + 1), 0);
  const irr = calculateIRR(projections.map(p => p.netCashFlow));
  const totalCashFlow = projections.reduce((s, p) => s + p.netCashFlow, 0);
  const totalStateRevenue = projections.reduce((s, p) => s + p.stateRevenue, 0);
  const totalBarrels = projections.reduce((s, p) => s + p.production * 365, 0);
  const totalOpex = projections.reduce((s, p) => s + p.opex, 0);
  const avgCostPerBarrel = totalBarrels > 0 ? (totalOpex * 1e6) / totalBarrels : 0;

  return {
    scenario,
    npv: Math.round(npv),
    irr,
    totalCashFlow: Math.round(totalCashFlow),
    totalStateRevenue: Math.round(totalStateRevenue),
    avgCostPerBarrel,
    breakeven: avgCostPerBarrel,
    projections,
    paybackYear,
  };
}

export function runAllScenariosForBlock(block: OilBlock): ScenarioOutput[] {
  return PREDEFINED_SCENARIOS.map(s => runScenarioForBlock(s, block));
}

// ── Per-operator scenario engine ──

function getOperatorBaseline(operatorName: string) {
  const blocks = oilBlocks.filter(b => b.operator === operatorName && b.dailyProduction > 0);
  const totalProduction = blocks.reduce((s, b) => s + b.dailyProduction, 0);
  const totalProd = blocks.reduce((s, b) => s + b.dailyProduction, 0);
  const avgOpex = totalProd > 0
    ? blocks.reduce((s, b) => s + (b.economicData?.opexPerBarrel || 20) * b.dailyProduction, 0) / totalProd
    : 20;
  const totalAbandonment = blocks.reduce((s, b) => s + (b.economicData?.abandonment?.total || 0), 0);
  return { totalProduction, avgOpex, totalAbandonment, blockCount: blocks.length };
}

export function runScenarioForOperator(scenario: ScenarioDefinition, operatorName: string): ScenarioOutput {
  const vars = scenario.variables;
  const baseline = getOperatorBaseline(operatorName);

  const projections: YearProjection[] = [];
  let cumulativeCF = 0;
  let paybackYear: number | null = null;

  for (let i = 0; i < PROJECTION_YEARS; i++) {
    const year = 2026 + i;
    const declineFactor = Math.pow(1 - vars.declineRate / 100, i);
    const efficiencyFactor = 1 + (vars.efficiencyGain / 100) * Math.min(i / 3, 1);
    const production = Math.max(baseline.totalProduction * declineFactor * efficiencyFactor, 0);

    const inflationFactor = Math.pow(1 + vars.inflationRate / 100, i);
    const annualBarrels = production * 365;
    const revenue = annualBarrels * vars.brentPrice / 1e6;

    const baseOpex = baseline.avgOpex * vars.opexMultiplier * inflationFactor;
    const opex = annualBarrels * baseOpex / 1e6;

    const netCashFlow = revenue - opex;
    const stateShare = (vars.royaltyRate + vars.taxRate * 0.5 + vars.stateParticipation * 0.3) / 100;
    const stateRevenue = Math.max(revenue * stateShare, 0);

    cumulativeCF += netCashFlow;
    if (paybackYear === null && cumulativeCF > 0) paybackYear = year;

    projections.push({
      year,
      production: Math.round(production),
      revenue: Math.round(revenue),
      opex: Math.round(opex),
      netCashFlow: Math.round(netCashFlow),
      stateRevenue: Math.round(stateRevenue),
      cumulativeCashFlow: Math.round(cumulativeCF),
    });
  }

  const npv = projections.reduce((s, p, i) => s + p.netCashFlow / Math.pow(1 + DISCOUNT_RATE, i + 1), 0);
  const irr = calculateIRR(projections.map(p => p.netCashFlow));
  const totalCashFlow = projections.reduce((s, p) => s + p.netCashFlow, 0);
  const totalStateRevenue = projections.reduce((s, p) => s + p.stateRevenue, 0);
  const totalBarrels = projections.reduce((s, p) => s + p.production * 365, 0);
  const totalOpex = projections.reduce((s, p) => s + p.opex, 0);
  const avgCostPerBarrel = totalBarrels > 0 ? (totalOpex * 1e6) / totalBarrels : 0;

  return {
    scenario,
    npv: Math.round(npv),
    irr,
    totalCashFlow: Math.round(totalCashFlow),
    totalStateRevenue: Math.round(totalStateRevenue),
    avgCostPerBarrel,
    breakeven: avgCostPerBarrel,
    projections,
    paybackYear,
  };
}

export function runAllScenariosForOperator(operatorName: string): ScenarioOutput[] {
  return PREDEFINED_SCENARIOS.map(s => runScenarioForOperator(s, operatorName));
}

export function runCustomScenario(variables: ScenarioVariables): ScenarioOutput {
  const custom: ScenarioDefinition = {
    id: "custom",
    name: "Cenário Personalizado",
    description: "Variáveis definidas pelo utilizador.",
    icon: "🎯",
    color: "hsl(199, 70%, 45%)",
    variables,
  };
  return runScenario(custom);
}

// ── IRR calculation (bisection) ──
function calculateIRR(cashFlows: number[]): number {
  let lo = -0.5, hi = 2.0;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const npv = cashFlows.reduce((s, cf, i) => s + cf / Math.pow(1 + mid, i + 1), 0);
    if (Math.abs(npv) < 0.01) return mid * 100;
    if (npv > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

export { BASE_VARIABLES };
