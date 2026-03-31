import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GitBranch } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SchematicNode {
  id: string;
  label: string;
  type: "terminal" | "fixed" | "fpso" | "subsea" | "refinery";
  tier?: 1 | 2 | 3;
  area?: string;
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
  type: "crude" | "gas" | "water-injection" | "lpg" | "planned";
  label?: string;
}

interface AreaZone {
  id: string;
  label: string;
  x: number; y: number; w: number; h: number;
  rx?: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const nodes: SchematicNode[] = [
  // ── Terminal / Onshore ──
  { id: "terminal",      label: "Terminal Malongo",    type: "terminal", area: "Terminal",   x: 940, y: 80,  capacity: "400 000 BOPD", year: 1968, depth: 0,   status: "Operacional" },
  { id: "refinery",      label: "Cabinda Refinery",   type: "refinery", area: "Terminal",   x: 760, y: 50,  capacity: "N/D",          year: 1956, depth: 0,   status: "Operacional" },
  { id: "power-plant",   label: "Power Plant",        type: "refinery", area: "Terminal",   x: 960, y: 22,  capacity: "N/D",          year: 1970, depth: 0,   status: "Operacional" },
  { id: "futila",        label: "Futila Terminal",     type: "terminal", area: "Terminal",   x: 1090, y: 115, capacity: "SNL",         year: 2012, depth: 0,   status: "Operacional" },

  // ── Greater Taluka Area ──
  { id: "nsando",   label: "N'Sando",       type: "fixed", tier: 2, area: "Greater Taluka", x: 100, y: 65,  capacity: "6 000 BOPD",  year: 1996, depth: 40,  status: "Operacional" },
  { id: "ssanefa",  label: "Ssanefa",       type: "fixed", tier: 3, area: "Greater Taluka", x: 210, y: 50,  capacity: "3 000 BOPD",  year: 2000, depth: 35,  status: "Operacional" },
  { id: "barcala",  label: "Barcala",       type: "fixed", tier: 3, area: "Greater Taluka", x: 450, y: 55,  capacity: "4 000 BOPD",  year: 1999, depth: 42,  status: "Operacional" },
  { id: "mal-n",    label: "Malongo N.",    type: "fixed", tier: 2, area: "Greater Taluka", x: 340, y: 110, capacity: "12 000 BOPD", year: 1980, depth: 50,  status: "Operacional" },
  { id: "takula",   label: "Takula",        type: "fixed", tier: 1, area: "Greater Taluka", x: 290, y: 185, capacity: "80 000 BOPD", year: 1971, depth: 60,  status: "Operacional" },
  { id: "numbi",    label: "Numbi",         type: "fixed", tier: 3, area: "Greater Taluka", x: 490, y: 180, capacity: "5 000 BOPD",  year: 1986, depth: 55,  status: "Operacional" },
  { id: "lpa",      label: "LPA / TK4",     type: "fixed", tier: 3, area: "Greater Taluka", x: 120, y: 185, capacity: "3 500 BOPD",  year: 1990, depth: 48,  status: "Operacional" },
  { id: "gg",       label: "GG",            type: "fixed", tier: 3, area: "Greater Taluka", x: 460, y: 235, capacity: "4 000 BOPD",  year: 1988, depth: 52,  status: "Operacional" },

  // ── Greater Malongo Area ──
  { id: "gip",      label: "GIP",           type: "fixed", tier: 2, area: "Greater Malongo", x: 610, y: 200, capacity: "35 000 BOPD", year: 1985, depth: 45,  status: "Operacional" },
  { id: "mal-w",    label: "Malongo W.",    type: "fixed", tier: 3, area: "Greater Malongo", x: 570, y: 270, capacity: "8 000 BOPD",  year: 1982, depth: 50,  status: "Operacional" },
  { id: "mal-s",    label: "Malongo S.",    type: "fixed", tier: 2, area: "Greater Malongo", x: 700, y: 270, capacity: "15 000 BOPD", year: 1983, depth: 50,  status: "Operacional" },
  { id: "limba",    label: "Limba",         type: "fixed", tier: 2, area: "Greater Malongo", x: 700, y: 350, capacity: "10 000 BOPD", year: 1990, depth: 60,  status: "Operacional" },

  // ── Area B ──
  { id: "lomba",    label: "Lomba",         type: "fixed", tier: 1, area: "Area B", x: 90,  y: 330, capacity: "40 000 BOPD",  year: 1997, depth: 120, status: "Operacional" },
  { id: "nemba",    label: "Nemba",         type: "fixed", tier: 1, area: "Area B", x: 230, y: 315, capacity: "30 000 BOPD",  year: 2004, depth: 130, status: "Operacional" },
  { id: "vuko",     label: "Vuko",          type: "fixed", tier: 3, area: "Area B", x: 370, y: 310, capacity: "5 000 BOPD",   year: 2008, depth: 140, status: "Operacional" },
  { id: "kungulo",  label: "Kungulo",       type: "fixed", tier: 3, area: "Area B", x: 480, y: 345, capacity: "4 000 BOPD",   year: 2010, depth: 150, status: "Operacional" },
  { id: "bamboco",  label: "Bamboco",       type: "fixed", tier: 3, area: "Area B", x: 400, y: 430, capacity: "3 000 BOPD",   year: 2006, depth: 200, status: "Operacional" },
  { id: "kokongo",  label: "Kokongo",       type: "fixed", tier: 2, area: "Area B", x: 520, y: 440, capacity: "8 000 BOPD",   year: 2005, depth: 220, status: "Operacional" },

  // ── FPSO ──
  { id: "sanha",     label: "Sanha FPSO",   type: "fpso", tier: 1, area: "FPSO", x: 180, y: 490, capacity: "100 000 BOPD",    year: 2004, depth: 350, status: "Operacional" },
  { id: "sanha-lpg", label: "Sanha LPG",    type: "fpso",          area: "FPSO", x: 360, y: 510, capacity: "LPG Processing",   year: 2005, depth: 350, status: "Operacional" },

  // ── Mafumeira ──
  { id: "maf-n",    label: "Mafumeira N.",  type: "fixed", tier: 1, area: "Mafumeira", x: 800, y: 435, capacity: "100 000 BOPD", year: 2009, depth: 55,  status: "Operacional" },
  { id: "maf-s",    label: "Mafumeira S.",  type: "fixed", tier: 2, area: "Mafumeira", x: 930, y: 470, capacity: "50 000 BOPD",  year: 2015, depth: 65,  status: "Operacional" },
  { id: "lavuala",  label: "Lavuala",       type: "fixed", tier: 3, area: "Mafumeira", x: 820, y: 370, capacity: "5 000 BOPD",   year: 2014, depth: 60,  status: "Operacional" },
  { id: "livuite",  label: "Livuite",       type: "fixed", tier: 3, area: "Mafumeira", x: 950, y: 385, capacity: "4 000 BOPD",   year: 2016, depth: 62,  status: "Operacional" },

  // ── Exterior ──
  { id: "ndola",    label: "N'Dola",        type: "subsea",        area: "Exterior", x: 120, y: 590, capacity: "Angola LNG",    year: 2013, depth: 400, status: "Operacional" },
  { id: "bblt",     label: "BBLT (Blk 14)", type: "subsea",        area: "Exterior", x: 310, y: 590, capacity: "Tieback",       year: 2015, depth: 380, status: "Operacional" },
];

const links: SchematicLink[] = [
  // Greater Taluka → Terminal (crude)
  { from: "takula",  to: "terminal", type: "crude", label: "Crude Export" },
  { from: "nsando",  to: "takula",   type: "crude" },
  { from: "ssanefa", to: "takula",   type: "crude" },
  { from: "barcala", to: "mal-n",    type: "crude" },
  { from: "mal-n",   to: "takula",   type: "crude" },
  { from: "numbi",   to: "takula",   type: "crude" },
  { from: "lpa",     to: "takula",   type: "crude" },
  { from: "gg",      to: "numbi",    type: "crude" },

  // Greater Malongo → Terminal
  { from: "gip",     to: "terminal", type: "crude", label: "Crude Export" },
  { from: "mal-w",   to: "gip",     type: "crude" },
  { from: "mal-s",   to: "gip",     type: "crude" },
  { from: "limba",   to: "mal-s",   type: "crude" },

  // Mafumeira → Terminal
  { from: "maf-n",   to: "terminal", type: "crude", label: "Crude Export" },
  { from: "maf-s",   to: "maf-n",   type: "crude" },
  { from: "lavuala", to: "maf-n",   type: "crude" },
  { from: "livuite", to: "maf-s",   type: "crude" },

  // Area B → FPSO
  { from: "lomba",   to: "sanha",    type: "crude" },
  { from: "nemba",   to: "sanha",    type: "crude" },
  { from: "vuko",    to: "nemba",    type: "crude" },
  { from: "kungulo", to: "nemba",    type: "crude" },
  { from: "bamboco", to: "kokongo",  type: "crude" },
  { from: "kokongo", to: "sanha",    type: "crude" },

  // FPSO connections
  { from: "sanha",     to: "terminal",  type: "crude", label: "Oil Export" },
  { from: "sanha",     to: "sanha-lpg", type: "gas",   label: "Gas / LPG" },
  { from: "sanha-lpg", to: "futila",    type: "lpg",   label: "LPG Export" },

  // Gas pipelines
  { from: "takula",  to: "refinery",  type: "gas", label: "Gas" },
  { from: "gip",     to: "refinery",  type: "gas" },

  // Water injection
  { from: "terminal", to: "takula",   type: "water-injection", label: "WI" },
  { from: "terminal", to: "gip",      type: "water-injection" },

  // External
  { from: "ndola",   to: "sanha",    type: "gas",     label: "Angola LNG" },
  { from: "bblt",    to: "sanha",    type: "crude",   label: "Block 14 Tieback" },

  // Planned
  { from: "maf-n",   to: "sanha-lpg", type: "planned", label: "Futuro" },
];

const areaZones: AreaZone[] = [
  { id: "taluka",   label: "Greater Taluka Area",   x: 50,  y: 28,  w: 510, h: 230, rx: 18, color: "hsl(340 60% 60% / 0.10)" },
  { id: "malongo",  label: "Greater Malongo Area",  x: 535, y: 178, w: 220, h: 195, rx: 14, color: "hsl(210 60% 60% / 0.10)" },
  { id: "area-b",   label: "Area B",                x: 50,  y: 280, w: 530, h: 190, rx: 40, color: "hsl(170 50% 50% / 0.10)" },
  { id: "fpso",     label: "FPSO",                  x: 120, y: 465, w: 300, h: 70,  rx: 12, color: "hsl(210 50% 45% / 0.12)" },
  { id: "mafum",    label: "Mafumeira",             x: 770, y: 345, w: 240, h: 155, rx: 14, color: "hsl(270 50% 55% / 0.10)" },
  { id: "term",     label: "Terminal",               x: 710, y: 5,  w: 430, h: 140, rx: 14, color: "hsl(40 50% 50% / 0.10)" },
];

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const tierColors: Record<number, string> = {
  1: "hsl(var(--success))",
  2: "hsl(40 80% 55%)",
  3: "hsl(340 65% 60%)",
};

const nodeTypeStyles: Record<string, { fill: string; stroke: string; badge: string }> = {
  terminal: { fill: "hsl(var(--primary) / 0.15)", stroke: "hsl(var(--primary))", badge: "Terminal" },
  fixed:    { fill: "hsl(var(--muted) / 0.25)",   stroke: "hsl(var(--muted-foreground) / 0.5)", badge: "Plataforma" },
  fpso:     { fill: "hsl(var(--warning) / 0.15)",  stroke: "hsl(var(--warning))", badge: "FPSO" },
  subsea:   { fill: "hsl(280 65% 60% / 0.15)",     stroke: "hsl(280 65% 60%)", badge: "Subsea" },
  refinery: { fill: "hsl(var(--muted) / 0.15)",    stroke: "hsl(var(--muted-foreground))", badge: "Refinaria / Utilidade" },
};

const linkStyles: Record<string, { stroke: string; dash?: string; width: number }> = {
  crude:            { stroke: "hsl(var(--foreground) / 0.50)", width: 2 },
  gas:              { stroke: "hsl(140 60% 42% / 0.70)", width: 1.8 },
  "water-injection":{ stroke: "hsl(210 70% 55% / 0.60)", dash: "6 3", width: 1.5 },
  lpg:              { stroke: "hsl(0 65% 50% / 0.60)", width: 1.5 },
  planned:          { stroke: "hsl(0 65% 50% / 0.40)", dash: "4 4", width: 1.2 },
};

const legendItems = [
  { label: "Tier 1", color: tierColors[1], type: "circle" as const },
  { label: "Tier 2", color: tierColors[2], type: "circle" as const },
  { label: "Tier 3", color: tierColors[3], type: "circle" as const },
  { label: "Crude Oil", color: linkStyles.crude.stroke, type: "line" as const },
  { label: "Gás", color: linkStyles.gas.stroke, type: "line" as const },
  { label: "LPG", color: linkStyles.lpg.stroke, type: "line" as const },
  { label: "Water Inj.", color: linkStyles["water-injection"].stroke, type: "dash" as const },
  { label: "Planeado", color: linkStyles.planned.stroke, type: "dash" as const },
];

const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const FacilitiesSchematic = ({ renderAsContent = false }: { renderAsContent?: boolean }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const isPinching = useRef(false);
  const lastTapTime = useRef(0);

  const clampZoom = (z: number) => Math.min(Math.max(z, 1), 4);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        setZoom(prev => { if (prev > 1) { setPan({ x: 0, y: 0 }); return 1; } return 2.5; });
        lastTapTime.current = 0;
      } else { lastTapTime.current = now; }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null && lastTouchCenter.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / lastTouchDist.current;
      const center = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
      setPan(prev => ({ x: prev.x + center.x - lastTouchCenter.current!.x, y: prev.y + center.y - lastTouchCenter.current!.y }));
      setZoom(prev => clampZoom(prev * scale));
      lastTouchDist.current = dist;
      lastTouchCenter.current = center;
    }
  }, []);

  const handleTouchEnd = useCallback(() => { lastTouchDist.current = null; lastTouchCenter.current = null; setTimeout(() => { isPinching.current = false; }, 50); }, []);
  const handleWheel = useCallback((e: React.WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(prev => clampZoom(prev - e.deltaY * 0.005)); } }, []);
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

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

  /* ── Legend ── */
  const legendBar = (
    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
      {legendItems.map(item => (
        <Badge key={item.label} variant="outline" className="text-[7px] sm:text-[9px] gap-0.5 px-1 sm:px-1.5 py-0" style={{ borderColor: item.color, color: item.color }}>
          {item.type === "circle" && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block" style={{ background: item.color }} />}
          {item.type === "line" && <span className="w-3 h-[2px] inline-block" style={{ background: item.color }} />}
          {item.type === "dash" && <span className="w-3 h-[2px] inline-block border-t-2 border-dashed" style={{ borderColor: item.color }} />}
          {item.label}
        </Badge>
      ))}
    </div>
  );

  /* ── Render node shape ── */
  const renderNodeShape = (node: SchematicNode, isActive: boolean) => {
    const baseStyle = nodeTypeStyles[node.type];
    const tierColor = node.tier ? tierColors[node.tier] : undefined;
    const stroke = tierColor || baseStyle.stroke;
    const fill = tierColor ? `${tierColor.replace(")", " / 0.15)")}` : baseStyle.fill;
    const sw = isActive ? 2.5 : 1.5;
    const w = node.type === "terminal" || node.type === "refinery" ? 76 : 58;
    const h = 30;

    if (node.type === "fpso") {
      return <ellipse cx={node.x} cy={node.y} rx={w / 2} ry={h / 2} fill={fill} stroke={stroke} strokeWidth={sw} />;
    }
    if (node.type === "subsea") {
      return <polygon points={`${node.x},${node.y - h / 2} ${node.x + w / 2},${node.y} ${node.x},${node.y + h / 2} ${node.x - w / 2},${node.y}`} fill={fill} stroke={stroke} strokeWidth={sw} />;
    }
    return <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={5} fill={fill} stroke={stroke} strokeWidth={sw} />;
  };

  /* ── SVG content ── */
  const content = (
    <CardContent className="p-2 sm:p-4 pt-0">
      {renderAsContent && <div className="mb-2">{legendBar}</div>}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <TooltipProvider delayDuration={100}>
          <div className="w-full lg:flex-1 overflow-hidden rounded-lg border border-border/30 bg-muted/20 relative touch-none">
            {/* Zoom controls */}
            <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5">
              <button onClick={() => setZoom(prev => clampZoom(prev - 0.3))} disabled={zoom <= 1} className="text-xs sm:text-sm bg-background/80 backdrop-blur border border-border/50 rounded w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">−</button>
              <span className="text-[9px] sm:text-[10px] bg-background/80 backdrop-blur border border-border/50 rounded px-1.5 py-0.5 font-mono text-muted-foreground min-w-[2.5rem] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(prev => clampZoom(prev + 0.3))} disabled={zoom >= 4} className="text-xs sm:text-sm bg-background/80 backdrop-blur border border-border/50 rounded w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">+</button>
              {zoom > 1 && <button onClick={resetView} className="text-[9px] sm:text-[10px] bg-background/80 backdrop-blur border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground transition-colors ml-0.5">Reset</button>}
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 1180 630"
              className="w-full rounded-lg"
              style={{ minHeight: 220, transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: "center center", transition: isPinching.current ? "none" : "transform 0.15s ease-out" }}
              preserveAspectRatio="xMidYMid meet"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              <defs>
                {Object.entries(linkStyles).map(([type, style]) => (
                  <marker key={`arrow-${type}`} id={`arrow-${type}`} viewBox="0 0 10 6" refX="9" refY="3" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 3 L 0 6 Z" fill={style.stroke} />
                  </marker>
                ))}
                {links.map((link, i) => {
                  const from = nodeMap[link.from];
                  const to = nodeMap[link.to];
                  if (!from || !to) return null;
                  const dx = to.x - from.x;
                  const midX = from.x + dx * 0.5;
                  const midY = (from.y + to.y) / 2 + (Math.abs(from.y - to.y) < 50 ? -20 : 0);
                  return <path key={`def-${i}`} id={`flow-path-${i}`} d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`} fill="none" />;
                })}
              </defs>

              {/* Area zones */}
              {areaZones.map(z => (
                <g key={z.id}>
                  <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={z.rx ?? 10} fill={z.color} stroke={z.color.replace(/[\d.]+\)$/, "0.3)")} strokeWidth={1.2} />
                  <text x={z.x + z.w / 2} y={z.y + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="600" opacity="0.55">{z.label}</text>
                </g>
              ))}

              {/* Links */}
              {links.map((link, i) => {
                const from = nodeMap[link.from];
                const to = nodeMap[link.to];
                if (!from || !to) return null;
                const style = linkStyles[link.type];
                const highlighted = isLinkHighlighted(link);
                const dx = to.x - from.x;
                const midX = from.x + dx * 0.5;
                const midY = (from.y + to.y) / 2 + (Math.abs(from.y - to.y) < 50 ? -20 : 0);
                return (
                  <g key={`link-${i}`} opacity={highlighted ? 1 : 0.12} style={{ transition: "opacity 0.25s" }}>
                    <path d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`} fill="none" stroke={style.stroke} strokeWidth={style.width} strokeDasharray={style.dash} markerEnd={`url(#arrow-${link.type})`} />
                    {highlighted && [0, 0.33, 0.66].map((offset, pi) => (
                      <circle key={pi} r={2} fill={style.stroke} opacity="0.7">
                        <animateMotion dur="4s" repeatCount="indefinite" begin={`${offset * 4}s`}>
                          <mpath href={`#flow-path-${i}`} />
                        </animateMotion>
                      </circle>
                    ))}
                    {link.label && highlighted && <text x={midX} y={midY - 5} textAnchor="middle" className="fill-muted-foreground" fontSize="8" opacity="0.65">{link.label}</text>}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const highlighted = isHighlighted(node.id);
                const isActive = selected === node.id || hovered === node.id;
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
                        {renderNodeShape(node, isActive)}
                        <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" className="fill-foreground" fontSize="8.5" fontWeight={isActive ? "700" : "500"}>
                          {node.label}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs space-y-0.5">
                      <p className="font-semibold">{node.label}</p>
                      <p className="text-muted-foreground">{node.capacity} · {node.depth}m · {node.year}</p>
                      {node.tier && <p className="text-muted-foreground">Tier {node.tier} · {node.area}</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </div>
        </TooltipProvider>

        {/* Detail panel */}
        {selectedNode && (
          <div className="lg:w-56 space-y-2 sm:space-y-3 rounded-lg border border-border/50 p-2 sm:p-3 bg-card/50">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Badge variant="outline" className="text-[8px] sm:text-[9px]" style={{ borderColor: nodeTypeStyles[selectedNode.type].stroke, color: nodeTypeStyles[selectedNode.type].stroke }}>
                  {nodeTypeStyles[selectedNode.type].badge}
                </Badge>
                {selectedNode.tier && (
                  <Badge variant="outline" className="text-[8px] sm:text-[9px]" style={{ borderColor: tierColors[selectedNode.tier], color: tierColors[selectedNode.tier] }}>
                    Tier {selectedNode.tier}
                  </Badge>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold">{selectedNode.label}</h4>
              {selectedNode.area && <p className="text-[10px] text-muted-foreground">{selectedNode.area}</p>}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Capacidade</span><span className="font-mono text-foreground">{selectedNode.capacity}</span></div>
              <div className="flex justify-between"><span>Instalação</span><span className="font-mono text-foreground">{selectedNode.year}</span></div>
              <div className="flex justify-between"><span>Prof. Água</span><span className="font-mono text-foreground">{selectedNode.depth}m</span></div>
              <div className="flex justify-between"><span>Estado</span><span className="text-success font-medium">{selectedNode.status}</span></div>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-border/30">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Conexões</p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-0.5">
                {links
                  .filter(l => l.from === selectedNode.id || l.to === selectedNode.id)
                  .map((l, i) => {
                    const otherId = l.from === selectedNode.id ? l.to : l.from;
                    const other = nodeMap[otherId];
                    if (!other) return null;
                    return (
                      <div key={i} className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs py-0.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" style={{ background: linkStyles[l.type].stroke }} />
                        <span className="truncate">{other.label}</span>
                        {l.label && <span className="text-muted-foreground text-[8px] sm:text-[9px] hidden sm:inline">({l.label})</span>}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );

  if (renderAsContent) return content;

  return (
    <Card className="glass-card">
      <CardHeader className="p-2 sm:p-4 pb-1 sm:pb-2">
        <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="hidden sm:inline">Diagrama Esquemático — Infraestrutura</span>
            <span className="sm:hidden">Esquemático</span>
          </CardTitle>
          {legendBar}
        </div>
      </CardHeader>
      {content}
    </Card>
  );
};
