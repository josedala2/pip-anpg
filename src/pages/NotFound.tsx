import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="instruction-card max-w-md text-center">
        <div className="instruction-icon mx-auto mb-4">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h1 className="text-5xl font-bold text-anpg mb-2">404</h1>
        <p className="instruction-title text-lg mb-1">Página não encontrada</p>
        <p className="instruction-desc mb-6">
          O endereço <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{location.pathname}</code> não existe.
        </p>
        <Button variant="anpg" onClick={() => window.location.href = "/"} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
