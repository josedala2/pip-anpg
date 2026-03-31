// National Production Forecast 2025-2050 — from "Estado das Concessões 2026"

export interface ForecastYear {
  year: number;
  baseProduction: number;         // kBOPD — existing blocks
  discoveredWithFID: number;      // kBOPD — opportunities with FID date
  discoveredWithoutFID: number;   // kBOPD — opportunities without FID date
  newConcessions: number;         // kBOPD — exploration & new concessions (by basin)
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

// Certified data from "EHA — Previsões de Produção" Excel (BOPD → kBOPD rounded)
export const nationalForecast: ForecastYear[] = [
  { year: 2025, baseProduction: 1037, discoveredWithFID: 0,   discoveredWithoutFID: 0,   newConcessions: 0,    total: 1037 },
  { year: 2026, baseProduction: 1050, discoveredWithFID: 1,   discoveredWithoutFID: 0,   newConcessions: 0,    total: 1051 },
  { year: 2027, baseProduction: 1008, discoveredWithFID: 8,   discoveredWithoutFID: 0,   newConcessions: 0,    total: 1017 },
  { year: 2028, baseProduction: 966,  discoveredWithFID: 65,  discoveredWithoutFID: 0,   newConcessions: 1,    total: 1032 },
  { year: 2029, baseProduction: 891,  discoveredWithFID: 146, discoveredWithoutFID: 0,   newConcessions: 15,   total: 1052 },
  { year: 2030, baseProduction: 796,  discoveredWithFID: 275, discoveredWithoutFID: 52,  newConcessions: 12,   total: 1135 },
  { year: 2031, baseProduction: 720,  discoveredWithFID: 300, discoveredWithoutFID: 118, newConcessions: 25,   total: 1163 },
  { year: 2032, baseProduction: 634,  discoveredWithFID: 265, discoveredWithoutFID: 237, newConcessions: 42,   total: 1178 },
  { year: 2033, baseProduction: 558,  discoveredWithFID: 250, discoveredWithoutFID: 256, newConcessions: 145,  total: 1208 },
  { year: 2034, baseProduction: 491,  discoveredWithFID: 216, discoveredWithoutFID: 260, newConcessions: 286,  total: 1253 },
  { year: 2035, baseProduction: 432,  discoveredWithFID: 192, discoveredWithoutFID: 275, newConcessions: 425,  total: 1324 },
  { year: 2036, baseProduction: 380,  discoveredWithFID: 165, discoveredWithoutFID: 303, newConcessions: 559,  total: 1407 },
  { year: 2037, baseProduction: 334,  discoveredWithFID: 135, discoveredWithoutFID: 287, newConcessions: 687,  total: 1443 },
  { year: 2038, baseProduction: 294,  discoveredWithFID: 110, discoveredWithoutFID: 270, newConcessions: 866,  total: 1540 },
  { year: 2039, baseProduction: 259,  discoveredWithFID: 100, discoveredWithoutFID: 225, newConcessions: 1041, total: 1625 },
  { year: 2040, baseProduction: 228,  discoveredWithFID: 86,  discoveredWithoutFID: 199, newConcessions: 1170, total: 1682 },
  { year: 2041, baseProduction: 201,  discoveredWithFID: 72,  discoveredWithoutFID: 176, newConcessions: 1215, total: 1663 },
  { year: 2042, baseProduction: 176,  discoveredWithFID: 64,  discoveredWithoutFID: 135, newConcessions: 1279, total: 1654 },
  { year: 2043, baseProduction: 155,  discoveredWithFID: 52,  discoveredWithoutFID: 113, newConcessions: 1293, total: 1612 },
  { year: 2044, baseProduction: 137,  discoveredWithFID: 45,  discoveredWithoutFID: 98,  newConcessions: 1286, total: 1566 },
  { year: 2045, baseProduction: 120,  discoveredWithFID: 32,  discoveredWithoutFID: 84,  newConcessions: 1258, total: 1494 },
  { year: 2046, baseProduction: 106,  discoveredWithFID: 23,  discoveredWithoutFID: 79,  newConcessions: 1235, total: 1442 },
  { year: 2047, baseProduction: 93,   discoveredWithFID: 20,  discoveredWithoutFID: 73,  newConcessions: 1194, total: 1380 },
  { year: 2048, baseProduction: 82,   discoveredWithFID: 13,  discoveredWithoutFID: 46,  newConcessions: 1111, total: 1252 },
  { year: 2049, baseProduction: 72,   discoveredWithFID: 9,   discoveredWithoutFID: 42,  newConcessions: 1012, total: 1135 },
  { year: 2050, baseProduction: 63,   discoveredWithFID: 4,   discoveredWithoutFID: 39,  newConcessions: 914,  total: 1020 },
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
  productionBOPD: 1037000,
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
  { year: 1975, production: 156081 },
  { year: 1976, production: 101870 },
  { year: 1977, production: 171461 },
  { year: 1978, production: 135243 },
  { year: 1979, production: 142358 },
  { year: 1980, production: 135765 },
  { year: 1981, production: 129561 },
  { year: 1982, production: 130165 },
  { year: 1983, production: 178662 },
  { year: 1984, production: 204048 },
  { year: 1985, production: 232040 },
  { year: 1986, production: 282063 },
  { year: 1987, production: 359426 },
  { year: 1988, production: 450880 },
  { year: 1989, production: 452669 },
  { year: 1990, production: 473764 },
  { year: 1991, production: 496954 },
  { year: 1992, production: 549182 },
  { year: 1993, production: 504461 },
  { year: 1994, production: 550488 },
  { year: 1995, production: 621657 },
  { year: 1996, production: 685656 },
  { year: 1997, production: 716673 },
  { year: 1998, production: 746505 },
  { year: 1999, production: 761488 },
  { year: 2000, production: 753974 },
  { year: 2001, production: 744427 },
  { year: 2002, production: 894941 },
  { year: 2003, production: 874650 },
  { year: 2004, production: 986150 },
  { year: 2005, production: 1246278 },
  { year: 2006, production: 1409887 },
  { year: 2007, production: 1698155 },
  { year: 2008, production: 1897768 },
  { year: 2009, production: 1807781 },
  { year: 2010, production: 1757602 },
  { year: 2011, production: 1659514 },
  { year: 2012, production: 1729918 },
  { year: 2013, production: 1715552 },
  { year: 2014, production: 1671681 },
  { year: 2015, production: 1745122 },
  { year: 2016, production: 1721620 },
  { year: 2017, production: 1632356 },
  { year: 2018, production: 1473268 },
  { year: 2019, production: 1372847 },
  { year: 2020, production: 1271460 },
  { year: 2021, production: 1124457 },
  { year: 2022, production: 1136711 },
  { year: 2023, production: 1097979 },
  { year: 2024, production: 1124477 },
  { year: 2025, production: 1036763 },
];
