import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import anpgLogo from "@/assets/anpg-logo-color-v2.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";
import angolaSatellite from "@/assets/angola-satellite.jpg";
import {
  Eye, EyeOff, LogIn, Shield, Factory, Search,
  Handshake, Scale, Crown, Fuel, Globe, BarChart3
} from "lucide-react";

const TEST_ACCOUNTS = [
  { role: "Administrador", email: "admin@anpg.co.ao", password: "admin123", icon: Shield, color: "bg-red-500/10 text-red-400" },
  { role: "Técnico DPRO", email: "dpro@anpg.co.ao", password: "dpro123", icon: Factory, color: "bg-amber-500/10 text-amber-400" },
  { role: "Técnico DEX", email: "dex@anpg.co.ao", password: "dex123", icon: Search, color: "bg-cyan-500/10 text-cyan-400" },
  { role: "Técnico DNEG", email: "dneg@anpg.co.ao", password: "dneg123", icon: Handshake, color: "bg-emerald-500/10 text-emerald-400" },
  { role: "Técnico DEC", email: "dec@anpg.co.ao", password: "dec123", icon: Scale, color: "bg-violet-500/10 text-violet-400" },
  { role: "Conselho de Adm.", email: "conselho@anpg.co.ao", password: "conselho123", icon: Crown, color: "bg-yellow-500/10 text-yellow-400" },
];

const STATS = [
  { icon: Fuel, value: "1.1M", label: "Barris/dia" },
  { icon: Globe, value: "50+", label: "Blocos" },
  { icon: BarChart3, value: "15", label: "Operadoras" },
];

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const seedTestAccounts = async () => {
      const seeded = sessionStorage.getItem("test_accounts_seeded_v2");
      if (seeded) return;
      setSeeding(true);
      for (const account of TEST_ACCOUNTS) {
        await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: { data: { full_name: account.role, cargo: account.role } },
        });
      }
      await supabase.auth.signOut();
      sessionStorage.setItem("test_accounts_seeded_v2", "true");
      setSeeding(false);
    };
    seedTestAccounts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Credenciais inválidas. Verifique o email e a palavra-passe."
          : error.message
      );
    } else {
      toast.success("Sessão iniciada com sucesso");
      navigate("/");
    }
  };

  const handleUseTestAccount = (account: typeof TEST_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Full-screen background image */}
      <img
        src={angolaSatellite}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Left Hero Panel */}
      <div className="relative lg:w-[60%] min-h-[220px] lg:min-h-screen flex flex-col justify-end z-10">
        <div className="p-8 lg:p-16 space-y-6">
          <img src={anpgLogoWhite} alt="ANPG" className="h-10 lg:h-14" />
          <div className="space-y-3 max-w-lg">
            <h1 className="text-2xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
              Sistema de Gestão de Concessões Petrolíferas
            </h1>
            <p className="text-white/60 text-sm lg:text-base">
              Monitorização integrada de blocos, produção, exploração e indicadores estratégicos do sector petrolífero angolano.
            </p>
          </div>
          <div className="flex gap-8 pt-4 border-t border-white/10">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="relative lg:w-[40%] flex flex-col justify-center z-10 bg-gradient-to-r from-background/40 via-background/90 to-background backdrop-blur-xl">
        <div className="w-full max-w-md mx-auto px-6 py-10 lg:px-12 space-y-8">
          <div className="space-y-1">
            <img src={anpgLogo} alt="ANPG" className="h-10 mb-6" />
            <h2 className="text-xl font-semibold text-foreground">Iniciar Sessão</h2>
            <p className="text-sm text-muted-foreground">
              Aceda ao painel de concessões da ANPG
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@anpg.co.ao"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting || seeding}>
              <LogIn className="w-4 h-4" />
              {submitting ? "A entrar..." : "Entrar"}
            </Button>
          </form>

          {/* Test Accounts */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Acesso Rápido — Contas de Teste
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TEST_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isSelected = email === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleUseTestAccount(account)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all text-sm
                      ${isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border/50 hover:border-border hover:bg-accent/50'
                      }`}
                  >
                    <div className={`p-1.5 rounded-md ${account.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-xs truncate">{account.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center pt-4 border-t border-border/30">
            © 2025 ANPG — Agência Nacional de Petróleo, Gás e Biocombustíveis
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
