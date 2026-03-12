import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export type AppRole = "admin" | "tecnico_dpro" | "tecnico_dex" | "tecnico_dneg" | "tecnico_dec" | "conselho";

// Permissions matrix: which panels each role can access
const PANEL_PERMISSIONS: Record<AppRole, string[]> = {
  admin: ["Overview", "Blocos & Concessões", "Produção", "Exploração & Sísmica", "Operadores", "Risk & Performance", "Strategic Forecast"],
  tecnico_dpro: ["Overview", "Blocos & Concessões", "Produção", "Operadores"],
  tecnico_dex: ["Overview", "Blocos & Concessões", "Exploração & Sísmica", "Operadores"],
  tecnico_dneg: ["Overview", "Blocos & Concessões", "Operadores", "Strategic Forecast"],
  tecnico_dec: ["Overview", "Blocos & Concessões", "Operadores", "Risk & Performance", "Strategic Forecast"],
  conselho: ["Overview", "Blocos & Concessões", "Produção", "Exploração & Sísmica", "Operadores", "Risk & Performance", "Strategic Forecast"],
};

// Report types each role can access
const REPORT_PERMISSIONS: Record<AppRole, string[]> = {
  admin: ["executive", "contractual", "exploration", "consortium", "legislation", "financial", "operators"],
  tecnico_dpro: ["executive", "contractual", "consortium", "operators"],
  tecnico_dex: ["executive", "exploration", "operators"],
  tecnico_dneg: ["executive", "contractual", "consortium", "legislation", "operators"],
  tecnico_dec: ["executive", "financial", "contractual", "operators"],
  conselho: ["executive", "contractual", "exploration", "consortium", "legislation", "financial", "operators"],
};

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  tecnico_dpro: "Técnico DPRO",
  tecnico_dex: "Técnico DEX",
  tecnico_dneg: "Técnico DNEG",
  tecnico_dec: "Técnico DEC",
  conselho: "Conselho de Adm.",
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_role", { _user_id: user.id });
      if (!error && data) {
        setRole(data as AppRole);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user?.id]);

  const hasAccessToPanel = (panelName: string): boolean => {
    if (!role) return false;
    return PANEL_PERMISSIONS[role]?.includes(panelName) ?? false;
  };

  const hasAccessToReportType = (reportType: string): boolean => {
    if (!role) return false;
    return REPORT_PERMISSIONS[role]?.includes(reportType) ?? false;
  };

  const allowedPanels = role ? PANEL_PERMISSIONS[role] : [];
  const allowedReportTypes = role ? REPORT_PERMISSIONS[role] : [];
  const roleLabel = role ? ROLE_LABELS[role] : "";

  return { role, roleLabel, loading, hasAccessToPanel, hasAccessToReportType, allowedPanels, allowedReportTypes };
}
