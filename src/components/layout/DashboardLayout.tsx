import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { Breadcrumbs } from "./Breadcrumbs";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col w-full overflow-hidden">
        <TopNavbar />
        {/* Spacer for fixed navbar: red line (4px) + header (64px) = 68px */}
        <div className="shrink-0 h-[calc(0.25rem+4rem)]" />
        <div className="flex-1 flex w-full overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Breadcrumbs />
            <main className="flex-1 overflow-y-auto bg-background">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
