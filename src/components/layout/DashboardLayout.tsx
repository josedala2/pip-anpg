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
      <div className="min-h-screen flex flex-col w-full">
        <TopNavbar />
        <div className="flex-1 flex w-full overflow-hidden [&>.group\/sidebar-wrapper]:min-h-0 [&>.group\/sidebar-wrapper]:flex-1">
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
