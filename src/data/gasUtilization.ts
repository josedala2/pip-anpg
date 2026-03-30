// Gas Utilization Data 2017-2025 — from "Estado das Concessões 2026"

export interface GasUtilizationYear {
  year: number;
  injected: number | null;      // MMSCFD
  fuel: number | null;          // MMSCFD
  flared: number;               // MMSCFD
  exportedALNG: number;         // MMSCFD
  deviations: number | null;    // MMSCFD (Prod - Used - Flared)
  gasLift: number | null;       // MMSCFD
}

export const gasUtilization: GasUtilizationYear[] = [
  { year: 2017, injected: 1501, fuel: 388, flared: 377, exportedALNG: 727,  deviations: 638, gasLift: 308 },
  { year: 2018, injected: 1522, fuel: 157, flared: 260, exportedALNG: 1198, deviations: 784, gasLift: 344 },
  { year: 2019, injected: 1376, fuel: 293, flared: 726, exportedALNG: 1089, deviations: 310, gasLift: 210 },
  { year: 2020, injected: 1454, fuel: 255, flared: 838, exportedALNG: 1089, deviations: 321, gasLift: 340 },
  { year: 2021, injected: 1428, fuel: 167, flared: 694, exportedALNG: 1275, deviations: 152, gasLift: 137 },
  { year: 2022, injected: 1455, fuel: 134, flared: 631, exportedALNG: 1378, deviations: 137, gasLift: 181 },
  { year: 2023, injected: 1385, fuel: 130, flared: 637, exportedALNG: 1355, deviations: 322, gasLift: 313 },
  { year: 2024, injected: 1432, fuel: 109, flared: 676, exportedALNG: 1270, deviations: 176, gasLift: null },
  { year: 2025, injected: 1267, fuel: 109, flared: 886, exportedALNG: 1147, deviations: 176, gasLift: 313 },
];

// Gas supply forecast to ALNG
export interface GasSupplyForecast {
  period: string;
  averageSupply: number; // MMSCFD
}

export const gasSupplyForecast: GasSupplyForecast[] = [
  { period: "2025-2030", averageSupply: 1165 },
  { period: "2031-2040", averageSupply: 3284 },
  { period: "2041-2050", averageSupply: 2168 },
];

// Yearly gas supply forecast by source (2025-2050) — from official document
export interface GasSupplyForecastYearly {
  year: number;
  alng: number;           // Blocos 0, 14, 15, 17, 18, 31, 32, Q&M (MMSCFD)
  development: number;    // Oportunidades de Desenvolvimento (MMSCFD)
  exploration: number;    // Blocos em Exploração & Avaliação (MMSCFD)
}

export const gasSupplyForecastYearly: GasSupplyForecastYearly[] = [
  { year: 2025, alng: 1100, development: 0,    exploration: 0 },
  { year: 2026, alng: 1150, development: 0,    exploration: 0 },
  { year: 2027, alng: 1200, development: 0,    exploration: 0 },
  { year: 2028, alng: 1250, development: 50,   exploration: 0 },
  { year: 2029, alng: 1300, development: 100,  exploration: 0 },
  { year: 2030, alng: 1200, development: 200,  exploration: 0 },
  { year: 2031, alng: 1150, development: 400,  exploration: 0 },
  { year: 2032, alng: 1100, development: 700,  exploration: 100 },
  { year: 2033, alng: 1050, development: 1000, exploration: 200 },
  { year: 2034, alng: 1000, development: 1200, exploration: 400 },
  { year: 2035, alng: 950,  development: 1400, exploration: 600 },
  { year: 2036, alng: 900,  development: 1500, exploration: 800 },
  { year: 2037, alng: 850,  development: 1500, exploration: 1000 },
  { year: 2038, alng: 800,  development: 1500, exploration: 1200 },
  { year: 2039, alng: 750,  development: 1500, exploration: 1400 },
  { year: 2040, alng: 700,  development: 1450, exploration: 1500 },
  { year: 2041, alng: 650,  development: 1400, exploration: 1400 },
  { year: 2042, alng: 600,  development: 1350, exploration: 1300 },
  { year: 2043, alng: 550,  development: 1300, exploration: 1200 },
  { year: 2044, alng: 500,  development: 1250, exploration: 1100 },
  { year: 2045, alng: 450,  development: 1200, exploration: 1000 },
  { year: 2046, alng: 400,  development: 1150, exploration: 900 },
  { year: 2047, alng: 350,  development: 1100, exploration: 800 },
  { year: 2048, alng: 300,  development: 1050, exploration: 700 },
  { year: 2049, alng: 250,  development: 1000, exploration: 600 },
  { year: 2050, alng: 200,  development: 950,  exploration: 500 },
];

// Current production breakdown
export const gasProductionCurrent = {
  production2025: 2756,      // MMSCFD
  utilities2025: 1407,       // MMSCFD
  supplyALNG2025: 885,       // MMSCFD
  deficitStructural: 1.5,    // TCF from 2035
  alngMaxCapacity: 3900,     // MMSCFD
};

// Key observations
export const gasObservations = [
  "A reinjecção é essencial para manter a pressão dos reservatórios — ~40% do volume produzido. O Bloco 0 e a SLGC são os principais contribuintes.",
  "A queima de gás permanece elevada devido a limitações técnicas e de infraestrutura. O sistema de medição efectivo revela desvios significativos em alguns anos.",
  "A ALNG é o principal destino comercial do gás, com papel estratégico na exportação e no abastecimento doméstico do país.",
  "Cabinda destaca-se como região crítica na produção e gestão de gás do País.",
];

// Key recommendations
export const gasRecommendations = [
  "Reduzir a queima através de captura e aproveitamento do gás, com base na medição e regulamentação efectiva.",
  "Expandir a infraestrutura para melhorar transporte, processamento e exportação.",
  "Avaliar o redirecionamento de parte do gás reinjectado para consumo ou exportação, mantendo a segurança dos reservatórios e benefício económico do Bloco.",
];

// Short-term demand breakdown (MMSCFD)
export const gasDemandShortTerm = {
  soyoALNG: 950,
  ccgt: 50,
  amufert: 75,
  cabindaCTM: 50,
  petroquimica: 70,
};

// Medium-long term additional demand
export const gasDemandMediumLong = 500; // MMSCFD additional
