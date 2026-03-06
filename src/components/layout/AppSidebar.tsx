import {
  LayoutDashboard, Layers, Factory, DollarSign, ShieldCheck, FileText,
  Map, BarChart3, ClipboardList, Settings, ChevronDown,
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="pt-2">
        {/* Main Menu */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold px-3 mb-1">
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive(item.url)
                          ? "bg-anpg/10 text-anpg font-medium border-l-3 border-anpg"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive(item.url) ? "text-anpg" : ""}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold px-3 mb-1 mt-4">
              Administração
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive(item.url)
                          ? "bg-anpg/10 text-anpg font-medium border-l-3 border-anpg"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive(item.url) ? "text-anpg" : ""}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer branding */}
      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <img src={anpgLogoColor} alt="ANPG" className="h-6" />
            <div>
              <p className="text-[10px] font-semibold text-sidebar-foreground/80">ANPG</p>
              <p className="text-[9px] text-sidebar-foreground/50">Sector Petrolífero • Angola</p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
