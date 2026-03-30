import { type OilBlock } from "@/data/angolaBlocks";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  MapPin, Droplets, Calendar, DollarSign, Activity,
  Layers, Target, Users2, Factory, ShieldCheck,
} from "lucide-react";

interface BlockDetailRowProps {
  block: OilBlock;
  colSpan: number;
}

function DetailSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </div>
      <div className="text-sm text-muted-foreground space-y-1">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export function BlockDetailRow({ block, colSpan }: BlockDetailRowProps) {
  const es = block.explorationSummary;
  const hse = block.hseData?.length ? block.hseData[block.hseData.length - 1] : null;
  const fac = block.facilityData;

  return (
    <TableRow className="bg-muted/20 hover:bg-muted/20">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="px-6 py-5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* General Info */}
            <DetailSection icon={MapPin} title="Informação Geral">
              <DetailItem label="Bacia" value={block.basin} />
              <DetailItem label="Profundidade" value={block.waterDepth} />
              <DetailItem label="Faixa Profundidade" value={block.waterDepthRange} />
              <DetailItem label="Área" value={block.areaKm2 ? `${block.areaKm2.toLocaleString()} km²` : undefined} />
              <DetailItem label="Data Contrato" value={block.contractDate} />
              <DetailItem label="Tipo Contrato" value={block.contractInfo?.contractType} />
              <DetailItem label="Decreto-Lei" value={block.contractInfo?.decretoLei} />
            </DetailSection>

            {/* Production & Investment */}
            <DetailSection icon={Droplets} title="Produção & Investimento">
              <DetailItem label="Produção Diária" value={`${block.dailyProduction.toLocaleString()} BOPD`} />
              <DetailItem label="Reservas (STOOIP)" value={`${block.estimatedReserves.toLocaleString()} MMbbl`} />
              <DetailItem label="Reservas Actuais" value={block.currentReservesMMBO ? `${block.currentReservesMMBO} MMBO` : undefined} />
              <DetailItem label="Factor Recuperação" value={block.recoveryFactorPercent ? `${block.recoveryFactorPercent}%` : undefined} />
              <DetailItem label="Invest. Acumulado" value={`${block.accumulatedInvestment.toLocaleString()} MMUSD`} />
              <DetailItem label="Invest. Planeado" value={`${block.plannedInvestment.toLocaleString()} MMUSD`} />
              <DetailItem label="Taxa Execução" value={`${block.executionRate}%`} />
              <DetailItem label="Risco" value={`${block.riskScore}/10`} />
              <DetailItem label="Compliance" value={`${block.complianceScore}%`} />
            </DetailSection>

            {/* Exploration */}
            <DetailSection icon={Target} title="Exploração">
              <DetailItem label="Sísmica 2D" value={es?.totalSeismic2DKm ? `${es.totalSeismic2DKm.toLocaleString()} km` : undefined} />
              <DetailItem label="Sísmica 3D" value={es?.totalSeismic3DKm2 ? `${es.totalSeismic3DKm2.toLocaleString()} km²` : undefined} />
              <DetailItem label="Sísmica 4D" value={es?.totalSeismic4DKm2 ? `${es.totalSeismic4DKm2.toLocaleString()} km²` : undefined} />
              <DetailItem label="Poços Pesquisa" value={es?.totalWellsPesquisa} />
              <DetailItem label="Poços Avaliação" value={es?.totalWellsAvaliacao} />
              <DetailItem label="Desc. Comerciais" value={es?.commercialDiscoveries} />
              <DetailItem label="Desc. Não Comerciais" value={es?.nonCommercialDiscoveries} />
              <DetailItem label="Sucesso Geológico" value={es?.geologicalSuccessRate ? `${es.geologicalSuccessRate}%` : undefined} />
            </DetailSection>

            {/* HSE & Facilities */}
            <DetailSection icon={ShieldCheck} title="HSE & Facilidades">
              {hse ? (
                <>
                  <DetailItem label={`TRIR (${hse.year})`} value={hse.trir} />
                  <DetailItem label={`LTI (${hse.year})`} value={hse.lti} />
                  <DetailItem label={`LTIR (${hse.year})`} value={hse.ltir} />
                  <DetailItem label="Fatalidades" value={hse.fat} />
                </>
              ) : (
                <span className="text-xs italic">Sem dados HSE</span>
              )}
              {fac ? (
                <>
                  <DetailItem label="Eficiência" value={fac.overallEfficiency ? `${fac.overallEfficiency}%` : undefined} />
                  <DetailItem label="Capacidade" value={fac.capacityBOPD ? `${fac.capacityBOPD.toLocaleString()} BOPD` : undefined} />
                  <DetailItem label="Terminal" value={fac.terminalName} />
                </>
              ) : (
                <span className="text-xs italic">Sem dados facilidades</span>
              )}
            </DetailSection>
          </div>

          {/* Consortium */}
          {block.concession.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/50">
              <DetailSection icon={Users2} title="Consórcio">
                <div className="flex flex-wrap gap-1.5">
                  {block.concession.map(p => (
                    <Badge key={p.name} variant="outline" className="text-xs py-0.5 px-2">
                      {p.name} ({p.share}%){p.isOperator ? " ★" : ""}
                    </Badge>
                  ))}
                </div>
              </DetailSection>
            </div>
          )}

          {/* Fields */}
          {block.fields && block.fields.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <DetailSection icon={Layers} title="Campos / Descobertas">
                <div className="flex flex-wrap gap-1.5">
                  {block.fields.map(f => (
                    <Badge
                      key={f.name}
                      variant="outline"
                      className={`text-xs py-0.5 px-2 ${
                        f.status === "Producing" ? "border-emerald-500/40 text-emerald-400" :
                        f.status === "Development" ? "border-amber-500/40 text-amber-400" :
                        f.status === "Abandoned" ? "border-red-500/40 text-red-400" :
                        "border-cyan-500/40 text-cyan-400"
                      }`}
                    >
                      {f.name} · {f.status}{f.discoveryYear ? ` (${f.discoveryYear})` : ""}
                    </Badge>
                  ))}
                </div>
              </DetailSection>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
