import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { oilBlocks } from "@/data/angolaBlocks";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/blocos": "Blocos & Concessões",
  "/producao": "Produção",
  "/exploracao": "Exploração & Sísmica",
  "/risk": "Risk & Performance",
  "/financeiro": "Financeiro",
  "/reports": "Relatórios",
  "/auditoria": "Auditoria",
  "/admin": "Administração",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === "/") return null;

  const segments = path.split("/").filter(Boolean);
  const crumbs: { label: string; path: string }[] = [
    { label: "Dashboard", path: "/" },
  ];

  let accumulated = "";
  for (const seg of segments) {
    accumulated += `/${seg}`;

    if (seg === "block") continue;

    const routeLabel = routeLabels[accumulated];
    if (routeLabel) {
      crumbs.push({ label: routeLabel, path: accumulated });
    } else if (segments[0] === "block" && segments.length === 2) {
      const block = oilBlocks.find((b) => b.id === seg);
      crumbs.push({ label: block?.name || seg, path: accumulated });
    }
  }

  return (
    <div className="flex items-center gap-1.5 px-4 md:px-6 lg:px-8 py-2 text-xs text-muted-foreground border-b border-border/30 bg-background">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.path} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
            {i === 0 && <Home className="w-3 h-3 mr-0.5" />}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
};
