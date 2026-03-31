// National Production Forecast 2025-2050 — from "Estado das Concessões 2026"

export interface ForecastYear {
  year: number;
  baseProduction: number;         // kBOPD — existing blocks
  discoveredWithFID: number;      // kBOPD — opportunities with FID date
  discoveredWithoutFID: number;   // kBOPD — opportunities without FID date
  total: number;                  // kBOPD
}

export interface ForecastProject {
  block: string;
  name: string;
  expectedIP: number; // year
  category: "base" | "fid" | "no-fid";
  basin: string;
}

export interface BasinBreakdown {
  basin: string;
  color: string;
}

export const basinBreakdown: BasinBreakdown[] = [
  { basin: "Bacia do Baixo Congo offshore", color: "hsl(var(--primary))" },
  { basin: "Bacia do Baixo Congo onshore", color: "hsl(var(--primary) / 0.7)" },
  { basin: "Bacia do Kwanza offshore", color: "hsl(var(--chart-2))" },
  { basin: "Bacia do Kwanza onshore", color: "hsl(var(--chart-3))" },
  { basin: "Bacia de Benguela offshore", color: "hsl(var(--chart-4))" },
  { basin: "Bacia de Namibe offshore", color: "hsl(var(--chart-5))" },
  { basin: "Bacias Interiores", color: "hsl(var(--muted-foreground))" },
];

// Approximate data from the production forecast chart (Page 3)
export const nationalForecast: ForecastYear[] = [
  { year: 2025, baseProduction: 1051, discoveredWithFID: 0,   discoveredWithoutFID: 0,   total: 1051 },
  { year: 2026, baseProduction: 980,  discoveredWithFID: 30,  discoveredWithoutFID: 0,   total: 1010 },
  { year: 2027, baseProduction: 930,  discoveredWithFID: 90,  discoveredWithoutFID: 0,   total: 1020 },
  { year: 2028, baseProduction: 870,  discoveredWithFID: 180, discoveredWithoutFID: 0,   total: 1050 },
  { year: 2029, baseProduction: 810,  discoveredWithFID: 260, discoveredWithoutFID: 0,   total: 1070 },
  { year: 2030, baseProduction: 750,  discoveredWithFID: 320, discoveredWithoutFID: 10,  total: 1080 },
  { year: 2031, baseProduction: 690,  discoveredWithFID: 340, discoveredWithoutFID: 30,  total: 1060 },
  { year: 2032, baseProduction: 630,  discoveredWithFID: 340, discoveredWithoutFID: 80,  total: 1050 },
  { year: 2033, baseProduction: 570,  discoveredWithFID: 320, discoveredWithoutFID: 160, total: 1050 },
  { year: 2034, baseProduction: 520,  discoveredWithFID: 300, discoveredWithoutFID: 250, total: 1070 },
  { year: 2035, baseProduction: 470,  discoveredWithFID: 270, discoveredWithoutFID: 370, total: 1110 },
  { year: 2036, baseProduction: 420,  discoveredWithFID: 240, discoveredWithoutFID: 490, total: 1150 },
  { year: 2037, baseProduction: 380,  discoveredWithFID: 210, discoveredWithoutFID: 600, total: 1190 },
  { year: 2038, baseProduction: 340,  discoveredWithFID: 180, discoveredWithoutFID: 720, total: 1240 },
  { year: 2039, baseProduction: 300,  discoveredWithFID: 160, discoveredWithoutFID: 840, total: 1300 },
  { year: 2040, baseProduction: 270,  discoveredWithFID: 140, discoveredWithoutFID: 960, total: 1370 },
  { year: 2041, baseProduction: 240,  discoveredWithFID: 120, discoveredWithoutFID: 1322, total: 1682 },
  { year: 2042, baseProduction: 210,  discoveredWithFID: 100, discoveredWithoutFID: 1290, total: 1600 },
  { year: 2043, baseProduction: 190,  discoveredWithFID: 90,  discoveredWithoutFID: 1220, total: 1500 },
  { year: 2044, baseProduction: 170,  discoveredWithFID: 80,  discoveredWithoutFID: 1150, total: 1400 },
  { year: 2045, baseProduction: 150,  discoveredWithFID: 70,  discoveredWithoutFID: 1080, total: 1300 },
  { year: 2046, baseProduction: 130,  discoveredWithFID: 60,  discoveredWithoutFID: 1010, total: 1200 },
  { year: 2047, baseProduction: 115,  discoveredWithFID: 55,  discoveredWithoutFID: 940,  total: 1110 },
  { year: 2048, baseProduction: 100,  discoveredWithFID: 50,  discoveredWithoutFID: 880,  total: 1030 },
  { year: 2049, baseProduction: 90,   discoveredWithFID: 45,  discoveredWithoutFID: 885,  total: 1020 },
  { year: 2050, baseProduction: 80,   discoveredWithFID: 42,  discoveredWithoutFID: 898,  total: 1020 },
];

