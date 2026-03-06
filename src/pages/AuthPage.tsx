import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Mail, Lock, UserCircle, Briefcase } from "lucide-react";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    cargo: "Analista",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              cargo: form.cargo,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Conta criada!",
          description: "Verifique o seu email para confirmar a conta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargoOptions = ["Administrador", "Director", "Analista", "Engenheiro", "Gestor de Projecto", "Técnico"];

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[hsl(var(--navbar))] text-white flex-col justify-between p-10">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[hsl(var(--anpg)/0.15)] blur-3xl" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[hsl(var(--anpg)/0.1)] blur-3xl" />

        <div className="relative z-10">
          <img src={anpgLogoWhite} alt="ANPG" className="h-12 mb-2" />
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            ANPG<br />Concession Vision
          </h2>
          <p className="text-white/60 text-base max-w-sm leading-relaxed">
            Plataforma de Inteligência Petrolífera para gestão e monitorização de concessões em Angola.
          </p>
          <div className="flex gap-8 pt-4">
            {[
              { value: "55+", label: "Blocos" },
              { value: "15", label: "Operadores" },
              { value: "24/7", label: "Monitorização" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-[hsl(var(--anpg))]">{stat.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/30">
          © {new Date().getFullYear()} Agência Nacional de Petróleo, Gás e Biocombustíveis
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center lg:hidden mb-4">
            <img src={anpgLogoColor} alt="ANPG" className="h-14 mb-3" />
            <h1 className="text-lg font-bold text-foreground">ANPG Concession Vision</h1>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Introduza as suas credenciais para aceder à plataforma"
                : "Preencha os dados para se registar na plataforma"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nome Completo</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="João Silva"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Cargo / Função</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <select
                      value={form.cargo}
                      onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                    >
                      {cargoOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@anpg.co.ao"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="anpg" className="w-full h-11 text-sm font-semibold" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Iniciar Sessão" : "Criar Conta"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Não tem conta? "
                : "Já tem conta? "}
              <span className="font-medium text-[hsl(var(--anpg))] hover:underline">
                {isLogin ? "Registe-se" : "Inicie sessão"}
              </span>
            </button>
          </div>

          {/* Test credentials */}
          {isLogin && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acessos de Teste</p>
              {[
                { email: "admin@anpg.co.ao", password: "admin123", name: "Carlos Mendes", cargo: "Administrador" },
                { email: "analista@anpg.co.ao", password: "analista123", name: "Ana Sousa", cargo: "Analista" },
              ].map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, email: cred.email, password: cred.password });
                  }}
                  className="w-full flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-left hover:border-[hsl(var(--anpg)/0.5)] hover:bg-accent/50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{cred.name}</p>
                    <p className="text-xs text-muted-foreground">{cred.cargo} · {cred.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground group-hover:text-[hsl(var(--anpg))] transition-colors">
                    Usar →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
