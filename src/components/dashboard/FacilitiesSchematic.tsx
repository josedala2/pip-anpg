import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GitBranch } from "lucide-react";

interface SchematicNode {
  id: string;
  label: string;
  type: "terminal" | "fixed" | "fpso" | "subsea";
  x: number;
  y: number;
  capacity: string;
  year: number;
  depth: number;
  status: string;
}

interface SchematicLink {
  from: string;
  to: string;
  type: "pipeline" | "flowline" | "subsea-tieback" | "export";
  label?: string;
}

const nodes: SchematicNode[] = [
  { id: "malongo", label: "Terminal Malongo", type: "terminal", x: 140, y: 260, capacity: "400.000 BOPD", year: 1968, depth: 0, status: "Operacional" },
  { id: "takula", label: "Takula", type: "fixed", x: 340, y: 120, capacity: "80.000 BOPD", year: 1971, depth: 60, status: "Operacional" },
  { id: "gip-fox", label: "GIP-FOX", type: "fixed", x: 340, y: 260, capacity: "35.000 BOPD", year: 1985, depth: 45, status: "Operacional" },
  { id: "maf-norte", label: "Mafumeira N.", type: "fixed", x: 340, y: 400, capacity: "100.000 BOPD", year: 2009, depth: 55, status: "Operacional" },
  { id: "maf-sul", label: "Mafumeira S.", type: "fixed", x: 500, y: 400, capacity: "50.000 BOPD", year: 2015, depth: 65, status: "Operacional" },
  { id: "sanha", label: "Sanha FPSO", type: "fpso", x: 580, y: 160, capacity: "100.000 BOPD", year: 2004, depth: 350, status: "Operacional" },
  { id: "sanha-lpg", label: "Sanha LPG", type: "fpso", x: 720, y: 100, capacity: "LPG Processing", year: 2005, depth: 350, status: "Operacional" },
  { id: "nembas", label: "Nembas FPSO", type: "fpso", x: 720, y: 260, capacity: "60.000 BOPD", year: 2010, depth: 400, status: "Operacional" },
  { id: "ek", label: "East Kwanza", type: "subsea", x: 620, y: 370, capacity: "30.000 BOPD", year: 2012, depth: 450, status: "Operacional" },
  { id: "wk", label: "West Kwanza", type: "subsea", x: 780, y: 370, capacity: "25.000 BOPD", year: 2014, depth: 480, status: "Operacional" },
];

const links: SchematicLink[] = [
  { from: "takula", to: "malongo", type: "pipeline", label: "Oil Export" },
  { from: "gip-fox", to: "malongo", type: "pipeline", label: "Oil Export" },
  { from: "maf-norte", to: "malongo", type: "pipeline", label: "Oil Export" },
  { from: "maf-sul", to: "maf-norte", type: "flowline" },
  { from: "sanha", to: "malongo", type: "export", label: "Oil Export" },
  { from: "sanha", to: "sanha-lpg", type: "flowline", label: "Gas/LPG" },
  { from: "nembas", to: "sanha", type: "flowline", label: "Gas Processing" },
  { from: "ek", to: "nembas", type: "subsea-tieback", label: "Subsea Tieback" },
  { from: "wk", to: "nembas", type: "subsea-tieback", label: "Subsea Tieback" },
];

const typeStyles: Record<string, { fill: string; stroke: string; badge: string }> = {
  terminal: { fill: "hsl(var(--primary) / 0.15)", stroke: "hsl(var(--primary))", badge: "Terminal Onshore" },
  fixed: { fill: "hsl(var(--success) / 0.15)", stroke: "hsl(var(--success))", badge: "Fixed Platform" },
  fpso: { fill: "hsl(var(--warning) / 0.15)", stroke: "hsl(var(--warning))", badge: "FPSO" },
  subsea: { fill: "hsl(280 65% 60% / 0.15)", stroke: "hsl(280 65% 60%)", badge: "Subsea Tieback" },
};

