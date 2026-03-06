import type { OilBlock } from "@/data/angolaBlocks";

// ─── CSV HELPERS ──────────────────────────────────────────
const escapeCsv = (v: string | number | undefined) => {
  if (v == null) return "";
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
};

const toCsvRows = (headers: string[], rows: (string | number | undefined)[][]) => {
  const lines = [headers.map(escapeCsv).join(",")];
  rows.forEach(r => lines.push(r.map(escapeCsv).join(",")));
  return lines.join("\n");
};

// ─── BUILD SHEETS DATA ────────────────────────────────────
interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number | undefined)[][];
}

const buildSheetsForBlock = (block: OilBlock): SheetData[] => {
  const sheets: SheetData[] = [];
  const eco = block.economicData;

  // CAPEX History
  if (block.capexHistory.length > 0) {
    sheets.push({
      name: "CAPEX",
      headers: ["Ano", "Planeado ($M)", "Real ($M)"],
      rows: block.capexHistory.map(c => [c.year, c.planned, c.actual]),
    });
  }

  if (!eco) return sheets;

  // Cost History
  if (eco.costHistory && eco.costHistory.length > 0) {
    sheets.push({
      name: "Custos Históricos",
      headers: ["Período", "CAPEX (MMUSD)", "OPEX (MMUSD)", "Total (MMUSD)"],
      rows: eco.costHistory.map(c => [c.period, c.capex, c.opex, c.capex + c.opex]),
    });
  }

  // Investment Plan
  if (eco.investmentPlan && eco.investmentPlan.length > 0) {
    sheets.push({
      name: "Plano Investimentos",
      headers: ["Ano", "Exploração (MMUSD)", "Desenvolvimento (MMUSD)", "Operação (MMUSD)", "Total (MMUSD)"],
      rows: eco.investmentPlan.map(y => [y.year, y.exploracao, y.desenvolvimento, y.operacao, y.total]),
    });
  }

  // Production Share
  if (eco.productionShareGE && eco.productionShareGE.length > 0) {
    sheets.push({
      name: "Partilha Produção GE",
      headers: ["Ano", "MMBO"],
      rows: eco.productionShareGE.map(p => [p.year, p.mmbo]),
    });
  }

  // Abandonment & KPIs
  const kpiRows: (string | number | undefined)[][] = [];
  if (eco.abandonment) {
    kpiRows.push(["Custo Total Abandono (MMUSD)", eco.abandonment.total]);
    kpiRows.push(["Fundeamento Necessário (MMUSD)", eco.abandonment.fundingRequired]);
    kpiRows.push(["Fundeamento Depositado (MMUSD)", eco.abandonment.fundingDeposited]);
  }
  if (eco.opexPerBarrel != null) kpiRows.push([`OPEX/Barril (${eco.opexPerBarrelYear ?? ""})`, eco.opexPerBarrel]);
  if (eco.sonangolDebt != null) kpiRows.push(["Dívida Sonangol (MMUSD)", eco.sonangolDebt]);
  if (eco.stateRevenueShare) {
    eco.stateRevenueShare.forEach(s => kpiRows.push([`Receita Estado (${s.period})`, `${s.percentage}%`]));
  }
  if (kpiRows.length > 0) {
    sheets.push({ name: "KPIs Económicos", headers: ["Indicador", "Valor"], rows: kpiRows });
  }

  // Financial overview (investment, execution)
  sheets.push({
    name: "Resumo Financeiro",
    headers: ["Indicador", "Valor"],
    rows: [
      ["Investimento Acumulado ($M)", block.accumulatedInvestment],
      ["Investimento Planeado ($M)", block.plannedInvestment],
      ["Taxa de Execução (%)", block.executionRate],
      ["Score de Risco (1-10)", block.riskScore],
      ["Compliance (%)", block.complianceScore],
    ],
  });

  return sheets;
};

const buildSheetsForMultipleBlocks = (blocks: OilBlock[]): SheetData[] => {
  const sheets: SheetData[] = [];

  // Summary sheet
  sheets.push({
    name: "Resumo",
    headers: ["Bloco", "Operador", "Fase", "Produção (BOPD)", "Reservas (MMbbl)", "Investimento Acum. ($M)", "Investimento Plan. ($M)", "Execução (%)", "Risco", "Compliance (%)"],
    rows: blocks.map(b => [b.name, b.operator, b.phase, b.dailyProduction, b.estimatedReserves, b.accumulatedInvestment, b.plannedInvestment, b.executionRate, b.riskScore, b.complianceScore]),
  });

  // Aggregated CAPEX
  const capexMap: Record<string, { year: string; planned: number; actual: number }> = {};
  blocks.forEach(b => b.capexHistory.forEach(c => {
    if (!capexMap[c.year]) capexMap[c.year] = { year: c.year, planned: 0, actual: 0 };
    capexMap[c.year].planned += c.planned;
    capexMap[c.year].actual += c.actual;
  }));
  const capexRows = Object.values(capexMap).sort((a, b) => a.year.localeCompare(b.year));
  if (capexRows.length > 0) {
    sheets.push({
      name: "CAPEX Agregado",
      headers: ["Ano", "Planeado ($M)", "Real ($M)"],
      rows: capexRows.map(c => [c.year, c.planned, c.actual]),
    });
  }

  // Per-block economic data
  blocks.forEach(b => {
    if (b.economicData) {
      const blockSheets = buildSheetsForBlock(b);
      blockSheets.forEach(s => {
        sheets.push({ ...s, name: `${b.name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20)} - ${s.name}`.slice(0, 31) });
      });
    }
  });

  return sheets;
};

// ─── EXPORT FUNCTIONS ─────────────────────────────────────

export const exportToCsv = (blocks: OilBlock[], filename?: string) => {
  const sheets = blocks.length === 1 ? buildSheetsForBlock(blocks[0]) : buildSheetsForMultipleBlocks(blocks);
  
  // Combine all sheets into one CSV with section separators
  const sections = sheets.map(s => {
    return `--- ${s.name} ---\n${toCsvRows(s.headers, s.rows)}`;
  });

  const csv = sections.join("\n\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename || `financeiro_${blocks.map(b => b.id).join("_")}.csv`);
};

export const exportToExcel = async (blocks: OilBlock[], filename?: string) => {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const sheets = blocks.length === 1 ? buildSheetsForBlock(blocks[0]) : buildSheetsForMultipleBlocks(blocks);

  sheets.forEach(s => {
    const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
    // Auto-size columns
    const colWidths = s.headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...s.rows.map(r => String(r[i] ?? "").length));
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  });

  XLSX.writeFile(wb, filename || `financeiro_${blocks.map(b => b.id).join("_")}.xlsx`);
};

export { exportReportPdf as exportToPdf } from "@/lib/exportPdf";

// ─── UTIL ─────────────────────────────────────────────────
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
