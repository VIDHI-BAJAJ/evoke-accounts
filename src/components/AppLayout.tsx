import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { getAuthUser, logout } from "@/lib/auth";
import { toast } from "sonner";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/new": "Create Invoice",
  "/clients": "Clients",
  "/settings": "Settings",
};

export function AppLayout() {
  const location = useLocation();
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.includes("/edit") ? "Edit Invoice" : 
     location.pathname.includes("/invoices/") ? "Invoice Detail" :
     location.pathname.includes("/clients/") ? "Client Detail" : "");

  return (
    <div className="min-h-screen w-full bg-background">
      <AppSidebar />
      {/* Main content area that responds to sidebar */}
      <div className="md:ml-16 transition-[margin] duration-200">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{COMPANY.shortName}</span>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                AE
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
