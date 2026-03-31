import {
  Home,
  Landmark,
  Award,
  Layers,
  BarChart3,
  Search,
  Building2,
  ShieldCheck,
  FileCheck,
  DollarSign,
  TrendingUp,
  LineChart,
  MapPin,
  Flame,
  Ship,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activePanel: number;
  onPanelChange: (index: number) => void;
  panels: string[];
}

const groups = [
  {
    label: "Governação",
    icon: Landmark,
    items: [
      { panel: "CA", icon: Landmark },
      { panel: "Homologações", icon: Award },
    ],
  },
  {
    label: "Operacional",
    icon: Layers,
    items: [
      { panel: "Concessões", icon: Layers },
      { panel: "Produção", icon: BarChart3 },
      { panel: "Exploração", icon: Search },
      { panel: "Instalações", icon: Building2 },
      { panel: "HSE & Ambiente", icon: ShieldCheck },
    ],
  },
  {
    label: "Negócios",
    icon: DollarSign,
    items: [
      { panel: "Contratos", icon: FileCheck },
      { panel: "Económico", icon: DollarSign },
    ],
  },
  {
    label: "Estratégia",
    icon: TrendingUp,
    items: [
      { panel: "Cenários", icon: TrendingUp },
      { panel: "Previsão Geral", icon: LineChart },
      { panel: "Previsão Nacional", icon: MapPin },
      { panel: "Gás Natural", icon: Flame },
      { panel: "Levantamentos", icon: Ship },
    ],
  },
];

export function AppSidebar({ activePanel, onPanelChange, panels }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const activeLabel = panels[activePanel];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 top-0 h-screen">
      <SidebarContent className="pt-2">
        {/* Home Executiva — always visible at top */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onPanelChange(panels.indexOf("Home Executiva"))}
              className={`px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeLabel === "Home Executiva"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              tooltip="Home Executiva"
            >
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Home Executiva</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Grouped sections */}
        {groups.map((group) => {
          const groupActive = group.items.some((item) => activeLabel === item.panel);

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">
                {!collapsed ? (
                  <span className="flex items-center gap-1.5">
                    <group.icon className="h-3 w-3" />
                    {group.label}
                  </span>
                ) : (
                  <group.icon className="h-3 w-3 mx-auto" />
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const idx = panels.indexOf(item.panel);
                    if (idx === -1) return null;
                    const isActive = activePanel === idx;

                    return (
                      <SidebarMenuItem key={item.panel}>
                        <SidebarMenuButton
                          onClick={() => onPanelChange(idx)}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          }`}
                          tooltip={item.panel}
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          {!collapsed && <span>{item.panel}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {/* Soba IA — always visible at bottom */}
        <SidebarMenu className="mt-auto pb-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onPanelChange(panels.indexOf("Soba"))}
              className={`px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeLabel === "Soba"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              tooltip="Soba (IA)"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Soba (IA)</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
