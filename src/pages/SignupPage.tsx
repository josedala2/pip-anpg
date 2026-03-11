import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Navigate } from "react-router-dom";
import anpgLogo from "@/assets/anpg-logo-color-v2.svg";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const SignupPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Conta criada! Verifique o seu email para confirmar.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md glass-card">
          <CardContent className="p-8 text-center space-y-4">
            <img src={anpgLogo} alt="ANPG" className="h-12 mx-auto" />
            <h2 className="text-xl font-bold">Verifique o seu email</h2>
            <p className="text-sm text-muted-foreground">
              Enviámos um link de confirmação para <strong>{email}</strong>.
              Clique no link para activar a sua conta.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4">Voltar ao login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-4">
          <img src={anpgLogo} alt="ANPG" className="h-12 mx-auto" />
          <CardTitle className="text-xl">Criar Conta</CardTitle>
          <p className="text-sm text-muted-foreground">
            Registe-se para aceder ao painel de concessões
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="João Silva"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@anpg.co.ao"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              <UserPlus className="w-4 h-4" />
              {submitting ? "A criar..." : "Criar conta"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Iniciar sessão
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