export const forecastProjects: ForecastProject[] = [
  // IP 2026
  { block: "B0", name: "Banzala Pilot", expectedIP: 2026, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B15", name: "Red. 2.0: Batuque OP14", expectedIP: 2026, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B15", name: "Dikanza OP25", expectedIP: 2026, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B15", name: "Mondo OP32", expectedIP: 2026, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "Dalia Infills F5", expectedIP: 2026, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "ACACIA 5", expectedIP: 2026, category: "fid", basin: "Baixo Congo offshore" },
  // IP 2027
  { block: "B17", name: "Dalia Deep EPS", expectedIP: 2027, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B31", name: "PSVM Infills F4", expectedIP: 2027, category: "fid", basin: "Baixo Congo offshore" },
  // IP 2028
  { block: "B15", name: "Likembe", expectedIP: 2028, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "Dalia Norte EPS", expectedIP: 2028, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "Dalia Infills Estrela", expectedIP: 2028, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "Clov Infills", expectedIP: 2028, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B18", name: "Césio", expectedIP: 2028, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B31", name: "Greater PAJ", expectedIP: 2028, category: "fid", basin: "Baixo Congo offshore" },
  // IP 2029
  { block: "B0", name: "Lifua B", expectedIP: 2029, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "Pazflor Alata", expectedIP: 2029, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "Manganês", expectedIP: 2029, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B32", name: "CE", expectedIP: 2029, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B32", name: "Infills", expectedIP: 2029, category: "fid", basin: "Baixo Congo offshore" },
  // IP 2030
  { block: "B15/06", name: "Agidigbo", expectedIP: 2030, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B15/06", name: "Kalimba + Afoxé", expectedIP: 2030, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B17", name: "OVM Norte", expectedIP: 2030, category: "fid", basin: "Baixo Congo offshore" },
  // IP pós-2030
  { block: "B0", name: "Lifua C", expectedIP: 2031, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B32", name: "Colorau", expectedIP: 2032, category: "fid", basin: "Baixo Congo offshore" },
  { block: "B32", name: "AC", expectedIP: 2033, category: "fid", basin: "Baixo Congo offshore" },
  // Without FID — Baixo Congo offshore
  { block: "B31/21", name: "B31/21", expectedIP: 2033, category: "no-fid", basin: "Baixo Congo offshore" },
  { block: "B16/21", name: "B16/21", expectedIP: 2033, category: "no-fid", basin: "Baixo Congo offshore" },
  { block: "B49", name: "B49", expectedIP: 2034, category: "no-fid", basin: "Baixo Congo offshore" },
  { block: "B32/21", name: "B32/21", expectedIP: 2035, category: "no-fid", basin: "Baixo Congo offshore" },
  { block: "B33/21", name: "B33/21", expectedIP: 2038, category: "no-fid", basin: "Baixo Congo offshore" },
  { block: "B34/21", name: "B34/21", expectedIP: 2042, category: "no-fid", basin: "Baixo Congo offshore" },
  // Without FID — Baixo Congo onshore
  { block: "CON6", name: "CON 6", expectedIP: 2028, category: "no-fid", basin: "Baixo Congo onshore" },
  { block: "CON1", name: "CON 1", expectedIP: 2029, category: "no-fid", basin: "Baixo Congo onshore" },
  { block: "CABN", name: "CAB N", expectedIP: 2031, category: "no-fid", basin: "Baixo Congo onshore" },
  { block: "CON4", name: "CON 4", expectedIP: 2035, category: "no-fid", basin: "Baixo Congo onshore" },
  // Without FID — Kwanza offshore
  { block: "B20/11", name: "B20/11", expectedIP: 2033, category: "no-fid", basin: "Kwanza offshore" },
  { block: "B6/24", name: "B6/24", expectedIP: 2036, category: "no-fid", basin: "Kwanza offshore" },
  { block: "B19/11", name: "B19/11", expectedIP: 2038, category: "no-fid", basin: "Kwanza offshore" },
  { block: "B23", name: "B23", expectedIP: 2039, category: "no-fid", basin: "Kwanza offshore" },
  { block: "B35", name: "B35", expectedIP: 2045, category: "no-fid", basin: "Kwanza offshore" },
  // Without FID — Kwanza onshore
  { block: "KON6", name: "KON 6", expectedIP: 2030, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON2", name: "KON 2", expectedIP: 2031, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON12", name: "KON 12", expectedIP: 2031, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON8", name: "KON 8", expectedIP: 2032, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON11", name: "KON 11", expectedIP: 2032, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON4", name: "KON 4", expectedIP: 2036, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON19", name: "KON 19", expectedIP: 2036, category: "no-fid", basin: "Kwanza onshore" },
  { block: "KON9", name: "KON 9", expectedIP: 2040, category: "no-fid", basin: "Kwanza onshore" },
  // Without FID — Benguela
  { block: "B24", name: "B24", expectedIP: 2031, category: "no-fid", basin: "Benguela offshore" },
  { block: "B25", name: "B25", expectedIP: 2041, category: "no-fid", basin: "Benguela offshore" },
  // Without FID — Namibe
  { block: "B28", name: "B28", expectedIP: 2037, category: "no-fid", basin: "Namibe offshore" },
  // Without FID — Bacias Interiores
  { block: "Kassanje", name: "Kassanje", expectedIP: 2045, category: "no-fid", basin: "Bacias Interiores" },
  { block: "Etosha", name: "Etosha", expectedIP: 2045, category: "no-fid", basin: "Bacias Interiores" },
  { block: "Okavango", name: "Okavango", expectedIP: 2045, category: "no-fid", basin: "Bacias Interiores" },
];

// Base production blocks
export const baseProductionBlocks = [
  "Cabinda Sul", "FS", "FST", "B0", "B2/05", "B3/05", "B3", "B4/05",
  "B14", "B15", "B15/06", "B17", "B17/06", "B18", "B20/11", "B31", "B32"
];

// Historical national production (kBOPD) — from official reports
export const nationalHistoricalProduction = [
  { year: 2020, production: 1255, label: "Impacto COVID-19" },
  { year: 2021, production: 1124, label: "Declínio campos maduros" },
  { year: 2022, production: 1157, label: "Recuperação parcial" },
  { year: 2023, production: 1106, label: "Declínio natural" },
  { year: 2024, production: 1060, label: "Novos projectos limitados" },
  { year: 2025, production: 1036, label: "Relatório Concessões 2026" },
  { year: 2026, production: 1010, label: "Previsão (com FID)" },
];

// National Certified Metrics — from "Estado das Concessões 2026"
export const nationalCertifiedMetrics = {
  productionBOPD: 1036000,
  anpgQuotaBOPD: 441609,
  snlQuotaBOPD: 165760,
  reservesOilMb: 2600,
  reservesGasTCF: 4.4,
  totalAdjudicated: 67,
  activeConcessions: 54,
  inProduction: 17,
  inExploration: 37,
  pendingApproval: 13,
  ptosApproved: 41,
  prospectiveResourcesOilMb: 152611,
  prospectiveResourcesGasTCF: 45.328,
  gasProductionMMSCFD: 2756,
};

// Historical national oil production 1975–2023 (annual average BOPD)
// Source: Relatórios anuais ANPG, Figura 2.3
export const nationalHistoricalFull: { year: number; production: number }[] = [
  { year: 1975, production: 150000 },
  { year: 1976, production: 100000 },
  { year: 1977, production: 120000 },
  { year: 1978, production: 130000 },
  { year: 1979, production: 140000 },
  { year: 1980, production: 150000 },
  { year: 1981, production: 140000 },
  { year: 1982, production: 155000 },
  { year: 1983, production: 175000 },
  { year: 1984, production: 200000 },
  { year: 1985, production: 230000 },
  { year: 1986, production: 280000 },
  { year: 1987, production: 350000 },
  { year: 1988, production: 400000 },
  { year: 1989, production: 450000 },
  { year: 1990, production: 475000 },
  { year: 1991, production: 500000 },
  { year: 1992, production: 530000 },
  { year: 1993, production: 510000 },
  { year: 1994, production: 560000 },
  { year: 1995, production: 650000 },
  { year: 1996, production: 700000 },
  { year: 1997, production: 720000 },
  { year: 1998, production: 730000 },
  { year: 1999, production: 745000 },
  { year: 2000, production: 746000 },
  { year: 2001, production: 800000 },
  { year: 2002, production: 900000 },
  { year: 2003, production: 1000000 },
  { year: 2004, production: 1100000 },
  { year: 2005, production: 1250000 },
  { year: 2006, production: 1420000 },
  { year: 2007, production: 1720000 },
  { year: 2008, production: 1900000 },
  { year: 2009, production: 1810000 },
  { year: 2010, production: 1760000 },
  { year: 2011, production: 1700000 },
  { year: 2012, production: 1730000 },
  { year: 2013, production: 1750000 },
  { year: 2014, production: 1760000 },
  { year: 2015, production: 1780000 },
  { year: 2016, production: 1720000 },
  { year: 2017, production: 1640000 },
  { year: 2018, production: 1530000 },
  { year: 2019, production: 1390000 },
  { year: 2020, production: 1255000 },
  { year: 2021, production: 1170000 },
  { year: 2022, production: 1150000 },
  { year: 2023, production: 1100000 },
];
