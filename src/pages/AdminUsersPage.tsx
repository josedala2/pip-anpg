import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Shield, Factory, Search, Handshake, Scale, Crown, Trash2, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, type AppRole } from "@/hooks/useUserRole";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  cargo: string;
  role: AppRole | null;
  role_id: string | null;
  created_at: string;
  last_sign_in: string | null;
}

const ROLES: { value: AppRole; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "admin", label: "Administrador", icon: <Shield className="w-3.5 h-3.5" />, color: "bg-destructive/10 text-destructive" },
  { value: "tecnico_dpro", label: "Técnico DPRO", icon: <Factory className="w-3.5 h-3.5" />, color: "bg-chart-2/10 text-chart-2" },
  { value: "tecnico_dex", label: "Técnico DEX", icon: <Search className="w-3.5 h-3.5" />, color: "bg-chart-5/10 text-chart-5" },
  { value: "tecnico_dneg", label: "Técnico DNEG", icon: <Handshake className="w-3.5 h-3.5" />, color: "bg-chart-3/10 text-chart-3" },
  { value: "tecnico_dec", label: "Técnico DEC", icon: <Scale className="w-3.5 h-3.5" />, color: "bg-chart-4/10 text-chart-4" },
  { value: "conselho", label: "Conselho de Adm.", icon: <Crown className="w-3.5 h-3.5" />, color: "bg-primary/10 text-primary" },
];

const AdminUsersPage = () => {
  const { theme } = useTheme();
  const { role, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers(data.users ?? []);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdatingId(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "update_role", user_id: userId, new_role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Role actualizado", description: `Role alterado para ${ROLES.find(r => r.value === newRole)?.label}` });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    setUpdatingId(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete_user", user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Utilizador removido", description: `${email} foi eliminado do sistema.` });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: AppRole | null) => {
    const r = ROLES.find(x => x.value === role);
    if (!r) return <Badge variant="outline" className="text-muted-foreground">Sem role</Badge>;
    return (
      <Badge variant="outline" className={`gap-1 ${r.color}`}>
        {r.icon} {r.label}
      </Badge>
    );
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <Shield className="w-16 h-16 text-muted-foreground/30" />
        <h1 className="text-xl font-bold">Acesso Restrito</h1>
        <p className="text-sm text-muted-foreground">Esta página é exclusiva para Administradores.</p>
        <Link to="/">
          <Button variant="outline">Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 border-t-4 border-t-primary">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-8 md:h-10"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                <span className="text-primary">Gestão de</span>
                <span className="text-foreground font-light ml-2">Utilizadores</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Administração • Roles & Permissões</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {ROLES.map(r => {
            const count = users.filter(u => u.role === r.value).length;
            return (
              <div key={r.value} className="rounded-xl border border-border bg-card p-3 text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${r.color} mb-1.5`}>
                  {r.icon}
                </div>
                <div className="text-lg font-bold text-foreground">{count}</div>
                <div className="text-[10px] text-muted-foreground font-medium leading-tight">{r.label}</div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Utilizador</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role Actual</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Alterar Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Último Acesso</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Acções</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum utilizador encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.user_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{u.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={u.role ?? ""}
                          onValueChange={(val) => handleRoleChange(u.user_id, val as AppRole)}
                          disabled={updatingId === u.user_id}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(r => (
                              <SelectItem key={r.value} value={r.value} className="text-xs">
                                <span className="flex items-center gap-1.5">{r.icon} {r.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {u.last_sign_in
                          ? new Date(u.last_sign_in).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Nunca"
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={updatingId === u.user_id}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar utilizador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que deseja eliminar <strong>{u.email}</strong>? Esta acção não pode ser revertida.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(u.user_id, u.email)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions matrix legend */}
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Matriz de Permissões por Role
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Painel</th>
                  {ROLES.map(r => (
                    <th key={r.value} className="text-center py-2 px-2 text-muted-foreground font-medium">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Overview", "Blocos & Concessões", "Produção", "Exploração & Sísmica", "Risk & Performance", "Strategic Forecast"].map(panel => (
                  <tr key={panel} className="border-b border-border/30">
                    <td className="py-2 px-3 font-medium text-foreground">{panel}</td>
                    {ROLES.map(r => {
                      const perms: Record<string, string[]> = {
                        admin: ["Overview", "Blocos & Concessões", "Produção", "Exploração & Sísmica", "Risk & Performance", "Strategic Forecast"],
                        tecnico_dpro: ["Overview", "Blocos & Concessões", "Produção"],
                        tecnico_dex: ["Overview", "Blocos & Concessões", "Exploração & Sísmica"],
                        tecnico_dneg: ["Overview", "Blocos & Concessões", "Strategic Forecast"],
                        tecnico_dec: ["Overview", "Blocos & Concessões", "Risk & Performance", "Strategic Forecast"],
                        conselho: ["Overview", "Blocos & Concessões", "Produção", "Exploração & Sísmica", "Risk & Performance", "Strategic Forecast"],
                      };
                      const has = perms[r.value]?.includes(panel);
                      return (
                        <td key={r.value} className="text-center py-2 px-2">
                          <span className={has ? "text-success font-bold" : "text-muted-foreground/40"}>
                            {has ? "✓" : "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
};

export default AdminUsersPage;
