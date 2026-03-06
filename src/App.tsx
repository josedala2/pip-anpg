import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import BlocosPage from "./pages/BlocosPage";
import ProducaoPage from "./pages/ProducaoPage";
import ExploracaoPage from "./pages/ExploracaoPage";
import RiskPage from "./pages/RiskPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import BlockPage from "./pages/BlockPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blocos" element={<BlocosPage />} />
              <Route path="/producao" element={<ProducaoPage />} />
              <Route path="/exploracao" element={<ExploracaoPage />} />
              <Route path="/risk" element={<RiskPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/block/:blockId" element={<BlockPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
