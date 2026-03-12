import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import anpgLogo from "@/assets/anpg-logo-color-v2.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";
import angolaSatellite from "@/assets/angola-coast-satellite.jpg";
import {
  Eye, EyeOff, LogIn, Shield, Factory, Search,
  Handshake, Scale, Crown, Fuel, Globe, BarChart3, GitCompareArrows
} from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Full background image */}
      <img
        src={angolaSatellite}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-stretch">
        {/* Left Hero */}
        <div className="lg:w-[55%] flex flex-col justify-between p-8 lg:p-14 xl:p-20">
          <img src={anpgLogoWhite} alt="ANPG" className="h-9 lg:h-12 w-fit" />

          <div className="space-y-6 max-w-xl mt-auto">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Inteligência Petrolífera
              </p>
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight">
                ANPG
                <br />
                <span className="text-primary">Concession</span>
                <br />
                Vision
              </h1>
              <p className="text-white/50 text-sm lg:text-base max-w-md leading-relaxed">
                Monitoria integrada de blocos, produção, exploração e indicadores estratégicos.
              </p>
            </div>
            <div className="flex items-center gap-10 pt-6 border-t border-white/10">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold shadow-lg w-fit"
            >
              <GitCompareArrows className="w-4 h-4" />
              Comparar Blocos — Acesso Livre
            </Link>
          </div>

          <p className="text-[11px] text-white/25 mt-8 lg:mt-12">
            © 2025 ANPG — Agência Nacional de Petróleo, Gás e Biocombustíveis
          </p>
        </div>

        {/* Right Login Panel */}
        <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/40 p-8 lg:p-10 space-y-7">
            <div className="space-y-1.5">
              <img src={anpgLogo} alt="ANPG" className="h-9 mb-5" />
              <h2 className="text-lg font-semibold text-card-foreground">Iniciar Sessão</h2>
              <p className="text-sm text-muted-foreground">
                Aceda ao painel de concessões da ANPG
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@anpg.co.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Palavra-passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors pr-10"
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
              <Button type="submit" className="w-full h-11 gap-2 font-medium mt-2" disabled={submitting || seeding}>
                <LogIn className="w-4 h-4" />
                {submitting ? "A entrar..." : "Entrar"}
              </Button>
            </form>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                Contas de Teste
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Test Accounts */}
            <div className="grid grid-cols-2 gap-1.5">
              {TEST_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isSelected = email === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleUseTestAccount(account)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs
                      ${isSelected
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                        : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium truncate">{account.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
