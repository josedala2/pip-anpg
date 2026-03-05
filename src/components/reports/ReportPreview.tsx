import { useMemo } from "react";
import { oilBlocks, type OilBlock } from "@/data/angolaBlocks";
import type { ReportConfig, ReportType } from "./ReportConfigurator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";

interface Props {
  config: ReportConfig;
}

const formatNumber = (n: number) => n.toLocaleString("pt-AO");
const formatUSD = (n: number) => `US$ ${formatNumber(n)}M`;

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

// ─── EXECUTIVE SUMMARY ────────────────────────────────────
const ExecutiveSection = ({ blocks, showTables }: { blocks: OilBlock[]; showTables: boolean }) => {
  const totals = useMemo(() => ({
    production: blocks.reduce((s, b) => s + b.dailyProduction, 0),
    reserves: blocks.reduce((s, b) => s + b.estimatedReserves, 0),
    investment: blocks.reduce((s, b) => s + b.accumulatedInvestment, 0),
    planned: blocks.reduce((s, b) => s + b.plannedInvestment, 0),
  }), [blocks]);

  return (
    <>
      <SectionTitle>Resumo Executivo</SectionTitle>
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
    {blocks.map(b => {
      const c = b.contractInfo;
      if (!c) return (
        <p key={b.id} className="text-sm text-muted-foreground mb-4">{b.name}: Sem dados contratuais disponíveis.</p>
      );
      return (
        <div key={b.id} className="mb-6 p-4 rounded-lg border border-border bg-card print:break-inside-avoid">
          <h3 className="text-sm font-semibold text-foreground mb-2">{b.name}</h3>
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
const ExplorationSection = ({ blocks, showTables }: { blocks: OilBlock[]; showTables: boolean }) => (
  <>
    <SectionTitle>Exploração & Produção</SectionTitle>
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

// ─── CONSORTIUM ───────────────────────────────────────────
const ConsortiumSection = ({ blocks, showTables }: { blocks: OilBlock[]; showTables: boolean }) => (
  <>
    <SectionTitle>Consórcio & Participações</SectionTitle>
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

// ─── DETAIL HELPER ────────────────────────────────────────
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="py-0.5">
    <span className="text-muted-foreground">{label}: </span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

// ─── MAIN REPORT PREVIEW ─────────────────────────────────
const reportTitles: Record<ReportType, string> = {
  executive: "Resumo Executivo",
  contractual: "Contractual & Fiscal",
  exploration: "Exploração & Produção",
  consortium: "Consórcio & Participações",
  legislation: "Legislação & Documentos",
};

export const ReportPreview = ({ config }: Props) => {
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

      {config.reportTypes.includes("executive") && (
        <ExecutiveSection blocks={blocks} showTables={config.includeTables} />
      )}
      {config.reportTypes.includes("contractual") && (
        <ContractualSection blocks={blocks} showTables={config.includeTables} />
      )}
      {config.reportTypes.includes("exploration") && (
        <ExplorationSection blocks={blocks} showTables={config.includeTables} />
      )}
      {config.reportTypes.includes("consortium") && (
        <ConsortiumSection blocks={blocks} showTables={config.includeTables} />
      )}
      {config.reportTypes.includes("legislation") && (
        <LegislationSection blocks={blocks} />
      )}
    </div>
  );
};
