import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/dashboard/ChartWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HSEIndicators, EnvironmentalYearData, FacilityData, EconomicVision, RevitalizationScenario } from "@/data/angolaBlocks";
import { ShieldCheck, Flame, Droplets, Wind, Factory, AlertTriangle, Lightbulb, TrendingDown } from "lucide-react";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

interface Props {
  hseData?: HSEIndicators[];
  environmentalData?: EnvironmentalYearData[];
  facilityData?: FacilityData;
  economicVision?: EconomicVision;
  revitalizationScenarios?: RevitalizationScenario[];
}

const NPV_COLORS = ["hsl(199, 89%, 48%)", "hsl(38, 92%, 50%)", "hsl(152, 69%, 40%)", "hsl(280, 65%, 60%)"];

export const HSEEnvironmentTab = ({ hseData, environmentalData, facilityData, economicVision, revitalizationScenarios }: Props) => {
  const hasHSE = hseData && hseData.length > 0;
  const hasEnv = environmentalData && environmentalData.length > 0;

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Facility Status */}
      {facilityData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-[9px] uppercase text-muted-foreground">Poços OP</div>
                <div className="text-2xl font-bold font-mono text-primary">{facilityData.activeWells.op}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-[9px] uppercase text-muted-foreground">Poços WI</div>
                <div className="text-2xl font-bold font-mono">{facilityData.activeWells.wi}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-[9px] uppercase text-muted-foreground">Poços GI</div>
                <div className="text-2xl font-bold font-mono">{facilityData.activeWells.gi}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-[9px] uppercase text-muted-foreground">Eficiência</div>
                <div className="text-2xl font-bold font-mono text-success">{facilityData.overallEfficiency}%</div>
              </CardContent>
            </Card>
            {facilityData.capacityBOPD && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Capacidade</div>
                  <div className="text-2xl font-bold font-mono">{(facilityData.capacityBOPD / 1000).toFixed(0)}k</div>
                  <div className="text-[9px] text-muted-foreground">BOPD</div>
                </CardContent>
              </Card>
            )}
            {facilityData.cumulativeProductionBO && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Prod. Acumulada</div>
                  <div className="text-lg font-bold font-mono">{(facilityData.cumulativeProductionBO / 1e9).toFixed(1)}B</div>
                  <div className="text-[9px] text-muted-foreground">BO</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilityData.areas.map(area => (
              <Card key={area.name} className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Factory className="w-4 h-4 text-primary" />{area.name}
                    </CardTitle>
                    <Badge variant="outline" className={area.efficiency >= 90 ? "text-success border-success/30" : "text-warning border-warning/30"}>
                      Eficiência: {area.efficiency}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {area.platforms.map(p => (
                      <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                  {area.issues && area.issues.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-warning" /> Desafios
                      </div>
                      {area.issues.map((issue, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4">› {issue}</p>
                      ))}
                    </div>
                  )}
                  {/* Efficiency bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${area.efficiency >= 90 ? "bg-success" : "bg-warning"}`}
                      style={{ width: `${area.efficiency}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {facilityData.productionStartYear && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Início Produção</div>
                  <div className="text-xl font-bold font-mono">{facilityData.productionStartYear}</div>
                </CardContent>
              </Card>
            )}
            {facilityData.endOfLifeYear && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Vida Útil Até</div>
                  <div className="text-xl font-bold font-mono">{facilityData.endOfLifeYear}</div>
                  {facilityData.endOfLifeField && <div className="text-[9px] text-muted-foreground">{facilityData.endOfLifeField}</div>}
                </CardContent>
              </Card>
            )}
            {facilityData.production2025Bbls && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Produção 2025</div>
                  <div className="text-lg font-bold font-mono">{(facilityData.production2025Bbls / 1e6).toFixed(1)}M</div>
                  <div className="text-[9px] text-muted-foreground">bbls</div>
                </CardContent>
              </Card>
            )}
            {facilityData.productionLossesBbls && (
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-[9px] uppercase text-muted-foreground">Perdas 2025</div>
                  <div className="text-lg font-bold font-mono text-danger">{(facilityData.productionLossesBbls / 1e6).toFixed(1)}M</div>
                  <div className="text-[9px] text-muted-foreground">bbls</div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* HSE Safety Table */}
      {hasHSE && (
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />Indicadores de Segurança (HSE)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Ano</TableHead>
                  {[
                    { label: "FAT", tip: "Fatality — Acidente com morte" },
                    { label: "LTI", tip: "Lost Time Injury — Acidente com tempo perdido" },
                    { label: "RWC", tip: "Restricted Work Case — Trabalho com restrição" },
                    { label: "MTC", tip: "Medical Treatment Case — Tratamento médico" },
                    { label: "FAC", tip: "First Aid Case — Primeiros socorros" },
                    { label: "NMI", tip: "Near Miss Incident — Quase-acidente" },
                    { label: "HHR (M)", tip: "Horas Homem Trabalhadas (Milhões)" },
                    { label: "TRIR", tip: "Total Recordable Incident Rate — Taxa total de incidentes registáveis" },
                    { label: "LTIR", tip: "Lost Time Incident Rate — Taxa de incidentes com tempo perdido" },
                  ].map(col => (
                    <TableHead key={col.label} className="text-xs text-center">
                      <TooltipProvider delayDuration={200}>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help border-b border-dashed border-muted-foreground/40">{col.label}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px] text-xs">
                            {col.tip}
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hseData.map(row => {
                  const allZero = row.fat === 0 && row.lti === 0 && row.rwc === 0 && row.mtc === 0 && row.fac === 0;
                  return (
                  <TableRow key={row.year} className={allZero ? "bg-success/5" : row.fat > 0 ? "bg-danger/5" : ""}>
                    <TableCell className="font-mono font-bold text-xs">{row.year}</TableCell>
                    <TableCell className={`text-center font-mono text-xs ${row.fat > 0 ? "text-danger font-bold bg-danger/10" : "text-success"}`}>{row.fat}</TableCell>
                    <TableCell className={`text-center font-mono text-xs ${row.lti > 0 ? "text-warning font-bold bg-warning/10" : "text-success"}`}>{row.lti}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.rwc}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.mtc}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.fac}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.nmi}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.hhr}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold">{row.trir.toFixed(2)}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{row.ltir.toFixed(2)}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {/* Color Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Legenda:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-success/20 border border-success/40" />
                <span className="text-[10px] text-muted-foreground">Zero incidentes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-warning/20 border border-warning/40" />
                <span className="text-[10px] text-muted-foreground">LTI (tempo perdido)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-danger/20 border border-danger/40" />
                <span className="text-[10px] text-muted-foreground">FAT (fatalidade)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TRIR trend chart */}
      {hasHSE && (
        <ChartWrapper title="Evolução TRIR & LTIR" height={280} fullscreenHeight={500}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="trir" name="TRIR" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} animationDuration={800} />
              <Line type="monotone" dataKey="ltir" name="LTIR" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" animationDuration={800} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {/* Environmental Charts */}
      {hasEnv && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
          {/* CO2 Emissions */}
          <ChartWrapper title="Emissões CO₂ (ton CO₂eq)" height={280} fullscreenHeight={500}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${(val / 1e6).toFixed(2)}M ton`, "CO₂eq"]} />
                <Bar dataKey="co2EmissionsTonCO2eq" name="CO₂" fill="hsl(var(--muted-foreground))" opacity={0.6} radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Gas Flaring */}
          <ChartWrapper title="Gás Queimado (MMSCFD)" height={280} fullscreenHeight={500}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="gasFlaredMMSCFD" name="Queimado" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} animationDuration={800} />
                <Line type="monotone" dataKey="gasFlaredTarget" name="Meta" stroke="hsl(152, 69%, 40%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Oil Spills */}
          <ChartWrapper title="Derrames de Óleo" height={280} fullscreenHeight={500}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="oilSpillCount" name="Contagem" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} animationDuration={800} />
                <Line yAxisId="right" type="monotone" dataKey="oilSpillVolumeBbl" name="Volume (bbl)" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Oil in Water PPM */}
          <ChartWrapper title="Concentração Óleo em Água (PPM)" height={280} fullscreenHeight={500}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 'auto']} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val} PPM`, "Óleo em Água"]} />
                <ReferenceLine y={5} stroke="hsl(var(--danger))" strokeDasharray="6 4" label={{ value: "Limite: 5 PPM", position: "insideTopRight", fill: "hsl(var(--danger))", fontSize: 10 }} />
                <Line type="monotone" dataKey="oilInWaterPPM" name="PPM" stroke="hsl(199, 89%, 48%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(199, 89%, 48%)" }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      )}

      {/* Economic Vision - NPV */}
      {economicVision && (
        <div className="space-y-4">
          <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-warning" />Visão Económica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {economicVision.npvFullcycle && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">NPV Fullcycle</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={economicVision.npvFullcycle}
                        cx="50%" cy="50%"
                        innerRadius="30%" outerRadius="50%"
                        dataKey="valueMM" nameKey="label"
                        label={false} labelLine={false}
                      >
                        {economicVision.npvFullcycle.map((_, i) => (
                          <Cell key={i} fill={NPV_COLORS[i % NPV_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val.toLocaleString()} MMUSD`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {economicVision.npvFullcycle.map((item, i) => (
                      <div key={item.label} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NPV_COLORS[i] }} />
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-mono font-bold">{item.valueMM.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {economicVision.npvPointForward && (
              <Card className="glass-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">NPV Point Forward</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={economicVision.npvPointForward}
                        cx="50%" cy="50%"
                        innerRadius="30%" outerRadius="50%"
                        dataKey="valueMM" nameKey="label"
                        label={false} labelLine={false}
                      >
                        {economicVision.npvPointForward.map((_, i) => (
                          <Cell key={i} fill={NPV_COLORS[i % NPV_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${val.toLocaleString()} MMUSD`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {economicVision.npvPointForward.map((item, i) => (
                      <div key={item.label} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NPV_COLORS[i] }} />
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-mono font-bold">{item.valueMM.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cash flow notes */}
          {economicVision.cashFlowNotes && economicVision.cashFlowNotes.length > 0 && (
            <Card className="glass-card border-l-2 border-danger">
              <CardContent className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-danger" /> Cash Flow
                </div>
                <ul className="space-y-1.5">
                  {economicVision.cashFlowNotes.map((note, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1" />{note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Strategic observations */}
          {economicVision.strategicObservations && economicVision.strategicObservations.length > 0 && (
            <Card className="glass-card border-l-2 border-warning">
              <CardContent className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-warning" /> Observações Estratégicas
                </div>
                <ul className="space-y-1.5">
                  {economicVision.strategicObservations.map((obs, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1" />{obs}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Revitalization Scenarios */}
      {revitalizationScenarios && revitalizationScenarios.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm 2xl:text-base font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />Cenários de Revitalização
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {revitalizationScenarios.map(scenario => (
              <Card key={scenario.id} className="glass-card hover:border-primary/30 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center border border-primary/30">
                      <span className="font-bold font-mono text-primary text-sm">{scenario.id}</span>
                    </div>
                    <CardTitle className="text-sm leading-tight">{scenario.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{scenario.description}</p>

                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Propostas</div>
                    <ul className="space-y-1">
                      {scenario.proposals.map((p, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {scenario.incentives && (
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-success font-medium mb-1">Incentivos</div>
                      <ul className="space-y-1">
                        {scenario.incentives.map((inc, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-success shrink-0 mt-1.5" />{inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {scenario.commitments && (
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-warning font-medium mb-1">Compromissos</div>
                      <ul className="space-y-1">
                        {scenario.commitments.map((c, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-warning shrink-0 mt-1.5" />{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasHSE && !hasEnv && !facilityData && !economicVision && !revitalizationScenarios && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Dados HSE & Ambiente não disponíveis para este bloco.</p>
            <p className="text-xs text-muted-foreground mt-1">Serão adicionados conforme disponibilização pela ANPG.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
