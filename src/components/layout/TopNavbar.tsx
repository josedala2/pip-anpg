import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, User, Sun, Moon, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Concessões", path: "/blocos" },
  { label: "Produção", path: "/producao" },
  { label: "Relatórios", path: "/reports" },
];

export const TopNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { profile, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Utilizador";
  const displayCargo = profile?.cargo || "ANPG";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="h-14 flex items-center px-4 gap-4 border-b border-border/30 bg-navbar text-navbar-foreground shrink-0">
      {/* Sidebar trigger */}
      <SidebarTrigger className="text-navbar-foreground hover:bg-white/10 -ml-1" />

      {/* Logo + Title */}
      <Link to="/" className="flex items-center gap-3 shrink-0">
        <img src={anpgLogoWhite} alt="ANPG" className="h-8" />
        <div className="hidden md:block">
          <h1 className="text-sm font-bold leading-tight">Sistema de Gestão de Concessões</h1>
          <p className="text-[10px] text-white/60 leading-tight">Plataforma de Inteligência Petrolífera</p>
        </div>
      </Link>

      {/* Center nav links */}
      <nav className="hidden lg:flex items-center gap-1 ml-8">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || 
            (link.path !== "/" && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-white/50" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none w-32 lg:w-48"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-anpg rounded-full" />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium leading-tight">Administrador</p>
            <p className="text-[10px] text-white/50 leading-tight">ANPG</p>
          </div>
        </button>
      </div>
    </header>
  );
};
