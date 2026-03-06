import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Sun, Moon, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

export const TopNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Utilizador";
  const displayCargo = profile?.cargo || "ANPG";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Red accent line at top */}
      <div className="h-1 bg-gradient-to-r from-anpg via-anpg-dark to-anpg" />

      <header className="h-16 flex items-center px-6 gap-5 bg-navbar text-navbar-foreground">
        {/* Sidebar trigger */}
        <SidebarTrigger className="text-navbar-foreground hover:bg-white/10 -ml-2" />

        {/* Logo + Separator + Title */}
        <Link to="/" className="flex items-center gap-4 shrink-0">
          <img src={anpgLogoWhite} alt="ANPG" className="h-10" />
          <div className="hidden md:block w-px h-10 bg-white/20" />
          <div className="hidden md:block">
            <h1 className="text-base font-bold leading-tight tracking-wide">
              Sistema de Gestão de Concessões
            </h1>
            <p className="text-[11px] text-white/50 leading-tight mt-0.5">
              Plataforma de Inteligência Petrolífera
            </p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-anpg rounded-full" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium leading-tight">{displayName}</p>
                  <p className="text-[10px] text-white/50 leading-tight">{displayCargo}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Terminar Sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
};
