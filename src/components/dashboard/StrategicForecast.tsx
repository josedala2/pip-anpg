import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { oilBlocks } from "@/data/angolaBlocks";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Scenario = "conservative" | "base" | "expansion";

const scenarios: { id: Scenario; label: string; color: string }[] = [
  { id: "conservative", label: "Conservative", color: "hsl(var(--danger))" },
  { id: "base", label: "Base", color: "hsl(var(--primary))" },
  { id: "expansion", label: "Expansion", color: "hsl(var(--success))" },
];

export const StrategicForecast = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>("base");

  // Aggregate projections across all blocks
  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
  const projectionData = years.map((year, i) => {
    const row: Record<string, number | string> = { year: year.toString() };
    for (const s of scenarios) {
      row[s.id] = oilBlocks.reduce((sum, b) => sum + (b.projections[s.id][i] || 0), 0);
    }
    return row;
  });

  const currentTotal = oilBlocks.reduce((s, b) => s + b.dailyProduction, 0);
  const projected = projectionData[4] as Record<string, number>;
  const fiscalMultiplier = 75; // $/barrel simplified

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="flex gap-2">
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeScenario === s.id
                ? "glass-card border border-primary/50 text-foreground glow-primary"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Projection Chart */}
      <Card className="glass-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">10-Year Production Projection (BOPD)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={60} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [value.toLocaleString() + " BOPD"]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {scenarios.map(s => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.color}
                  strokeWidth={activeScenario === s.id ? 3 : 1}
                  opacity={activeScenario === s.id ? 1 : 0.3}
                  dot={activeScenario === s.id}
                  name={s.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fiscal Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Current Output</div>
            <div className="text-2xl font-bold font-mono text-foreground">{(currentTotal / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-muted-foreground">BOPD</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">2029 Projection ({activeScenario})</div>
            <div className="text-2xl font-bold font-mono text-primary">
              {((projected[activeScenario] || 0) / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-muted-foreground">BOPD</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Est. Annual Revenue (2029)</div>
            <div className="text-2xl font-bold font-mono text-success">
              ${(((projected[activeScenario] || 0) * 365 * fiscalMultiplier) / 1e9).toFixed(1)}B
            </div>
            <div className="text-[10px] text-muted-foreground">at ${fiscalMultiplier}/bbl</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
