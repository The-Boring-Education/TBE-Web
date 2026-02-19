import {
  Footer,
  LoadingSpinner,
  Navbar,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@tbe/components";
import { useUser } from "@tbe/hooks";
import { BrainCircuit, ClipboardList, FileText, Home, Target } from "lucide-react";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DASHBOARD_SIDEBAR_ITEMS = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Interview Sheets", icon: Target, href: "/dashboard/interview-prep" },
  { name: "DSA", icon: FileText, href: "/dashboard/dsa-prep" },
  { name: "Quizes", icon: ClipboardList, href: "/dashboard/quizzes" },
  { name: "Aptitude", icon: BrainCircuit, href: "/dashboard/aptitude" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { isAuth, loading } = useUser();

  // Centralized auth guard for all dashboard routes
  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [loading, isAuth, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loading && !isAuth) {
    return null;
  }

  return (
    <SidebarProvider>

      <Sidebar className="border-r border-gray-800">
        <SidebarContent className="pt-10">
          <SidebarMenu>
            {DASHBOARD_SIDEBAR_ITEMS.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  isActive={router.pathname === item.href}
                  className="text-gray-300 p-4 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#FF5757] data-[active=true]:text-white"
                  onClick={() => router.push(item.href)}
                >
                  {item.icon && <item.icon className="w-2 h-2" />}
                  <span className="ml-2">{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* SidebarInset is the scrollable main area to the right of the fixed sidebar */}
      <SidebarInset className="bg-[#0A0A0A] flex flex-col">
        <Navbar variant="oncampus" theme="dark" />
        <main className="flex-1 py-16 px-8 space-y-6">{children}</main>

        <div
          className="relative"
          style={{
            marginLeft: "calc(var(--sidebar-width) * -1)",
            width: "calc(100% + var(--sidebar-width))",
            zIndex: 20,
          }}
        >
          <Footer variant="oncampus" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