const linkStyles: Record<string, { stroke: string; dash?: string; width: number }> = {
  pipeline: { stroke: "hsl(var(--primary) / 0.6)", width: 2.5 },
  flowline: { stroke: "hsl(var(--success) / 0.5)", dash: "6 3", width: 1.5 },
  "subsea-tieback": { stroke: "hsl(280 65% 60% / 0.5)", dash: "4 4", width: 1.5 },
  export: { stroke: "hsl(var(--warning) / 0.6)", dash: "8 4", width: 2 },
};

const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

export const FacilitiesSchematic = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const isHighlighted = useCallback((nodeId: string) => {
    if (!hovered && !selected) return true;
    const active = selected || hovered;
    if (active === nodeId) return true;
    return links.some(l => (l.from === active && l.to === nodeId) || (l.to === active && l.from === nodeId));
  }, [hovered, selected]);

  const isLinkHighlighted = useCallback((link: SchematicLink) => {
    if (!hovered && !selected) return true;
    const active = selected || hovered;
    return link.from === active || link.to === active;
  }, [hovered, selected]);

  const selectedNode = selected ? nodeMap[selected] : null;

  return (
    <Card className="glass-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Diagrama Esquemático — Infraestrutura
          </CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(typeStyles).map(([key, s]) => (
              <Badge key={key} variant="outline" className="text-[9px] gap-1" style={{ borderColor: s.stroke, color: s.stroke }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.stroke }} />
                {s.badge}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col lg:flex-row gap-4">
          <TooltipProvider delayDuration={100}>
            <svg
              viewBox="0 0 900 480"
              className="w-full lg:flex-1 rounded-lg border border-border/30 bg-muted/20"
              style={{ minHeight: 320 }}
            >
              <defs>
                {/* Arrowhead markers per link type */}
                {Object.entries(linkStyles).map(([type, style]) => (
                  <marker
                    key={`arrow-${type}`}
                    id={`arrow-${type}`}
                    viewBox="0 0 10 6"
                    refX="9"
                    refY="3"
                    markerWidth="8"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 3 L 0 6 Z" fill={style.stroke} />
                  </marker>
                ))}
                {links.map((link, i) => {
                  const from = nodeMap[link.from];
                  const to = nodeMap[link.to];
                  const dx = to.x - from.x;
                  const midX = from.x + dx * 0.5;
                  const midY = (from.y + to.y) / 2 + (Math.abs(from.y - to.y) < 50 ? -30 : 0);
                  return (
                    <path
                      key={`path-${i}`}
                      id={`flow-path-${i}`}
                      d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                      fill="none"
                    />
                  );
                })}
              </defs>

              {/* Water depth bands */}
              <rect x="0" y="0" width="200" height="480" fill="hsl(var(--primary) / 0.03)" />
              <text x="100" y="468" textAnchor="middle" className="fill-muted-foreground" fontSize="9" opacity="0.5">ONSHORE</text>
              <rect x="200" y="0" width="250" height="480" fill="hsl(var(--primary) / 0.05)" />
              <text x="325" y="468" textAnchor="middle" className="fill-muted-foreground" fontSize="9" opacity="0.5">{"SHALLOW (<100m)"}</text>
              <rect x="450" y="0" width="450" height="480" fill="hsl(var(--primary) / 0.08)" />
              <text x="675" y="468" textAnchor="middle" className="fill-muted-foreground" fontSize="9" opacity="0.5">DEEP WATER (350-480m)</text>

              {/* Depth separator lines */}
              <line x1="200" y1="0" x2="200" y2="455" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              <line x1="450" y1="0" x2="450" y2="455" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

              {/* Links with flow particles */}
              {links.map((link, i) => {
                const from = nodeMap[link.from];
                const to = nodeMap[link.to];
                const style = linkStyles[link.type];
                const highlighted = isLinkHighlighted(link);
                const dx = to.x - from.x;
                const midX = from.x + dx * 0.5;
                const midY = (from.y + to.y) / 2 + (Math.abs(from.y - to.y) < 50 ? -30 : 0);
                const particleColor = link.type === "export" ? "hsl(var(--warning))" : link.type === "subsea-tieback" ? "hsl(280 65% 60%)" : link.type === "flowline" ? "hsl(var(--success))" : "hsl(var(--primary))";
                const dur = link.type === "export" ? "3s" : link.type === "pipeline" ? "4s" : "5s";
                return (
                  <g key={i} opacity={highlighted ? 1 : 0.15} style={{ transition: "opacity 0.25s" }}>
                    <path
                      d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={style.width}
                      strokeDasharray={style.dash}
                      markerEnd={`url(#arrow-${link.type})`}
                    />
                    {/* Flow particles */}
                    {highlighted && [0, 0.33, 0.66].map((offset, pi) => (
                      <circle key={pi} r={2.5} fill={particleColor} opacity="0.8">
                        <animateMotion
                          dur={dur}
                          repeatCount="indefinite"
                          begin={`${offset * parseFloat(dur)}s`}
                        >
                          <mpath href={`#flow-path-${i}`} />
                        </animateMotion>
                      </circle>
                    ))}
                    {link.label && highlighted && (
                      <text x={midX} y={midY - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="8" opacity="0.7">
                        {link.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const style = typeStyles[node.type];
                const highlighted = isHighlighted(node.id);
                const isActive = selected === node.id || hovered === node.id;
                const w = node.type === "terminal" ? 80 : 64;
                const h = 36;

                return (
                  <Tooltip key={node.id}>
                    <TooltipTrigger asChild>
                      <g
                        opacity={highlighted ? 1 : 0.2}
                        style={{ transition: "opacity 0.25s", cursor: "pointer" }}
                        onMouseEnter={() => setHovered(node.id)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setSelected(prev => prev === node.id ? null : node.id)}
                      >
                        {node.type === "fpso" ? (
                          <ellipse
                            cx={node.x}
                            cy={node.y}
                            rx={w / 2}
                            ry={h / 2}
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          />
                        ) : node.type === "subsea" ? (
                          <polygon
                            points={`${node.x},${node.y - h / 2} ${node.x + w / 2},${node.y} ${node.x},${node.y + h / 2} ${node.x - w / 2},${node.y}`}
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          />
                        ) : (
                          <rect
                            x={node.x - w / 2}
                            y={node.y - h / 2}
                            width={w}
                            height={h}
                            rx={6}
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          />
                        )}
                        <text
                          x={node.x}
                          y={node.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground"
                          fontSize="9"
                          fontWeight={isActive ? "700" : "500"}
                        >
                          {node.label}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs space-y-0.5">
                      <p className="font-semibold">{node.label}</p>
                      <p className="text-muted-foreground">{node.capacity} · {node.depth}m · {node.year}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </TooltipProvider>

          {/* Detail panel */}
          {selectedNode && (
            <div className="lg:w-56 space-y-3 rounded-lg border border-border/50 p-3 bg-card/50">
              <div>
                <Badge variant="outline" className="text-[9px] mb-1" style={{ borderColor: typeStyles[selectedNode.type].stroke, color: typeStyles[selectedNode.type].stroke }}>
                  {typeStyles[selectedNode.type].badge}
                </Badge>
                <h4 className="text-sm font-bold">{selectedNode.label}</h4>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Capacidade</span><span className="font-mono text-foreground">{selectedNode.capacity}</span></div>
                <div className="flex justify-between"><span>Instalação</span><span className="font-mono text-foreground">{selectedNode.year}</span></div>
                <div className="flex justify-between"><span>Prof. Água</span><span className="font-mono text-foreground">{selectedNode.depth}m</span></div>
                <div className="flex justify-between"><span>Estado</span><span className="text-success font-medium">{selectedNode.status}</span></div>
              </div>
              <div className="pt-2 border-t border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Conexões</p>
                {links
                  .filter(l => l.from === selectedNode.id || l.to === selectedNode.id)
                  .map((l, i) => {
                    const otherId = l.from === selectedNode.id ? l.to : l.from;
                    const other = nodeMap[otherId];
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: linkStyles[l.type].stroke }} />
                        <span>{other.label}</span>
                        {l.label && <span className="text-muted-foreground text-[9px]">({l.label})</span>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
