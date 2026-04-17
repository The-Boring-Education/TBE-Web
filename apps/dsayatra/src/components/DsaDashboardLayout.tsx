import {
  APP_DASHBOARD_SIDEBAR_BUTTON_CLASS,
  Footer,
  isDashboardSidebarLinkActive,
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
import {
  ClipboardList,
  FileText,
  Home,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface DsaDashboardLayoutProps {
  children: ReactNode;
}

export const DSA_DASHBOARD_SIDEBAR_ITEMS = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Sheets", icon: Target, href: "/sheets" },
  { name: "Revisions", icon: FileText, href: "/revisions" },
  { name: "Topics", icon: ClipboardList, href: "/topics" },
  {
    name: "Progress",
    icon: TrendingUp,
    href: "/dashboard#overall-progress",
  },
];

const DsaDashboardLayout = ({ children }: DsaDashboardLayoutProps) => {
  const router = useRouter();
  const { isAuth, loading } = useUser();
  const isPricingPage = router.pathname === "/pricing";

  useEffect(() => {
    if (isPricingPage) return;
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [loading, isAuth, router, isPricingPage]);

  if (!isPricingPage && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isPricingPage && !loading && !isAuth) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-gray-800">
        <SidebarContent className="pt-10">
          <SidebarMenu>
            {DSA_DASHBOARD_SIDEBAR_ITEMS.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  isActive={isDashboardSidebarLinkActive(
                    router.pathname,
                    router.asPath,
                    item.href,
                  )}
                  className={APP_DASHBOARD_SIDEBAR_BUTTON_CLASS}
                  onClick={() => router.push(item.href)}
                >
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                  <span className="ml-2">{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-[#0A0A0A] flex flex-col">
        <Navbar variant="dsayatra" theme="dark" />
        <main className="flex-1 py-16 px-8 space-y-6">{children}</main>

        <div
          className="relative"
          style={{
            marginLeft: "calc(var(--sidebar-width) * -1)",
            width: "calc(100% + var(--sidebar-width))",
            zIndex: 20,
          }}
        >
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DsaDashboardLayout;
