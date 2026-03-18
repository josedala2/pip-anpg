export const InstitutionalFooter = () => {
  return (
    <footer className="border-t border-border/50 bg-card/60 backdrop-blur-sm print:hidden">
      <div className="max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ANPG — Todos os direitos reservados.
        </p>
        <p className="text-xs text-muted-foreground">
          Plataforma de Inteligência e Análise Petrolífera — Sistema Integrado de Monitoria, Análise e Apoio à Decisão
        </p>
      </div>
    </footer>
  );
};
