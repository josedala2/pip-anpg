import {
  LayoutDashboard, Layers, Factory, DollarSign, ShieldCheck,
  Map, BarChart3, ClipboardList, Settings, ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";

const mainMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Upstream", url: "/blocos", icon: Layers },
  { title: "Produção", url: "/producao", icon: Factory },
  { title: "Exploração", url: "/exploracao", icon: Map },
  { title: "Risk & Performance", url: "/risk", icon: ShieldCheck },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
];

const adminMenuItems = [
  { title: "Auditoria", url: "/auditoria", icon: ClipboardList },
  { title: "Administração", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-sidebar overflow-hidden">
      {/* Header with logo */}
      <SidebarHeader className="p-0">
        <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center px-2" : ""}`}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-anpg to-anpg-dark flex items-center justify-center shadow-lg shadow-anpg/20">
              <img src={anpgLogoColor} alt="ANPG" className="h-5 brightness-0 invert" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wide text-sidebar-foreground">
                Concession Vision
              </span>
              <span className="text-[10px] text-sidebar-foreground/40 font-medium">
                Plataforma Executiva
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mx-4 mb-3 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Menu */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.15em] text-sidebar-foreground/35 font-semibold px-3 mb-2">
              Navegação
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainMenuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-anpg/12 to-anpg/5 text-anpg shadow-sm"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                        activeClassName=""
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-anpg" />
                        )}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-anpg/15 shadow-sm shadow-anpg/10"
                            : "bg-transparent group-hover:bg-sidebar-accent"
                        }`}>
                          <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
                            active ? "text-anpg" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                          }`} />
                        </div>
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {active && (
                              <ChevronRight className="w-3.5 h-3.5 text-anpg/60" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        {!collapsed && (
          <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
        )}

        {/* Admin Menu */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.15em] text-sidebar-foreground/35 font-semibold px-3 mb-2">
              Sistema
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {adminMenuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-anpg/12 to-anpg/5 text-anpg shadow-sm"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                        activeClassName=""
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-anpg" />
                        )}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-anpg/15 shadow-sm shadow-anpg/10"
                            : "bg-transparent group-hover:bg-sidebar-accent"
                        }`}>
                          <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
                            active ? "text-anpg" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                          }`} />
                        </div>
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {active && (
                              <ChevronRight className="w-3.5 h-3.5 text-anpg/60" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      {!collapsed && (
        <SidebarFooter className="p-3 m-3 mt-auto rounded-xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/20 border border-sidebar-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-anpg/10 to-anpg/5 flex items-center justify-center">
              <img src={anpgLogoColor} alt="ANPG" className="h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-sidebar-foreground/80 truncate">
                ANPG Angola
              </p>
              <p className="text-[9px] text-sidebar-foreground/40 truncate">
                Sector Petrolífero
              </p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
