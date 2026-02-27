export type BlockPhase = "Exploration" | "Development" | "Production" | "Suspended";

export interface OilBlock {
  id: string;
  name: string;
  operator: string;
  partners: string[];
  basin: string;
  phase: BlockPhase;
  contractDate: string;
  dailyProduction: number; // BOPD
  estimatedReserves: number; // million barrels
  accumulatedInvestment: number; // million USD
  plannedInvestment: number; // million USD
  executionRate: number; // percentage
  riskScore: number; // 1-10
  complianceScore: number; // percentage
  mapPosition: { x: number; y: number };
  productionHistory: { month: string; value: number }[];
  capexHistory: { year: string; planned: number; actual: number }[];
  projections: {
    conservative: number[];
    base: number[];
    expansion: number[];
  };
}

export const oilBlocks: OilBlock[] = [
  {
    id: "block-0",
    name: "Block 0",
    operator: "Chevron",
    partners: ["Sonangol P&P", "Total"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "1995-06-15",
    dailyProduction: 142000,
    estimatedReserves: 890,
    accumulatedInvestment: 4200,
    plannedInvestment: 4500,
    executionRate: 93,
    riskScore: 2,
    complianceScore: 96,
    mapPosition: { x: 18, y: 62 },
    productionHistory: [
      { month: "Jan", value: 138000 }, { month: "Feb", value: 140000 }, { month: "Mar", value: 141000 },
      { month: "Apr", value: 139500 }, { month: "May", value: 142000 }, { month: "Jun", value: 143000 },
      { month: "Jul", value: 141500 }, { month: "Aug", value: 142000 }, { month: "Sep", value: 140000 },
      { month: "Oct", value: 141000 }, { month: "Nov", value: 142500 }, { month: "Dec", value: 142000 },
    ],
    capexHistory: [
      { year: "2020", planned: 800, actual: 780 }, { year: "2021", planned: 850, actual: 830 },
      { year: "2022", planned: 900, actual: 870 }, { year: "2023", planned: 950, actual: 920 },
      { year: "2024", planned: 1000, actual: 980 },
    ],
    projections: {
      conservative: [140000, 136000, 131000, 126000, 120000, 114000, 108000, 102000, 96000, 90000],
      base: [142000, 140000, 138000, 135000, 132000, 128000, 124000, 120000, 116000, 112000],
      expansion: [142000, 145000, 148000, 150000, 152000, 150000, 148000, 145000, 142000, 138000],
    },
  },
  {
    id: "block-14",
    name: "Block 14",
    operator: "Chevron",
    partners: ["Sonangol", "ENI", "Total", "Galp"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "1999-03-20",
    dailyProduction: 98000,
    estimatedReserves: 620,
    accumulatedInvestment: 3100,
    plannedInvestment: 3400,
    executionRate: 91,
    riskScore: 3,
    complianceScore: 92,
    mapPosition: { x: 15, y: 68 },
    productionHistory: [
      { month: "Jan", value: 95000 }, { month: "Feb", value: 96500 }, { month: "Mar", value: 97000 },
      { month: "Apr", value: 96000 }, { month: "May", value: 97500 }, { month: "Jun", value: 98000 },
      { month: "Jul", value: 97000 }, { month: "Aug", value: 98000 }, { month: "Sep", value: 96500 },
      { month: "Oct", value: 97000 }, { month: "Nov", value: 98500 }, { month: "Dec", value: 98000 },
    ],
    capexHistory: [
      { year: "2020", planned: 600, actual: 570 }, { year: "2021", planned: 650, actual: 620 },
      { year: "2022", planned: 680, actual: 650 }, { year: "2023", planned: 720, actual: 690 },
      { year: "2024", planned: 750, actual: 710 },
    ],
    projections: {
      conservative: [96000, 92000, 88000, 84000, 80000, 76000, 72000, 68000, 64000, 60000],
      base: [98000, 96000, 94000, 92000, 90000, 87000, 84000, 81000, 78000, 75000],
      expansion: [98000, 100000, 103000, 106000, 108000, 106000, 104000, 101000, 98000, 95000],
    },
  },
  {
    id: "block-15",
    name: "Block 15",
    operator: "ENI",
    partners: ["Sonangol", "SSI", "Falcon Oil"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "1998-11-10",
    dailyProduction: 185000,
    estimatedReserves: 1200,
    accumulatedInvestment: 5800,
    plannedInvestment: 6200,
    executionRate: 94,
    riskScore: 2,
    complianceScore: 95,
    mapPosition: { x: 12, y: 72 },
    productionHistory: [
      { month: "Jan", value: 180000 }, { month: "Feb", value: 182000 }, { month: "Mar", value: 183000 },
      { month: "Apr", value: 181000 }, { month: "May", value: 184000 }, { month: "Jun", value: 185000 },
      { month: "Jul", value: 183500 }, { month: "Aug", value: 185000 }, { month: "Sep", value: 182000 },
      { month: "Oct", value: 184000 }, { month: "Nov", value: 185500 }, { month: "Dec", value: 185000 },
    ],
    capexHistory: [
      { year: "2020", planned: 1100, actual: 1050 }, { year: "2021", planned: 1200, actual: 1160 },
      { year: "2022", planned: 1250, actual: 1200 }, { year: "2023", planned: 1300, actual: 1260 },
      { year: "2024", planned: 1350, actual: 1310 },
    ],
    projections: {
      conservative: [183000, 178000, 172000, 166000, 160000, 154000, 148000, 142000, 136000, 130000],
      base: [185000, 183000, 180000, 177000, 174000, 170000, 166000, 162000, 158000, 154000],
      expansion: [185000, 190000, 195000, 198000, 200000, 198000, 195000, 192000, 188000, 184000],
    },
  },
  {
    id: "block-17",
    name: "Block 17",
    operator: "TotalEnergies",
    partners: ["Sonangol", "Equinor", "ExxonMobil", "BP"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "1996-08-25",
    dailyProduction: 320000,
    estimatedReserves: 2100,
    accumulatedInvestment: 12500,
    plannedInvestment: 13000,
    executionRate: 96,
    riskScore: 1,
    complianceScore: 98,
    mapPosition: { x: 10, y: 76 },
    productionHistory: [
      { month: "Jan", value: 315000 }, { month: "Feb", value: 317000 }, { month: "Mar", value: 318000 },
      { month: "Apr", value: 316000 }, { month: "May", value: 319000 }, { month: "Jun", value: 320000 },
      { month: "Jul", value: 318500 }, { month: "Aug", value: 320000 }, { month: "Sep", value: 317000 },
      { month: "Oct", value: 319000 }, { month: "Nov", value: 320500 }, { month: "Dec", value: 320000 },
    ],
    capexHistory: [
      { year: "2020", planned: 2400, actual: 2350 }, { year: "2021", planned: 2500, actual: 2460 },
      { year: "2022", planned: 2600, actual: 2550 }, { year: "2023", planned: 2700, actual: 2660 },
      { year: "2024", planned: 2800, actual: 2750 },
    ],
    projections: {
      conservative: [316000, 308000, 300000, 290000, 280000, 270000, 260000, 250000, 240000, 230000],
      base: [320000, 316000, 312000, 308000, 304000, 298000, 292000, 286000, 280000, 274000],
      expansion: [320000, 328000, 336000, 342000, 346000, 344000, 340000, 335000, 330000, 324000],
    },
  },
  {
    id: "block-18",
    name: "Block 18",
    operator: "BP",
    partners: ["Sonangol", "SSI"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "2001-04-12",
    dailyProduction: 115000,
    estimatedReserves: 780,
    accumulatedInvestment: 3800,
    plannedInvestment: 4100,
    executionRate: 93,
    riskScore: 3,
    complianceScore: 91,
    mapPosition: { x: 8, y: 80 },
    productionHistory: [
      { month: "Jan", value: 112000 }, { month: "Feb", value: 113000 }, { month: "Mar", value: 114000 },
      { month: "Apr", value: 113500 }, { month: "May", value: 114500 }, { month: "Jun", value: 115000 },
      { month: "Jul", value: 114000 }, { month: "Aug", value: 115000 }, { month: "Sep", value: 113000 },
      { month: "Oct", value: 114000 }, { month: "Nov", value: 115500 }, { month: "Dec", value: 115000 },
    ],
    capexHistory: [
      { year: "2020", planned: 720, actual: 690 }, { year: "2021", planned: 760, actual: 730 },
      { year: "2022", planned: 800, actual: 770 }, { year: "2023", planned: 840, actual: 810 },
      { year: "2024", planned: 880, actual: 850 },
    ],
    projections: {
      conservative: [113000, 109000, 105000, 100000, 96000, 91000, 86000, 82000, 77000, 73000],
      base: [115000, 113000, 111000, 108000, 106000, 103000, 100000, 97000, 94000, 91000],
      expansion: [115000, 118000, 121000, 124000, 126000, 124000, 122000, 119000, 116000, 113000],
    },
  },
  {
    id: "block-31",
    name: "Block 31",
    operator: "BP",
    partners: ["Sonangol", "SSI", "Equinor"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "2003-09-18",
    dailyProduction: 150000,
    estimatedReserves: 950,
    accumulatedInvestment: 6200,
    plannedInvestment: 6800,
    executionRate: 91,
    riskScore: 3,
    complianceScore: 90,
    mapPosition: { x: 6, y: 84 },
    productionHistory: [
      { month: "Jan", value: 147000 }, { month: "Feb", value: 148000 }, { month: "Mar", value: 149000 },
      { month: "Apr", value: 148000 }, { month: "May", value: 149500 }, { month: "Jun", value: 150000 },
      { month: "Jul", value: 149000 }, { month: "Aug", value: 150000 }, { month: "Sep", value: 148000 },
      { month: "Oct", value: 149000 }, { month: "Nov", value: 150500 }, { month: "Dec", value: 150000 },
    ],
    capexHistory: [
      { year: "2020", planned: 1200, actual: 1120 }, { year: "2021", planned: 1260, actual: 1180 },
      { year: "2022", planned: 1300, actual: 1220 }, { year: "2023", planned: 1350, actual: 1280 },
      { year: "2024", planned: 1400, actual: 1340 },
    ],
    projections: {
      conservative: [148000, 143000, 138000, 132000, 127000, 121000, 116000, 110000, 105000, 100000],
      base: [150000, 147000, 144000, 141000, 138000, 134000, 130000, 126000, 122000, 118000],
      expansion: [150000, 154000, 158000, 161000, 164000, 162000, 160000, 157000, 154000, 150000],
    },
  },
  {
    id: "block-32",
    name: "Block 32",
    operator: "TotalEnergies",
    partners: ["Sonangol", "Equinor", "Galp"],
    basin: "Kwanza",
    phase: "Development",
    contractDate: "2006-02-28",
    dailyProduction: 45000,
    estimatedReserves: 560,
    accumulatedInvestment: 2800,
    plannedInvestment: 4500,
    executionRate: 62,
    riskScore: 5,
    complianceScore: 78,
    mapPosition: { x: 20, y: 55 },
    productionHistory: [
      { month: "Jan", value: 38000 }, { month: "Feb", value: 39000 }, { month: "Mar", value: 40000 },
      { month: "Apr", value: 41000 }, { month: "May", value: 42000 }, { month: "Jun", value: 43000 },
      { month: "Jul", value: 43500 }, { month: "Aug", value: 44000 }, { month: "Sep", value: 44000 },
      { month: "Oct", value: 44500 }, { month: "Nov", value: 45000 }, { month: "Dec", value: 45000 },
    ],
    capexHistory: [
      { year: "2020", planned: 600, actual: 420 }, { year: "2021", planned: 800, actual: 520 },
      { year: "2022", planned: 900, actual: 610 }, { year: "2023", planned: 1000, actual: 680 },
      { year: "2024", planned: 1200, actual: 780 },
    ],
    projections: {
      conservative: [45000, 50000, 55000, 58000, 60000, 62000, 63000, 64000, 64000, 63000],
      base: [45000, 55000, 68000, 80000, 90000, 95000, 98000, 100000, 100000, 98000],
      expansion: [45000, 60000, 78000, 95000, 110000, 120000, 128000, 132000, 130000, 126000],
    },
  },
  {
    id: "block-15-06",
    name: "Block 15/06",
    operator: "ENI",
    partners: ["Sonangol", "SSI"],
    basin: "Lower Congo",
    phase: "Production",
    contractDate: "2006-12-01",
    dailyProduction: 200000,
    estimatedReserves: 1400,
    accumulatedInvestment: 7600,
    plannedInvestment: 8000,
    executionRate: 95,
    riskScore: 2,
    complianceScore: 94,
    mapPosition: { x: 14, y: 65 },
    productionHistory: [
      { month: "Jan", value: 195000 }, { month: "Feb", value: 197000 }, { month: "Mar", value: 198000 },
      { month: "Apr", value: 196000 }, { month: "May", value: 199000 }, { month: "Jun", value: 200000 },
      { month: "Jul", value: 198500 }, { month: "Aug", value: 200000 }, { month: "Sep", value: 197000 },
      { month: "Oct", value: 199000 }, { month: "Nov", value: 200500 }, { month: "Dec", value: 200000 },
    ],
    capexHistory: [
      { year: "2020", planned: 1450, actual: 1400 }, { year: "2021", planned: 1520, actual: 1470 },
      { year: "2022", planned: 1580, actual: 1530 }, { year: "2023", planned: 1650, actual: 1600 },
      { year: "2024", planned: 1700, actual: 1650 },
    ],
    projections: {
      conservative: [198000, 192000, 186000, 180000, 174000, 168000, 162000, 156000, 150000, 144000],
      base: [200000, 197000, 194000, 191000, 188000, 184000, 180000, 176000, 172000, 168000],
      expansion: [200000, 205000, 210000, 214000, 216000, 214000, 212000, 208000, 204000, 200000],
    },
  },
  {
    id: "block-16",
    name: "Block 16",
    operator: "TotalEnergies",
    partners: ["Sonangol", "China Sonangol"],
    basin: "Lower Congo",
    phase: "Exploration",
    contractDate: "2011-07-15",
    dailyProduction: 0,
    estimatedReserves: 320,
    accumulatedInvestment: 450,
    plannedInvestment: 1800,
    executionRate: 25,
    riskScore: 7,
    complianceScore: 72,
    mapPosition: { x: 22, y: 58 },
    productionHistory: Array(12).fill(null).map((_, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: 0 })),
    capexHistory: [
      { year: "2020", planned: 200, actual: 60 }, { year: "2021", planned: 300, actual: 80 },
      { year: "2022", planned: 350, actual: 100 }, { year: "2023", planned: 400, actual: 110 },
      { year: "2024", planned: 550, actual: 120 },
    ],
    projections: {
      conservative: [0, 0, 0, 5000, 10000, 15000, 18000, 20000, 22000, 24000],
      base: [0, 0, 5000, 15000, 30000, 45000, 55000, 60000, 62000, 64000],
      expansion: [0, 0, 10000, 25000, 45000, 65000, 80000, 90000, 95000, 98000],
    },
  },
  {
    id: "block-20",
    name: "Block 20",
    operator: "Sonangol E&P",
    partners: ["China Sonangol"],
    basin: "Kwanza",
    phase: "Exploration",
    contractDate: "2014-03-01",
    dailyProduction: 0,
    estimatedReserves: 180,
    accumulatedInvestment: 200,
    plannedInvestment: 1200,
    executionRate: 17,
    riskScore: 8,
    complianceScore: 65,
    mapPosition: { x: 28, y: 48 },
    productionHistory: Array(12).fill(null).map((_, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: 0 })),
    capexHistory: [
      { year: "2020", planned: 150, actual: 30 }, { year: "2021", planned: 200, actual: 35 },
      { year: "2022", planned: 250, actual: 40 }, { year: "2023", planned: 280, actual: 45 },
      { year: "2024", planned: 320, actual: 50 },
    ],
    projections: {
      conservative: [0, 0, 0, 0, 3000, 6000, 9000, 12000, 14000, 16000],
      base: [0, 0, 0, 5000, 12000, 20000, 28000, 34000, 38000, 40000],
      expansion: [0, 0, 5000, 12000, 22000, 35000, 45000, 52000, 58000, 62000],
    },
  },
  {
    id: "block-21",
    name: "Block 21",
    operator: "Equinor",
    partners: ["Sonangol", "BP"],
    basin: "Kwanza",
    phase: "Suspended",
    contractDate: "2007-05-20",
    dailyProduction: 0,
    estimatedReserves: 90,
    accumulatedInvestment: 380,
    plannedInvestment: 600,
    executionRate: 63,
    riskScore: 9,
    complianceScore: 55,
    mapPosition: { x: 32, y: 43 },
    productionHistory: Array(12).fill(null).map((_, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: 0 })),
    capexHistory: [
      { year: "2020", planned: 80, actual: 75 }, { year: "2021", planned: 80, actual: 70 },
      { year: "2022", planned: 80, actual: 65 }, { year: "2023", planned: 80, actual: 60 },
      { year: "2024", planned: 80, actual: 50 },
    ],
    projections: {
      conservative: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      base: [0, 0, 0, 0, 0, 3000, 5000, 7000, 8000, 9000],
      expansion: [0, 0, 0, 0, 5000, 10000, 15000, 18000, 20000, 22000],
    },
  },
  {
    id: "block-3",
    name: "Block 3",
    operator: "Sonangol P&P",
    partners: ["China Sonangol", "ENI"],
    basin: "Congo",
    phase: "Production",
    contractDate: "1990-01-15",
    dailyProduction: 68000,
    estimatedReserves: 350,
    accumulatedInvestment: 2200,
    plannedInvestment: 2400,
    executionRate: 92,
    riskScore: 4,
    complianceScore: 88,
    mapPosition: { x: 24, y: 60 },
    productionHistory: [
      { month: "Jan", value: 66000 }, { month: "Feb", value: 66500 }, { month: "Mar", value: 67000 },
      { month: "Apr", value: 67000 }, { month: "May", value: 67500 }, { month: "Jun", value: 68000 },
      { month: "Jul", value: 67500 }, { month: "Aug", value: 68000 }, { month: "Sep", value: 67000 },
      { month: "Oct", value: 67500 }, { month: "Nov", value: 68000 }, { month: "Dec", value: 68000 },
    ],
    capexHistory: [
      { year: "2020", planned: 420, actual: 400 }, { year: "2021", planned: 440, actual: 410 },
      { year: "2022", planned: 460, actual: 430 }, { year: "2023", planned: 480, actual: 460 },
      { year: "2024", planned: 500, actual: 480 },
    ],
    projections: {
      conservative: [66000, 63000, 60000, 57000, 54000, 51000, 48000, 45000, 42000, 39000],
      base: [68000, 66000, 64000, 62000, 60000, 58000, 56000, 54000, 52000, 50000],
      expansion: [68000, 70000, 72000, 73000, 74000, 73000, 72000, 70000, 68000, 66000],
    },
  },
  {
    id: "block-48",
    name: "Block 48",
    operator: "ENI",
    partners: ["Sonangol"],
    basin: "Namibe",
    phase: "Exploration",
    contractDate: "2019-06-01",
    dailyProduction: 0,
    estimatedReserves: 250,
    accumulatedInvestment: 120,
    plannedInvestment: 900,
    executionRate: 13,
    riskScore: 7,
    complianceScore: 70,
    mapPosition: { x: 16, y: 88 },
    productionHistory: Array(12).fill(null).map((_, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: 0 })),
    capexHistory: [
      { year: "2020", planned: 100, actual: 20 }, { year: "2021", planned: 150, actual: 25 },
      { year: "2022", planned: 200, actual: 30 }, { year: "2023", planned: 220, actual: 25 },
      { year: "2024", planned: 230, actual: 20 },
    ],
    projections: {
      conservative: [0, 0, 0, 0, 0, 4000, 8000, 12000, 15000, 18000],
      base: [0, 0, 0, 3000, 8000, 15000, 24000, 30000, 35000, 38000],
      expansion: [0, 0, 5000, 10000, 20000, 32000, 42000, 50000, 56000, 60000],
    },
  },
  {
    id: "block-1",
    name: "Block 1",
    operator: "Chevron",
    partners: ["Sonangol"],
    basin: "Lower Congo",
    phase: "Development",
    contractDate: "2010-11-20",
    dailyProduction: 22000,
    estimatedReserves: 420,
    accumulatedInvestment: 1600,
    plannedInvestment: 3200,
    executionRate: 50,
    riskScore: 6,
    complianceScore: 75,
    mapPosition: { x: 20, y: 70 },
    productionHistory: [
      { month: "Jan", value: 18000 }, { month: "Feb", value: 18500 }, { month: "Mar", value: 19000 },
      { month: "Apr", value: 19500 }, { month: "May", value: 20000 }, { month: "Jun", value: 20500 },
      { month: "Jul", value: 21000 }, { month: "Aug", value: 21000 }, { month: "Sep", value: 21500 },
      { month: "Oct", value: 21500 }, { month: "Nov", value: 22000 }, { month: "Dec", value: 22000 },
    ],
    capexHistory: [
      { year: "2020", planned: 300, actual: 200 }, { year: "2021", planned: 400, actual: 280 },
      { year: "2022", planned: 500, actual: 320 }, { year: "2023", planned: 600, actual: 400 },
      { year: "2024", planned: 700, actual: 450 },
    ],
    projections: {
      conservative: [22000, 28000, 34000, 38000, 42000, 44000, 46000, 47000, 47000, 46000],
      base: [22000, 32000, 45000, 58000, 70000, 78000, 84000, 88000, 88000, 86000],
      expansion: [22000, 38000, 55000, 72000, 88000, 100000, 108000, 112000, 112000, 110000],
    },
  },
  {
    id: "block-4-05",
    name: "Block 4/05",
    operator: "Sonangol P&P",
    partners: ["China Sonangol", "ENI"],
    basin: "Congo",
    phase: "Suspended",
    contractDate: "2005-08-10",
    dailyProduction: 0,
    estimatedReserves: 60,
    accumulatedInvestment: 290,
    plannedInvestment: 420,
    executionRate: 69,
    riskScore: 9,
    complianceScore: 48,
    mapPosition: { x: 26, y: 52 },
    productionHistory: Array(12).fill(null).map((_, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: 0 })),
    capexHistory: [
      { year: "2020", planned: 60, actual: 55 }, { year: "2021", planned: 60, actual: 50 },
      { year: "2022", planned: 60, actual: 45 }, { year: "2023", planned: 60, actual: 40 },
      { year: "2024", planned: 60, actual: 35 },
    ],
    projections: {
      conservative: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      base: [0, 0, 0, 0, 0, 2000, 4000, 5000, 6000, 6000],
      expansion: [0, 0, 0, 0, 3000, 6000, 9000, 11000, 13000, 14000],
    },
  },
];

// ── National Exploration Statistics (from ANPG reference data) ──

export interface SeismicData {
  year: number;
  seismic2D: number; // km
  seismic3D: number; // km²
  seismic4D: number; // km²
}

export interface WellsData {
  year: number;
  pesquisa: number; // exploration/research wells
  avaliacao: number; // appraisal wells
}

export const nationalStats = {
  seismicAcquired2D: 23816, // km
  seismicAcquired3D: 20583, // km²
  successRate: 41, // %
  totalExplorationWells: 372,
  pesquisaWells: 169,
  avaliacaoWells: 203,
  discoverySTOOIP: 21000, // MMBO
  undevelopedDiscoverySTOOIP: 403.5, // MMBO
  undevelopedDiscoveryGIIP: 5035.9, // BCF
  prospectiveSTOOIP: 3292.1, // MMBO
  prospectiveGIIP: 6179.7, // BCF
  geologicalObjectives: ["Albiano", "Toca", "Lucúla"],
  challenges: [
    "Alto índice de poços secos e custos operacionais elevados",
    "Baixa qualidade do dado sísmico",
    "Elevado número de descobertas não desenvolvidas",
    "Optimizar a Rocha Geradora Bucomazi como reservatório não convencional",
    "Exposição excessiva ao risco financeiro e falta de capital",
  ],
};

export const seismicHistory: SeismicData[] = [
  { year: 1960, seismic2D: 195, seismic3D: 0, seismic4D: 0 },
  { year: 1961, seismic2D: 600, seismic3D: 0, seismic4D: 0 },
  { year: 1962, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1963, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1964, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1965, seismic2D: 52, seismic3D: 0, seismic4D: 0 },
  { year: 1966, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1967, seismic2D: 2020, seismic3D: 0, seismic4D: 0 },
  { year: 1968, seismic2D: 1863, seismic3D: 0, seismic4D: 0 },
  { year: 1969, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1970, seismic2D: 910, seismic3D: 0, seismic4D: 0 },
  { year: 1971, seismic2D: 1704, seismic3D: 0, seismic4D: 0 },
  { year: 1972, seismic2D: 286, seismic3D: 0, seismic4D: 0 },
  { year: 1973, seismic2D: 92, seismic3D: 0, seismic4D: 0 },
  { year: 1974, seismic2D: 1202, seismic3D: 0, seismic4D: 0 },
  { year: 1975, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1976, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1977, seismic2D: 1380, seismic3D: 0, seismic4D: 0 },
  { year: 1978, seismic2D: 910, seismic3D: 0, seismic4D: 0 },
  { year: 1979, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1980, seismic2D: 680, seismic3D: 0, seismic4D: 0 },
  { year: 1981, seismic2D: 2572, seismic3D: 0, seismic4D: 0 },
  { year: 1982, seismic2D: 230, seismic3D: 0, seismic4D: 0 },
  { year: 1983, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1984, seismic2D: 3951, seismic3D: 0, seismic4D: 0 },
  { year: 1985, seismic2D: 1358, seismic3D: 0, seismic4D: 0 },
  { year: 1986, seismic2D: 1099, seismic3D: 0, seismic4D: 0 },
  { year: 1987, seismic2D: 241, seismic3D: 0, seismic4D: 0 },
  { year: 1988, seismic2D: 2070, seismic3D: 0, seismic4D: 0 },
  { year: 1989, seismic2D: 345, seismic3D: 0, seismic4D: 0 },
  { year: 1990, seismic2D: 240, seismic3D: 0, seismic4D: 0 },
  { year: 1991, seismic2D: 156, seismic3D: 0, seismic4D: 0 },
  { year: 1992, seismic2D: 92, seismic3D: 5240, seismic4D: 0 },
  { year: 1993, seismic2D: 0, seismic3D: 1489, seismic4D: 0 },
  { year: 1994, seismic2D: 0, seismic3D: 2751, seismic4D: 0 },
  { year: 1995, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1996, seismic2D: 0, seismic3D: 761, seismic4D: 0 },
  { year: 1997, seismic2D: 0, seismic3D: 224, seismic4D: 0 },
  { year: 1998, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 1999, seismic2D: 0, seismic3D: 829, seismic4D: 0 },
  { year: 2000, seismic2D: 0, seismic3D: 197, seismic4D: 0 },
  { year: 2001, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2002, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2003, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2004, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2005, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2006, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2007, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2008, seismic2D: 0, seismic3D: 4209, seismic4D: 0 },
  { year: 2009, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2010, seismic2D: 0, seismic3D: 3160, seismic4D: 0 },
  { year: 2011, seismic2D: 0, seismic3D: 0, seismic4D: 0 },
  { year: 2012, seismic2D: 0, seismic3D: 1050, seismic4D: 0 },
];

export const wellsHistory: WellsData[] = [
  { year: 1966, pesquisa: 5, avaliacao: 0 },
  { year: 1967, pesquisa: 9, avaliacao: 1 },
  { year: 1968, pesquisa: 7, avaliacao: 3 },
  { year: 1969, pesquisa: 14, avaliacao: 2 },
  { year: 1970, pesquisa: 4, avaliacao: 12 },
  { year: 1971, pesquisa: 10, avaliacao: 1 },
  { year: 1972, pesquisa: 4, avaliacao: 5 },
  { year: 1973, pesquisa: 1, avaliacao: 2 },
  { year: 1974, pesquisa: 0, avaliacao: 5 },
  { year: 1975, pesquisa: 0, avaliacao: 0 },
  { year: 1976, pesquisa: 5, avaliacao: 2 },
  { year: 1977, pesquisa: 0, avaliacao: 0 },
  { year: 1978, pesquisa: 5, avaliacao: 3 },
  { year: 1979, pesquisa: 0, avaliacao: 0 },
  { year: 1980, pesquisa: 7, avaliacao: 2 },
  { year: 1981, pesquisa: 7, avaliacao: 2 },
  { year: 1982, pesquisa: 5, avaliacao: 18 },
  { year: 1983, pesquisa: 8, avaliacao: 9 },
  { year: 1984, pesquisa: 7, avaliacao: 8 },
  { year: 1985, pesquisa: 6, avaliacao: 6 },
  { year: 1986, pesquisa: 2, avaliacao: 8 },
  { year: 1987, pesquisa: 10, avaliacao: 11 },
  { year: 1988, pesquisa: 10, avaliacao: 11 },
  { year: 1989, pesquisa: 5, avaliacao: 14 },
  { year: 1990, pesquisa: 3, avaliacao: 24 },
  { year: 1991, pesquisa: 8, avaliacao: 7 },
  { year: 1992, pesquisa: 8, avaliacao: 6 },
  { year: 1993, pesquisa: 6, avaliacao: 5 },
  { year: 1994, pesquisa: 5, avaliacao: 13 },
  { year: 1995, pesquisa: 5, avaliacao: 5 },
  { year: 1996, pesquisa: 10, avaliacao: 18 },
  { year: 1997, pesquisa: 0, avaliacao: 3 },
  { year: 1998, pesquisa: 0, avaliacao: 3 },
  { year: 1999, pesquisa: 0, avaliacao: 0 },
  { year: 2000, pesquisa: 2, avaliacao: 1 },
  { year: 2001, pesquisa: 0, avaliacao: 2 },
  { year: 2005, pesquisa: 0, avaliacao: 0 },
  { year: 2006, pesquisa: 3, avaliacao: 4 },
  { year: 2007, pesquisa: 3, avaliacao: 2 },
  { year: 2008, pesquisa: 2, avaliacao: 2 },
  { year: 2009, pesquisa: 0, avaliacao: 1 },
  { year: 2010, pesquisa: 2, avaliacao: 1 },
  { year: 2011, pesquisa: 0, avaliacao: 1 },
  { year: 2013, pesquisa: 2, avaliacao: 1 },
  { year: 2014, pesquisa: 0, avaliacao: 1 },
  { year: 2015, pesquisa: 0, avaliacao: 1 },
  { year: 2019, pesquisa: 1, avaliacao: 0 },
  { year: 2025, pesquisa: 0, avaliacao: 1 },
];

export const getBlocksByPhase = (phase: BlockPhase) => oilBlocks.filter(b => b.phase === phase);

export const getTotalProduction = () => oilBlocks.reduce((sum, b) => sum + b.dailyProduction, 0);

export const getTotalReserves = () => oilBlocks.reduce((sum, b) => sum + b.estimatedReserves, 0);

export const getActiveBlocks = () => oilBlocks.filter(b => b.phase !== "Suspended").length;

export const getTotalCapex = () => oilBlocks.reduce((sum, b) => sum + b.accumulatedInvestment, 0);

export const getAvgExecutionRate = () => {
  const active = oilBlocks.filter(b => b.phase !== "Suspended");
  return Math.round(active.reduce((sum, b) => sum + b.executionRate, 0) / active.length);
};

export const phaseColors: Record<BlockPhase, string> = {
  Exploration: "hsl(var(--exploration))",
  Development: "hsl(var(--development))",
  Production: "hsl(var(--production))",
  Suspended: "hsl(var(--suspended))",
};
