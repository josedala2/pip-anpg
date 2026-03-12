import { useMemo } from "react";
import { exportToCsv, exportToExcel } from "@/lib/exportFinancial";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import type { ReportConfig, ReportType } from "./ReportConfigurator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";

const CHART_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))",
];

interface Props {
  config: ReportConfig;
  aiNarrative?: string | null;
  aiLoading?: boolean;
}

const formatNumber = (n: number) => n.toLocaleString("pt-AO");
const formatUSD = (n: number) => `US$ ${formatNumber(n)}M`;

// ─── DESCRIPTIVE TEXT HELPERS ─────────────────────────────
const Prose = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-foreground/90 leading-relaxed mb-4">{children}</p>
);

const generateExecutiveNarrative = (blocks: OilBlock[]) => {
  const totalProd = blocks.reduce((s, b) => s + b.dailyProduction, 0);
  const totalReserves = blocks.reduce((s, b) => s + b.estimatedReserves, 0);
  const totalInv = blocks.reduce((s, b) => s + b.accumulatedInvestment, 0);
  const producing = blocks.filter(b => b.phase === "Production");
  const exploring = blocks.filter(b => b.phase === "Exploration");
  const topProducer = [...blocks].sort((a, b) => b.dailyProduction - a.dailyProduction)[0];
  const avgRisk = blocks.length > 0 ? (blocks.reduce((s, b) => s + b.riskScore, 0) / blocks.length).toFixed(1) : "N/A";
  const avgCompliance = blocks.length > 0 ? Math.round(blocks.reduce((s, b) => s + b.complianceScore, 0) / blocks.length) : 0;

  return (
    <>
      <Prose>
        O conjunto de {blocks.length} blocos seleccionados totaliza uma produção diária de {formatNumber(totalProd)} BOPD,
        com reservas estimadas de {formatNumber(totalReserves)} milhões de barris e um investimento acumulado de {formatUSD(totalInv)}.
        {producing.length > 0 && ` ${producing.length} bloco${producing.length > 1 ? "s encontram-se" : " encontra-se"} em fase de produção activa.`}
        {exploring.length > 0 && ` ${exploring.length} bloco${exploring.length > 1 ? "s estão" : " está"} em fase de exploração.`}
      </Prose>
      {topProducer && topProducer.dailyProduction > 0 && (
        <Prose>
          O bloco com maior contribuição para a produção é o {topProducer.name}, operado pela {topProducer.operator},
          com {formatNumber(topProducer.dailyProduction)} BOPD ({((topProducer.dailyProduction / totalProd) * 100).toFixed(1)}% do total seleccionado).
          A pontuação média de risco do portfólio é de {avgRisk}/10, com uma taxa de compliance média de {avgCompliance}%.
        </Prose>
      )}
    </>
  );
};

const generateBlockDescription = (b: OilBlock) => {
  const parts: string[] = [];
  parts.push(`${b.name} é um bloco ${b.waterDepth.toLowerCase()} na Bacia ${b.basin}, operado pela ${b.operator}.`);
  if (b.areaKm2) parts.push(`Abrange uma área de ${formatNumber(b.areaKm2)} km².`);
  if (b.waterDepthRange) parts.push(`Profundidade de água: ${b.waterDepthRange}.`);
  if (b.geologicalObjectives && b.geologicalObjectives.length > 0) {
    parts.push(`Objectivos geológicos: ${b.geologicalObjectives.join(", ")}.`);
  }
  if (b.explorationSummary?.complexity && b.explorationSummary.complexity.length > 0) {
    parts.push(`Complexidade: ${b.explorationSummary.complexity.join(", ")}.`);
  }
  if (b.explorationSummary?.geologicalTargets) {
    parts.push(`Alvos geológicos: ${b.explorationSummary.geologicalTargets}.`);
  }
  return parts.join(" ");
};

