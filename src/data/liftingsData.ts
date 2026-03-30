// Cumulative Oil Liftings 1988-2025 — from "Estado das Concessões 2026"

export interface LiftingByBlock {
  block: string;
  volumeMMBO: number;
  percentageOfTotal: number;
}

export interface LiftingByEntity {
  entity: string;
  volumeMMBO: number;
  percentage: number;
  color: string;
}

// Total cumulative liftings
export const totalLiftingsMMBO = 13189;

// By entity
export const liftingsByEntity: LiftingByEntity[] = [
  { entity: "GE (Grupo Estado)", volumeMMBO: 7888, percentage: 60, color: "hsl(var(--primary))" },
  { entity: "SNL (Sonangol)", volumeMMBO: 2123, percentage: 16, color: "hsl(var(--chart-2))" },
  { entity: "Concessionárias", volumeMMBO: 3214, percentage: 24, color: "hsl(var(--chart-3))" },
];

// By block (main contributors)
export const liftingsByBlock: LiftingByBlock[] = [
  { block: "Bloco 0", volumeMMBO: 4042, percentageOfTotal: 30.65 },
  { block: "Bloco 17", volumeMMBO: 3703, percentageOfTotal: 28.08 },
  { block: "Bloco 15", volumeMMBO: 2690, percentageOfTotal: 20.39 },
  { block: "Bloco 3/05", volumeMMBO: 1231, percentageOfTotal: 9.34 },
  { block: "Bloco 14", volumeMMBO: 890, percentageOfTotal: 6.75 },
  { block: "Bloco 2/05", volumeMMBO: 353, percentageOfTotal: 2.68 },
  { block: "Bloco 31", volumeMMBO: 64, percentageOfTotal: 0.49 },
  { block: "Bloco 4/05", volumeMMBO: 42, percentageOfTotal: 0.32 },
  { block: "Bloco 18", volumeMMBO: 33, percentageOfTotal: 0.25 },
  { block: "FS/FST", volumeMMBO: 30, percentageOfTotal: 0.23 },
  { block: "Bloco 32", volumeMMBO: 23, percentageOfTotal: 0.17 },
  { block: "Bloco 3/05A", volumeMMBO: 3, percentageOfTotal: 0.02 },
  { block: "Bloco COS", volumeMMBO: 1, percentageOfTotal: 0.01 },
];

// Top contributors for ANPG specifically
export const topANPGContributors: { block: string; volumeMMBO: number; percentage: number }[] = [
  { block: "Bloco 17", volumeMMBO: 1371, percentage: 43 },
  { block: "Bloco 15", volumeMMBO: 1211, percentage: 38 },
  { block: "Bloco 3/05", volumeMMBO: 298, percentage: 9 },
  { block: "Bloco 14", volumeMMBO: 272, percentage: 8 },
];

// Note: These top 4 blocks = 98% of total ANPG contributions