const generateContractualNarrative = (blocks: OilBlock[]) => {
  const withContract = blocks.filter(b => b.contractInfo);
  const withBonus = withContract.filter(b => b.contractInfo!.signatureBonus || b.contractInfo!.socialBonus || b.contractInfo!.socialProjects);
  const totalSignature = withContract.reduce((s, b) => s + (b.contractInfo?.signatureBonus ?? 0), 0);
  const totalSocial = withContract.reduce((s, b) => s + (b.contractInfo?.socialProjects ?? 0) + (b.contractInfo?.socialBonus ?? 0), 0);

  if (withContract.length === 0) return null;

  return (
    <Prose>
      Dos {blocks.length} blocos analisados, {withContract.length} possuem dados contratuais detalhados.
      {withBonus.length > 0 && ` ${withBonus.length} bloco${withBonus.length > 1 ? "s têm" : " tem"} bónus registados, totalizando US$ ${formatNumber(totalSignature)} em bónus de assinatura e US$ ${formatNumber(totalSocial)} em contribuições sociais.`}
      {" "}Os contratos abrangem diferentes regimes fiscais, com variações no IRP, Cost Oil e períodos de pesquisa conforme detalhado abaixo.
    </Prose>
  );
};

const generateExplorationNarrative = (blocks: OilBlock[]) => {
  const withExploration = blocks.filter(b => b.explorationSummary);
  const totalWells = withExploration.reduce((s, b) => s + (b.explorationSummary?.totalWellsPesquisa ?? 0) + (b.explorationSummary?.totalWellsAvaliacao ?? 0), 0);
  const totalDiscoveries = withExploration.reduce((s, b) => s + (b.explorationSummary?.commercialDiscoveries ?? 0), 0);
  const totalFields = blocks.reduce((s, b) => s + (b.fields?.length ?? 0), 0);

  return (
    <Prose>
      A actividade exploratória nos blocos seleccionados compreende um total de {totalWells} poços perfurados
      {totalDiscoveries > 0 && `, resultando em ${totalDiscoveries} descoberta${totalDiscoveries > 1 ? "s comerciais" : " comercial"}`}.
      {totalFields > 0 && ` Foram identificados ${totalFields} campos/descobertas ao longo dos blocos analisados.`}
      {withExploration.length < blocks.length && ` ${blocks.length - withExploration.length} bloco${blocks.length - withExploration.length > 1 ? "s não possuem" : " não possui"} dados exploratórios detalhados.`}
    </Prose>
  );
};

const generateConsortiumNarrative = (blocks: OilBlock[]) => {
  const withInitial = blocks.filter(b => b.contractInfo?.initialConsortium);
  const operators = [...new Set(blocks.map(b => b.operator))];

  return (
    <Prose>
      Os {blocks.length} blocos seleccionados são operados por {operators.length} operador{operators.length > 1 ? "es distintos" : ""}: {operators.join(", ")}.
      {withInitial.length > 0 && ` ${withInitial.length} bloco${withInitial.length > 1 ? "s dispõem" : " dispõe"} de dados de evolução do grupo empreiteiro (GE Inicial → GE Actual), permitindo uma análise das mudanças de participação ao longo do tempo.`}
    </Prose>
  );
};

const generateLegislationNarrative = (blocks: OilBlock[]) => {
  const totalDocs = blocks.reduce((s, b) => s + (b.legislationDocs?.length ?? 0), 0);
  const types = new Set(blocks.flatMap(b => (b.legislationDocs ?? []).map(d => d.type)));

  if (totalDocs === 0) return null;
  return (
    <Prose>
      A base documental para os blocos seleccionados compreende {totalDocs} documento{totalDocs > 1 ? "s" : ""} legislativo{totalDocs > 1 ? "s" : ""},
      abrangendo as categorias: {[...types].join(", ")}.
      A tabela abaixo consolida todos os documentos por bloco, permitindo uma visão integrada do enquadramento legal e regulatório.
    </Prose>
  );
};

// ─── EXISTING COMPONENTS ─────────────────────────────────

const ReportHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between border-b border-border pb-4 mb-6 print:mb-4">
    <div className="flex items-center gap-3">
      <img src={anpgLogoColor} alt="ANPG" className="h-10 print:h-8" />
      <div>
        <h1 className="text-xl font-bold text-foreground print:text-lg">{title}</h1>
        <p className="text-xs text-muted-foreground">
          Gerado em {new Date().toLocaleDateString("pt-AO")} • ANPG — Agência Nacional de Petróleo, Gás e Biocombustíveis
        </p>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base font-semibold text-foreground mt-8 mb-3 pb-1 border-b border-border/50 print:break-before-auto">
    {children}
  </h2>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4 rounded-lg border border-border bg-card mb-4 print:break-inside-avoid">
    <p className="text-xs font-medium text-muted-foreground mb-3">{title}</p>
    {children}
  </div>
);

const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const gridStroke = "hsl(var(--border))";

// ─── EXECUTIVE SUMMARY ────────────────────────────────────
const ExecutiveSection = ({ blocks, showTables, showCharts }: { blocks: OilBlock[]; showTables: boolean; showCharts: boolean }) => {
  const totals = useMemo(() => ({
    production: blocks.reduce((s, b) => s + b.dailyProduction, 0),
    reserves: blocks.reduce((s, b) => s + b.estimatedReserves, 0),
    investment: blocks.reduce((s, b) => s + b.accumulatedInvestment, 0),
    planned: blocks.reduce((s, b) => s + b.plannedInvestment, 0),
  }), [blocks]);

  const productionData = useMemo(() =>
    blocks.filter(b => b.dailyProduction > 0).map(b => ({ name: b.name, value: b.dailyProduction })),
    [blocks]
  );

  const investmentData = useMemo(() =>
    blocks.map(b => ({ name: b.name, acumulado: b.accumulatedInvestment, planeado: b.plannedInvestment })),
    [blocks]
  );

  const capexData = useMemo(() => {
    const yearMap: Record<string, { year: string; planned: number; actual: number }> = {};
    blocks.forEach(b => b.capexHistory.forEach(c => {
      if (!yearMap[c.year]) yearMap[c.year] = { year: c.year, planned: 0, actual: 0 };
      yearMap[c.year].planned += c.planned;
      yearMap[c.year].actual += c.actual;
    }));
    return Object.values(yearMap).sort((a, b) => a.year.localeCompare(b.year));
  }, [blocks]);

  return (
    <>
      <SectionTitle>Resumo Executivo</SectionTitle>
      {generateExecutiveNarrative(blocks)}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Produção Total", value: `${formatNumber(totals.production)} BOPD` },
          { label: "Reservas Estimadas", value: `${formatNumber(totals.reserves)} MMbbl` },
          { label: "Investimento Acumulado", value: formatUSD(totals.investment) },
          { label: "Investimento Planeado", value: formatUSD(totals.planned) },
        ].map(kpi => (
          <div key={kpi.label} className="p-3 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-lg font-bold text-foreground mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {showCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {productionData.length > 0 && (
            <ChartCard title="Produção por Bloco (BOPD)">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={productionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} style={{ fontSize: 10 }}>
                    {productionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {investmentData.length > 0 && (
            <ChartCard title="Investimento por Bloco (M USD)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={investmentData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={axisStyle} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={axisStyle} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="acumulado" name="Acumulado" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planeado" name="Planeado" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {capexData.length > 0 && (
            <ChartCard title="CAPEX Agregado — Planeado vs Real (M USD)">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={capexData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="year" tick={axisStyle} />
                  <YAxis tick={axisStyle} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="planned" name="Planeado" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="actual" name="Real" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      {showTables && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bloco</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Fase</TableHead>
              <TableHead className="text-right">Produção (BOPD)</TableHead>
              <TableHead className="text-right">Reservas (MMbbl)</TableHead>
              <TableHead className="text-right">Investimento (M USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.operator}</TableCell>
                <TableCell>{b.phase}</TableCell>
                <TableCell className="text-right">{formatNumber(b.dailyProduction)}</TableCell>
                <TableCell className="text-right">{formatNumber(b.estimatedReserves)}</TableCell>
                <TableCell className="text-right">{formatNumber(b.accumulatedInvestment)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

// ─── CONTRACTUAL & FISCAL ─────────────────────────────────
const ContractualSection = ({ blocks, showTables }: { blocks: OilBlock[]; showTables: boolean }) => (
  <>
    <SectionTitle>Contractual & Fiscal</SectionTitle>
    {generateContractualNarrative(blocks)}
    {blocks.map(b => {
      const c = b.contractInfo;
      if (!c) return (
        <p key={b.id} className="text-sm text-muted-foreground mb-4">{b.name}: Sem dados contratuais disponíveis.</p>
      );
      return (
        <div key={b.id} className="mb-6 p-4 rounded-lg border border-border bg-card print:break-inside-avoid">
          <h3 className="text-sm font-semibold text-foreground mb-1">{b.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{generateBlockDescription(b)}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
            {c.decretoLei && <Detail label="Decreto-Lei" value={c.decretoLei} />}
            {c.contractType && <Detail label="Tipo de Contrato" value={c.contractType} />}
            {c.signingDate && <Detail label="Assinatura" value={c.signingDate} />}
            {c.effectiveDate && <Detail label="Data Efectiva" value={c.effectiveDate} />}
            {c.signatureBonus != null && <Detail label="Bónus Assinatura" value={`US$ ${formatNumber(c.signatureBonus)}`} />}
            {c.socialBonus != null && <Detail label="Bónus Social" value={`US$ ${formatNumber(c.socialBonus)}`} />}
            {c.socialProjects != null && <Detail label="Proj. Sociais" value={`US$ ${formatNumber(c.socialProjects)}`} />}
            {c.fiscalConditions?.irp != null && <Detail label="IRP" value={`${c.fiscalConditions.irp}%`} />}
            {c.fiscalConditions?.costRecoveryPreProd != null && <Detail label="Cost Oil (Pré)" value={`${c.fiscalConditions.costRecoveryPreProd}%`} />}
            {c.fiscalConditions?.costRecoveryPostProd != null && <Detail label="Cost Oil (Pós)" value={`${c.fiscalConditions.costRecoveryPostProd}%`} />}
          </div>
          {c.historicalNotes && c.historicalNotes.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notas:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                {c.historicalNotes.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    })}
  </>
);

// ─── EXPLORATION ──────────────────────────────────────────
const ExplorationSection = ({ blocks, showTables, showCharts }: { blocks: OilBlock[]; showTables: boolean; showCharts: boolean }) => {
  const prodHistoryData = useMemo(() => {
    if (!showCharts) return [];
    const monthMap: Record<string, Record<string, number>> = {};
    blocks.forEach(b => {
      b.productionHistory.slice(-12).forEach(p => {
        if (!monthMap[p.month]) monthMap[p.month] = {};
        monthMap[p.month][b.name] = p.value;
      });
    });
    return Object.entries(monthMap).map(([month, vals]) => ({ month, ...vals })).sort((a, b) => a.month.localeCompare(b.month));
  }, [blocks, showCharts]);

  const blockNames = blocks.map(b => b.name);

  return (
    <>
      <SectionTitle>Exploração & Produção</SectionTitle>
      {generateExplorationNarrative(blocks)}

      {/* Block descriptions */}
      {blocks.map(b => (
        <div key={b.id} className="mb-3 p-3 rounded-lg bg-secondary/30 print:break-inside-avoid">
          <p className="text-xs text-foreground/80 leading-relaxed">{generateBlockDescription(b)}</p>
        </div>
      ))}

      {showCharts && prodHistoryData.length > 0 && (
        <ChartCard title="Histórico de Produção — Últimos 12 Meses (BOPD)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={prodHistoryData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {blockNames.map((name, i) => (
                <Line key={name} type="monotone" dataKey={name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {showTables && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bloco</TableHead>
              <TableHead className="text-right">Sísmica 2D (km)</TableHead>
              <TableHead className="text-right">Sísmica 3D (km²)</TableHead>
              <TableHead className="text-right">Poços Pesquisa</TableHead>
              <TableHead className="text-right">Poços Avaliação</TableHead>
              <TableHead className="text-right">Descobertas</TableHead>
              <TableHead className="text-right">Taxa Sucesso (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map(b => {
              const e = b.explorationSummary;
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-right">{e?.totalSeismic2DKm != null ? formatNumber(e.totalSeismic2DKm) : "—"}</TableCell>
                  <TableCell className="text-right">{e?.totalSeismic3DKm2 != null ? formatNumber(e.totalSeismic3DKm2) : "—"}</TableCell>
                  <TableCell className="text-right">{e?.totalWellsPesquisa ?? "—"}</TableCell>
                  <TableCell className="text-right">{e?.totalWellsAvaliacao ?? "—"}</TableCell>
                  <TableCell className="text-right">{e?.commercialDiscoveries ?? "—"}</TableCell>
                  <TableCell className="text-right">{e?.geologicalSuccessRate != null ? `${e.geologicalSuccessRate}%` : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {blocks.filter(b => b.fields && b.fields.length > 0).map(b => (
        <div key={b.id} className="mt-4 p-4 rounded-lg border border-border bg-card print:break-inside-avoid">
          <h3 className="text-sm font-semibold text-foreground mb-2">{b.name} — Campos & Descobertas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {b.fields!.map(f => (
              <div key={f.name} className="text-sm">
                <span className="font-medium text-foreground">{f.name}</span>
                <span className="text-muted-foreground ml-2">({f.status})</span>
                {f.peakProduction != null && (
                  <span className="text-xs text-muted-foreground ml-1">• Pico: {formatNumber(f.peakProduction)} BOPD</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

// ─── CONSORTIUM ───────────────────────────────────────────
const ConsortiumSection = ({ blocks, showTables }: { blocks: OilBlock[]; showTables: boolean }) => (
  <>
    <SectionTitle>Consórcio & Participações</SectionTitle>
    {generateConsortiumNarrative(blocks)}
    {blocks.map(b => (
      <div key={b.id} className="mb-6 p-4 rounded-lg border border-border bg-card print:break-inside-avoid">
        <h3 className="text-sm font-semibold text-foreground mb-3">{b.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {b.contractInfo?.initialConsortium && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">GE Inicial</p>
              {b.contractInfo.initialConsortium.map(p => (
                <div key={p.name} className="flex justify-between text-sm py-0.5">
                  <span className="text-foreground">{p.name} {p.isOperator ? "(Op.)" : ""}</span>
                  <span className="text-muted-foreground font-mono">{p.share}%</span>
                </div>
              ))}
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">GE Actual</p>
            {b.concession.map(p => (
              <div key={p.name} className="flex justify-between text-sm py-0.5">
                <span className="text-foreground">{p.name} {p.isOperator ? "(Op.)" : ""}</span>
                <span className="text-muted-foreground font-mono">{p.share}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </>
);

// ─── LEGISLATION ──────────────────────────────────────────
const LegislationSection = ({ blocks }: { blocks: OilBlock[] }) => {
  const allDocs = blocks.flatMap(b =>
    (b.legislationDocs ?? []).map(d => ({ ...d, blockName: b.name }))
  );

  return (
    <>
      <SectionTitle>Legislação & Documentos</SectionTitle>
      {generateLegislationNarrative(blocks)}
      {allDocs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem documentos legislativos disponíveis para os blocos seleccionados.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bloco</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allDocs.map((d, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium whitespace-nowrap">{d.blockName}</TableCell>
                <TableCell className="capitalize whitespace-nowrap">{d.type}</TableCell>
                <TableCell>{d.title}</TableCell>
                <TableCell className="whitespace-nowrap">{d.date ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{d.description ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

// ─── FINANCIAL / ECONOMIC ─────────────────────────────────
const FinancialSection = ({ blocks, showTables, showCharts }: { blocks: OilBlock[]; showTables: boolean; showCharts: boolean }) => {
  const blocksWithEco = blocks.filter(b => b.economicData);

  return (
    <>
      <SectionTitle>Económico & Financeiro</SectionTitle>
      <Prose>
        {blocksWithEco.length > 0
          ? `${blocksWithEco.length} dos ${blocks.length} blocos seleccionados possuem dados económicos detalhados (custos, plano de investimentos, partilha de produção e abandono).`
          : `Nenhum dos blocos seleccionados possui dados económicos detalhados. Dados de CAPEX e investimento genéricos são apresentados abaixo.`}
      </Prose>

      {/* Export buttons */}
      <div className="flex gap-2 mb-4 print:hidden">
        <button
          onClick={() => exportToExcel(blocks, "relatorio_financeiro.xlsx")}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:bg-secondary transition-colors flex items-center gap-1.5"
        >
          📊 Exportar Excel
        </button>
        <button
          onClick={() => exportToCsv(blocks, "relatorio_financeiro.csv")}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:bg-secondary transition-colors flex items-center gap-1.5"
        >
          📋 Exportar CSV
        </button>
      </div>

      {blocksWithEco.map(b => {
        const eco = b.economicData!;
        return (
          <div key={b.id} className="mb-6 p-4 rounded-lg border border-border bg-card print:break-inside-avoid">
            <h3 className="text-sm font-semibold text-foreground mb-3">{b.name}</h3>

            {/* Cost History */}
            {showTables && eco.costHistory && eco.costHistory.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Custos Incorridos & Previsão (MMUSD)</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">CAPEX</TableHead>
                      <TableHead className="text-right">OPEX</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eco.costHistory.map(c => (
                      <TableRow key={c.period}>
                        <TableCell className="font-medium">{c.period}</TableCell>
                        <TableCell className="text-right">{formatNumber(c.capex)}</TableCell>
                        <TableCell className="text-right">{formatNumber(c.opex)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatNumber(c.capex + c.opex)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Investment Plan */}
            {showTables && eco.investmentPlan && eco.investmentPlan.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Plano de Investimentos Quinquenal (MMUSD)</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead className="text-right">Exploração</TableHead>
                      <TableHead className="text-right">Desenvolvimento</TableHead>
                      <TableHead className="text-right">Operação</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eco.investmentPlan.map(y => (
                      <TableRow key={y.year}>
                        <TableCell className="font-medium">{y.year}</TableCell>
                        <TableCell className="text-right">{formatNumber(y.exploracao)}</TableCell>
                        <TableCell className="text-right">{formatNumber(y.desenvolvimento)}</TableCell>
                        <TableCell className="text-right">{formatNumber(y.operacao)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatNumber(y.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Production Share */}
            {showTables && eco.productionShareGE && eco.productionShareGE.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Partilha de Produção GE (MMBO)</p>
                <div className="grid grid-cols-5 gap-2">
                  {eco.productionShareGE.map(p => (
                    <div key={p.year} className="text-center p-2 rounded-lg bg-secondary/30">
                      <div className="text-xs text-muted-foreground">{p.year}</div>
                      <div className="font-bold font-mono">{p.mmbo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {eco.abandonment && (
                <>
                  <div className="p-2 rounded-lg bg-secondary/30 text-center">
                    <div className="text-[9px] uppercase text-muted-foreground">Abandono Total</div>
                    <div className="font-bold font-mono text-sm">${formatNumber(eco.abandonment.total)}M</div>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30 text-center">
                    <div className="text-[9px] uppercase text-muted-foreground">Fundo Depositado</div>
                    <div className="font-bold font-mono text-sm">${formatNumber(eco.abandonment.fundingDeposited)}M</div>
                  </div>
                </>
              )}
              {eco.opexPerBarrel != null && (
                <div className="p-2 rounded-lg bg-secondary/30 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">OPEX/bbl ({eco.opexPerBarrelYear})</div>
                  <div className="font-bold font-mono text-sm">${eco.opexPerBarrel}</div>
                </div>
              )}
              {eco.sonangolDebt != null && (
                <div className="p-2 rounded-lg bg-secondary/30 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Dívida Sonangol</div>
                  <div className="font-bold font-mono text-sm">${formatNumber(eco.sonangolDebt)}M</div>
                </div>
              )}
            </div>

            {/* Observations */}
            {eco.observations && eco.observations.length > 0 && (
              <div className="mt-3 pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Observações Estratégicas:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                  {eco.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

// ─── DETAIL HELPER ────────────────────────────────────────
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="py-0.5">
    <span className="text-muted-foreground">{label}: </span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

// ─── AI NARRATIVE SECTION ─────────────────────────────────
const AINarrativeSection = ({ narrative, loading }: { narrative?: string | null; loading?: boolean }) => {
  if (loading) {
    return (
      <div className="mb-6 p-5 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-medium text-primary">A gerar sumário executivo com IA...</p>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-primary/10 rounded animate-pulse w-full" />
          <div className="h-3 bg-primary/10 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-primary/10 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (!narrative) return null;

  return (
    <div className="mb-6 p-5 rounded-lg border border-primary/20 bg-primary/5 print:break-inside-avoid">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Sumário Executivo — Análise IA</p>
      </div>
      {narrative.split("\n").filter(p => p.trim()).map((paragraph, i) => (
        <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-3 last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

// ─── MAIN REPORT PREVIEW ─────────────────────────────────
const reportTitles: Record<ReportType, string> = {
  executive: "Resumo Executivo",
  contractual: "Contractual & Fiscal",
  exploration: "Exploração & Produção",
  consortium: "Consórcio & Participações",
  legislation: "Legislação & Documentos",
  financial: "Económico & Financeiro",
  operators: "Operadores",
};

export const ReportPreview = ({ config, aiNarrative, aiLoading }: Props) => {
  const blocks = useMemo(
    () => oilBlocks.filter(b => config.selectedBlockIds.includes(b.id)),
    [config.selectedBlockIds]
  );

  const title = config.reportTypes.length === 1
    ? reportTitles[config.reportTypes[0]]
    : "Relatório Consolidado";

  return (
    <div id="report-content" className="bg-card rounded-xl border border-border p-6 md:p-8 print:p-4 print:border-none print:shadow-none print:rounded-none">
      <ReportHeader title={title} />

      <p className="text-sm text-muted-foreground mb-4">
        {blocks.length} bloco{blocks.length !== 1 ? "s" : ""} seleccionado{blocks.length !== 1 ? "s" : ""}: {blocks.map(b => b.name).join(", ")}
      </p>

      {/* AI Narrative at the top */}
      <AINarrativeSection narrative={aiNarrative} loading={aiLoading} />

      {config.reportTypes.includes("executive") && (
        <ExecutiveSection blocks={blocks} showTables={config.includeTables} showCharts={config.includeCharts} />
      )}
      {config.reportTypes.includes("contractual") && (
        <ContractualSection blocks={blocks} showTables={config.includeTables} />
      )}
      {config.reportTypes.includes("exploration") && (
        <ExplorationSection blocks={blocks} showTables={config.includeTables} showCharts={config.includeCharts} />
      )}
      {config.reportTypes.includes("consortium") && (
        <ConsortiumSection blocks={blocks} showTables={config.includeTables} />
      )}
      {config.reportTypes.includes("legislation") && (
        <LegislationSection blocks={blocks} />
      )}
      {config.reportTypes.includes("financial") && (
        <FinancialSection blocks={blocks} showTables={config.includeTables} showCharts={config.includeCharts} />
      )}
    </div>
  );
};
